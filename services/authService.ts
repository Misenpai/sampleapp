// services/authService.ts
import axios from "axios";
import { notificationService } from "./pushNotificationService";
import { secureStorageService, SecureUserData } from "./secureStorageService";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE;

export interface AuthResponse {
  success: boolean;
  data?: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: {
      userKey: string;
      empCode: string;
      username: string;
      email: string;
      role: 'USER' | 'SYSTEM';
      location: string;
      userLocation?: {
        locationType: 'ABSOLUTE' | 'APPROX' | 'FIELDTRIP';
      };
    };
  };
  error?: string;
  message?: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  data?: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  error?: string;
}

class AuthService {
  private authToken: string | null = null;
  private tokenRefreshTimeout: NodeJS.Timeout | number | null = null;
  private sessionExpiryTimeout: NodeJS.Timeout | number | null = null;

  // Create axios instance with interceptors
  private apiClient = axios.create({
    baseURL: API_BASE,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  constructor() {
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.apiClient.interceptors.request.use(
      async (config) => {
        const tokens = await secureStorageService.getTokens();
        if (tokens?.accessToken) {
          config.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const original = error.config;

        if (error.response?.status === 401 && !original._retry) {
          original._retry = true;

          try {
            const refreshed = await this.refreshAccessToken();
            if (refreshed) {
              const tokens = await secureStorageService.getTokens();
              if (tokens?.accessToken) {
                original.headers.Authorization = `Bearer ${tokens.accessToken}`;
                return this.apiClient(original);
              }
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            await this.logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    try {
      const { data } = await this.apiClient.post('/auth/login', {
        username: username.trim(),
        password
      });

      console.log('Login response:', data);

      if (data.success && data.data) {
        // Store tokens securely
        await secureStorageService.storeTokens({
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken,
          expiresIn: data.data.expiresIn,
        });

        // Store user data
        const userData: SecureUserData = {
          userKey: data.data.user.userKey,
          empCode: data.data.user.empCode,
          username: data.data.user.username,
          email: data.data.user.email,
          role: data.data.user.role,
          location: data.data.user.location,
          userLocation: data.data.user.userLocation,
        };
        
        await secureStorageService.storeUserData(userData);

        // Set up session management
        this.setupSessionManagement(data.data.expiresIn);

        // Register device for push notifications
        await this.registerDeviceToken();

        this.authToken = data.data.accessToken;

        return {
          success: true,
          data: data.data,
          message: data.message
        };
      }

      return {
        success: false,
        error: data.error || "Login failed"
      };
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.response?.status === 401) {
        const errorMessage = error.response.data?.error || "Invalid username or password";
        return {
          success: false,
          error: errorMessage
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Login failed"
      };
    }
  }

  async refreshAccessToken(): Promise<boolean> {
    try {
      const tokens = await secureStorageService.getTokens();
      if (!tokens?.refreshToken) {
        throw new Error('No refresh token available');
      }

      const { data } = await axios.post(`${API_BASE}/auth/refresh`, {
        refreshToken: tokens.refreshToken
      });

      if (data.success && data.data) {
        await secureStorageService.updateTokens({
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken,
          expiresIn: data.data.expiresIn,
        });

        // Reset session management with new token
        this.setupSessionManagement(data.data.expiresIn);
        this.authToken = data.data.accessToken;

        console.log('Token refreshed successfully');
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Token refresh failed:', error);
      
      // If refresh fails, logout user
      if (error.response?.status === 401) {
        await this.logout();
      }
      
      return false;
    }
  }

  async logout(): Promise<void> {
    try {
      // Call logout endpoint
      await this.apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local data regardless of API call result
      await secureStorageService.clearAll();
      this.authToken = null;
      
      // Clear timers
      if (this.tokenRefreshTimeout) {
        clearTimeout(this.tokenRefreshTimeout);
        this.tokenRefreshTimeout = null;
      }
      
      if (this.sessionExpiryTimeout) {
        clearTimeout(this.sessionExpiryTimeout);
        this.sessionExpiryTimeout = null;
      }

      console.log('User logged out');
    }
  }

  async verifyToken(): Promise<boolean> {
    try {
      const tokens = await secureStorageService.getTokens();
      if (!tokens?.accessToken) {
        return false;
      }

      const { data } = await this.apiClient.get('/auth/verify');
      return data.success;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const isTokenValid = await secureStorageService.isTokenValid();
      if (!isTokenValid) {
        // Try to refresh token
        const refreshed = await this.refreshAccessToken();
        return refreshed;
      }
      return true;
    } catch (error) {
      console.error('Authentication check failed:', error);
      return false;
    }
  }

  async getUserData(): Promise<SecureUserData | null> {
    return await secureStorageService.getUserData();
  }

  async getAccessToken(): Promise<string | null> {
    const tokens = await secureStorageService.getTokens();
    return tokens?.accessToken || null;
  }

  private setupSessionManagement(expiresInSeconds: number): void {
    // Clear existing timers
    if (this.tokenRefreshTimeout) {
      clearTimeout(this.tokenRefreshTimeout);
    }
    if (this.sessionExpiryTimeout) {
      clearTimeout(this.sessionExpiryTimeout);
    }

    // Convert to milliseconds
    const expiresInMs = expiresInSeconds * 1000;
    
    // Schedule token refresh at 90% of expiry time
    const refreshTime = expiresInMs * 0.9;
    this.tokenRefreshTimeout = setTimeout(async () => {
      console.log('Auto-refreshing token...');
      await this.refreshAccessToken();
    }, refreshTime);

    // Schedule session expiry warning (5 minutes before expiry)
    const warningTime = Math.max(0, expiresInMs - 5 * 60 * 1000);
    if (warningTime > 0) {
      setTimeout(async () => {
        await notificationService.scheduleSessionExpiryReminder(5);
      }, warningTime);
    }

    // Schedule automatic logout at expiry
    this.sessionExpiryTimeout = setTimeout(async () => {
      console.log('Session expired, logging out...');
      await notificationService.sendLocalNotification(
        'Session Expired',
        'You have been logged out due to session expiry. Please login again.',
        { type: 'session_expired' }
      );
      await this.logout();
    }, expiresInMs);

    console.log(`Session management set up: expires in ${expiresInSeconds}s`);
  }

  private async registerDeviceToken(): Promise<void> {
    try {
      const pushTokenData = await notificationService.registerForPushNotifications();
      if (pushTokenData) {
        await this.apiClient.post('/notifications/register', {
          expoPushToken: pushTokenData.token,
          platform: pushTokenData.platform,
          deviceInfo: pushTokenData.deviceInfo,
        });
        console.log('Device registered for push notifications');
      }
    } catch (error) {
      console.error('Failed to register device token:', error);
    }
  }

  async getSessionTimeRemaining(): Promise<number> {
    return await secureStorageService.getTokenTimeRemaining();
  }
}

export const authService = new AuthService();