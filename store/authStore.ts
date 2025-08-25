// store/authStore.ts
import { Alert } from 'react-native';
import { create } from 'zustand';
import { authService } from '../services/authService';
import { notificationService } from '../services/pushNotificationService';
import { secureStorageService, SecureUserData } from '../services/secureStorageService';
import { useAttendanceStore } from './attendanceStore';

interface AuthState {
  isAuthenticated: boolean;
  user: SecureUserData | null;
  isLoading: boolean;
  isInitialized: boolean;

  sessionTimeRemaining: number;
  isSessionExpiring: boolean;
  sessionMonitorInterval: NodeJS.Timeout | number | null;

  session: string | null;
  userName: string | null;
  userId: string | null;
  userKey: string | null;

  signIn: (username: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  checkSessionStatus: () => Promise<void>;
  setLoading: (loading: boolean) => void;

  updateSessionTime: () => Promise<void>;
  handleSessionExpiry: () => Promise<void>;
  startSessionMonitoring: () => void;
  stopSessionMonitoring: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,
  isInitialized: false,
  sessionTimeRemaining: 0,
  isSessionExpiring: false,
  sessionMonitorInterval: null,

  get session() {
    const state = get();
    return state.user?.empCode || null;
  },

  get userName() {
    const state = get();
    return state.user?.username || null;
  },

  get userId() {
    const state = get();
    return state.user?.empCode || null;
  },

  get userKey() {
    const state = get();
    return state.user?.userKey || null;
  },

  initializeAuth: async () => {
    try {
      set({ isLoading: true });

      await notificationService.initialize();

      const tokens = await secureStorageService.getTokens();
      if (!tokens || !tokens.accessToken || !tokens.refreshToken) {
        set({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          isInitialized: true,
        });
        return;
      }

      const isTokenValid = await secureStorageService.isTokenValid();
      if (!isTokenValid) {
        console.log('Access token expired, attempting refresh...');
        const refreshSuccess = await get().refreshSession();

        if (!refreshSuccess) {
          await secureStorageService.clearAll();
          set({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            isInitialized: true,
          });
          return;
        }
      }

      const isAuth = await authService.verifyToken();
      if (isAuth) {
        const userData = await authService.getUserData();

        if (userData) {
          set({
            isAuthenticated: true,
            user: userData,
            isLoading: false,
            isInitialized: true,
          });

          useAttendanceStore.getState().setUserId(userData.username);

          get().startSessionMonitoring();
          return;
        }
      }

      await secureStorageService.clearAll();
      set({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        isInitialized: true,
      });

    } catch (error) {
      console.error('Auth initialization failed:', error);
      await secureStorageService.clearAll();
      set({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        isInitialized: true,
      });
    }
  },

  signIn: async (username: string, password: string): Promise<boolean> => {
    try {
      set({ isLoading: true });

      const response = await authService.login(username, password);

      if (response.success && response.data) {
        const userData: SecureUserData = response.data.user;

        set({
          isAuthenticated: true,
          user: userData,
          isLoading: false,
          sessionTimeRemaining: response.data.expiresIn,
        });

        useAttendanceStore.getState().setUserId(userData.username);

        if (userData.userLocation?.locationType) {
          useAttendanceStore.getState().setUserLocationType(
            userData.userLocation.locationType
          );
        }

        get().startSessionMonitoring();

        // 🔍 Debug token storage
        const debugTokenStorage = async () => {
          const tokens = await secureStorageService.getTokens();
          console.log('DEBUG: Tokens after login:', {
            hasAccessToken: !!tokens?.accessToken,
            hasRefreshToken: !!tokens?.refreshToken,
            accessTokenLength: tokens?.accessToken?.length,
            refreshTokenLength: tokens?.refreshToken?.length,
            expiresIn: tokens?.expiresIn,
            tokenAge: tokens ? Date.now() - tokens.tokenTimestamp : 'N/A'
          });
        };
        await debugTokenStorage();

        Alert.alert('Success', 'Logged in successfully!');
        return true;

      } else {
        set({ isLoading: false });
        Alert.alert('Login Failed', response.error || 'Unknown error');
        return false;
      }

    } catch (error) {
      console.error('Login error:', error);
      set({ isLoading: false });
      Alert.alert('Error', 'Unexpected error during login');
      return false;
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true });
      await authService.logout();
      set({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        sessionTimeRemaining: 0,
        isSessionExpiring: false,
      });
      useAttendanceStore.getState().clearUserId();
      get().stopSessionMonitoring();
    } catch (error) {
      console.error('Logout error:', error);
      set({ isLoading: false });
    }
  },

  refreshSession: async (): Promise<boolean> => {
    try {
      const refreshed = await authService.refreshAccessToken();
      if (refreshed) {
        const sessionTime = await authService.getSessionTimeRemaining();
        set({
          sessionTimeRemaining: sessionTime,
          isSessionExpiring: sessionTime < 300,
        });
        return true;
      } else {
        await get().handleSessionExpiry();
        return false;
      }
    } catch (error) {
      console.error('Session refresh failed:', error);
      await get().handleSessionExpiry();
      return false;
    }
  },

  checkSessionStatus: async () => {
    try {
      const isValid = await secureStorageService.isTokenValid();
      if (!isValid) {
        const refreshed = await get().refreshSession();
        if (!refreshed) {
          await get().handleSessionExpiry();
          return;
        }
      }
      await get().updateSessionTime();
    } catch (error) {
      console.error('Session status check failed:', error);
      await get().handleSessionExpiry();
    }
  },

  updateSessionTime: async () => {
    try {
      const timeRemaining = await authService.getSessionTimeRemaining();
      const isExpiring = timeRemaining < 300;
      set({
        sessionTimeRemaining: timeRemaining,
        isSessionExpiring: isExpiring,
      });
      if (isExpiring && timeRemaining > 0) {
        const minutesRemaining = Math.ceil(timeRemaining / 60);
        await notificationService.scheduleSessionExpiryReminder(minutesRemaining);
      }
    } catch (error) {
      console.error('Failed to update session time:', error);
    }
  },

  handleSessionExpiry: async () => {
    try {
      await notificationService.sendLocalNotification(
        'Session Expired',
        'Your session has expired. Please login again to continue.',
        { type: 'session_expired' }
      );
      Alert.alert(
        'Session Expired',
        'Your session has expired for security reasons. Please login again.',
        [
          { text: 'OK', onPress: async () => { await get().signOut(); } }
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Error handling session expiry:', error);
      await get().signOut();
    }
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  startSessionMonitoring: () => {
    const state = get();
    if (state.sessionMonitorInterval) {
      clearInterval(state.sessionMonitorInterval);
    }
    const interval = setInterval(async () => {
      await get().checkSessionStatus();
      const currentState = get();
      if (!currentState.isAuthenticated) {
        get().stopSessionMonitoring();
      }
    }, 30000);
    set({ sessionMonitorInterval: interval });
  },

  stopSessionMonitoring: () => {
    const state = get();
    if (state.sessionMonitorInterval) {
      clearInterval(state.sessionMonitorInterval);
      set({ sessionMonitorInterval: null });
    }
  },
}));
