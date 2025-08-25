// store/authStore.ts - Fixed final version
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
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

  // Direct properties instead of getters to avoid timing issues
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

  // Helper function to update user-derived properties
  updateUserProperties: (userData: SecureUserData | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      isLoading: true,
      isInitialized: false,
      sessionTimeRemaining: 0,
      isSessionExpiring: false,
      sessionMonitorInterval: null,

      // Direct properties instead of getters
      session: null,
      userName: null,
      userId: null,
      userKey: null,

      updateUserProperties: (userData: SecureUserData | null) => {
        console.log('🔄 Updating user properties with:', userData);
        set({
          session: userData?.empCode || null,
          userName: userData?.username || null,
          userId: userData?.empCode || null,
          userKey: userData?.userKey || null,
        });
        console.log('✅ User properties updated:', {
          session: userData?.empCode || null,
          userName: userData?.username || null,
          userId: userData?.empCode || null,
          userKey: userData?.userKey || null,
        });
      },

      initializeAuth: async () => {
        try {
          console.log('🚀 Starting auth initialization...');
          set({ isLoading: true });

          await notificationService.initialize();

          const tokens = await secureStorageService.getTokens();
          console.log('🔍 Initial tokens check:', {
            hasTokens: !!tokens,
            hasAccessToken: !!tokens?.accessToken,
            hasRefreshToken: !!tokens?.refreshToken
          });

          if (!tokens || !tokens.accessToken || !tokens.refreshToken) {
            console.log('❌ No valid tokens found');
            get().updateUserProperties(null);
            set({
              isAuthenticated: false,
              user: null,
              isLoading: false,
              isInitialized: true,
            });
            return;
          }

          const isTokenValid = await secureStorageService.isTokenValid();
          console.log('🔍 Token validity check:', isTokenValid);

          if (!isTokenValid) {
            console.log('🔄 Access token expired, attempting refresh...');
            const refreshSuccess = await get().refreshSession();

            if (!refreshSuccess) {
              console.log('❌ Token refresh failed');
              await secureStorageService.clearAll();
              get().updateUserProperties(null);
              set({
                isAuthenticated: false,
                user: null,
                isLoading: false,
                isInitialized: true,
              });
              return;
            }
          }

          console.log('🔍 Verifying token with server...');
          const isAuth = await authService.verifyToken();
          console.log('🔍 Server verification result:', isAuth);

          if (isAuth) {
            console.log('✅ Token verified, getting user data...');
            const userData = await authService.getUserData();
            console.log('🔍 Retrieved user data:', {
              hasUserData: !!userData,
              username: userData?.username,
              empCode: userData?.empCode,
              userKey: userData?.userKey,
            });

            if (userData) {
              // Update both user object AND derived properties
              get().updateUserProperties(userData);
              set({
                isAuthenticated: true,
                user: userData,
                isLoading: false,
                isInitialized: true,
              });

              console.log('✅ Setting attendance store userId:', userData.username);
              useAttendanceStore.getState().setUserId(userData.username);

              get().startSessionMonitoring();
              return;
            } else {
              console.log('❌ No user data returned from getUserData()');
            }
          } else {
            console.log('❌ Token verification failed');
          }

          console.log('🧹 Clearing all data due to auth failure');
          await secureStorageService.clearAll();
          get().updateUserProperties(null);
          set({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            isInitialized: true,
          });

        } catch (error) {
          console.error('💥 Auth initialization failed:', error);
          await secureStorageService.clearAll();
          get().updateUserProperties(null);
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
          console.log('🔐 Starting sign in for username:', username);
          set({ isLoading: true });

          const response = await authService.login(username, password);
          console.log('🔍 Login response:', {
            success: response.success,
            hasData: !!response.data,
            hasUser: !!response.data?.user,
            username: response.data?.user?.username,
            empCode: response.data?.user?.empCode
          });

          if (response.success && response.data) {
            const userData: SecureUserData = response.data.user;
            console.log('✅ Login successful, setting user data:', userData);

            // Update both user object AND derived properties
            get().updateUserProperties(userData);
            set({
              isAuthenticated: true,
              user: userData,
              isLoading: false,
              sessionTimeRemaining: response.data.expiresIn,
            });

            console.log('✅ Setting attendance store userId:', userData.username);
            useAttendanceStore.getState().setUserId(userData.username);

            if (userData.userLocation?.locationType) {
              useAttendanceStore.getState().setUserLocationType(
                userData.userLocation.locationType
              );
            }

            get().startSessionMonitoring();

            Alert.alert('Success', 'Logged in successfully!');
            return true;

          } else {
            console.log('❌ Login failed:', response.error);
            set({ isLoading: false });
            Alert.alert('Login Failed', response.error || 'Unknown error');
            return false;
          }

        } catch (error) {
          console.error('💥 Login error:', error);
          set({ isLoading: false });
          Alert.alert('Error', 'Unexpected error during login');
          return false;
        }
      },

      signOut: async () => {
        try {
          console.log('🚪 Starting sign out...');
          set({ isLoading: true });
          await authService.logout();
          get().updateUserProperties(null);
          set({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            sessionTimeRemaining: 0,
            isSessionExpiring: false,
          });
          useAttendanceStore.getState().clearUserId();
          get().stopSessionMonitoring();
          console.log('✅ Sign out complete');
        } catch (error) {
          console.error('💥 Logout error:', error);
          set({ isLoading: false });
        }
      },

      refreshSession: async (): Promise<boolean> => {
        try {
          console.log('🔄 Refreshing session...');
          const refreshed = await authService.refreshAccessToken();
          if (refreshed) {
            const sessionTime = await authService.getSessionTimeRemaining();
            set({
              sessionTimeRemaining: sessionTime,
              isSessionExpiring: sessionTime < 300,
            });
            console.log('✅ Session refreshed successfully');
            return true;
          } else {
            console.log('❌ Session refresh failed');
            await get().handleSessionExpiry();
            return false;
          }
        } catch (error) {
          console.error('💥 Session refresh failed:', error);
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
          console.error('💥 Session status check failed:', error);
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
          console.error('💥 Failed to update session time:', error);
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
          console.error('💥 Error handling session expiry:', error);
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
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist essential data
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        session: state.session,
        userName: state.userName,
        userId: state.userId,
        userKey: state.userKey,
      }),
      // Restore derived properties on rehydration
      onRehydrateStorage: () => (state) => {
        if (state && state.user) {
          console.log('🔄 Rehydrating auth store with user:', state.user);
          // Ensure derived properties are set from persisted user data
          const userData = state.user;
          state.session = userData?.empCode || null;
          state.userName = userData?.username || null;
          state.userId = userData?.empCode || null;
          state.userKey = userData?.userKey || null;
          console.log('✅ Rehydrated auth store properties:', {
            session: state.session,
            userName: state.userName,
            userId: state.userId,
            userKey: state.userKey,
          });
        }
      },
    }
  )
);