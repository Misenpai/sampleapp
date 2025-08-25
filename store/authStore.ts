// store/authStore.ts
import { Alert } from 'react-native';
import { create } from 'zustand';
import { authService } from '../services/authService';
import { notificationService } from '../services/pushNotificationService'; // Fixed import name
import { secureStorageService, SecureUserData } from '../services/secureStorageService';
import { useAttendanceStore } from './attendanceStore';

interface AuthState {
  // Authentication state
  isAuthenticated: boolean;
  user: SecureUserData | null;
  isLoading: boolean;
  isInitialized: boolean;
  
  // Session management
  sessionTimeRemaining: number;
  isSessionExpiring: boolean;
  sessionMonitorInterval: NodeJS.Timeout | number | null;
  
  // Computed getters for backward compatibility
  session: string | null;
  userName: string | null;
  userId: string | null;  // empCode
  userKey: string | null;

  // Actions
  signIn: (username: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  checkSessionStatus: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  
  // Session management actions
  updateSessionTime: () => Promise<void>;
  handleSessionExpiry: () => Promise<void>;
  startSessionMonitoring: () => void;
  stopSessionMonitoring: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  isAuthenticated: false,
  user: null,
  isLoading: true,
  isInitialized: false,
  sessionTimeRemaining: 0,
  isSessionExpiring: false,
  sessionMonitorInterval: null,

  // Computed getters
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

  // Actions
  initializeAuth: async () => {
    try {
      set({ isLoading: true });

      // Initialize notification service
      await notificationService.initialize();

      // Check if user is authenticated
      const isAuth = await authService.isAuthenticated();
      
      if (isAuth) {
        const userData = await authService.getUserData();
        
        if (userData) {
          set({
            isAuthenticated: true,
            user: userData,
            isLoading: false,
            isInitialized: true,
          });
          
          // Set up attendance store
          useAttendanceStore.getState().setUserId(userData.username);
          
          // Start session monitoring
          get().startSessionMonitoring();
          
          return;
        }
      }
      
      // Not authenticated
      set({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        isInitialized: true,
      });
      
    } catch (error) {
      console.error('Auth initialization failed:', error);
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
        
        // Set up attendance store
        useAttendanceStore.getState().setUserId(userData.username);
        
        // Set location type if available
        if (userData.userLocation?.locationType) {
          useAttendanceStore.getState().setUserLocationType(
            userData.userLocation.locationType
          );
        }
        
        // Start session monitoring
        get().startSessionMonitoring();
        
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
      
      // Clear attendance store
      useAttendanceStore.getState().clearUserId();
      
      // Stop session monitoring
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
          isSessionExpiring: sessionTime < 300 // 5 minutes
        });
        return true;
      } else {
        // Refresh failed, logout user
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
      
      // Update session time remaining
      await get().updateSessionTime();
      
    } catch (error) {
      console.error('Session status check failed:', error);
      await get().handleSessionExpiry();
    }
  },

  updateSessionTime: async () => {
    try {
      const timeRemaining = await authService.getSessionTimeRemaining();
      const isExpiring = timeRemaining < 300; // 5 minutes
      
      set({ 
        sessionTimeRemaining: timeRemaining,
        isSessionExpiring: isExpiring 
      });
      
      // Show warning if session is expiring
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
          {
            text: 'OK',
            onPress: async () => {
              await get().signOut();
            }
          }
        ],
        { cancelable: false }
      );
      
    } catch (error) {
      console.error('Error handling session expiry:', error);
      await get().signOut();
    }
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  // Session monitoring
  startSessionMonitoring: () => {
    const state = get();
    
    // Clear existing interval
    if (state.sessionMonitorInterval) {
      clearInterval(state.sessionMonitorInterval);
    }
    
    // Check session status every 30 seconds
    const interval = setInterval(async () => {
      await get().checkSessionStatus();
      
      // If session expired, stop monitoring
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