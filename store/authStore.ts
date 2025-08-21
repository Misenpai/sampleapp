// store/authStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { loginUser, signupUser } from '../services/authService';
import { clearUserData, getUserData, storeUserData } from '../services/UserId';
import { useAttendanceStore } from './attendanceStore';

interface AuthState {
  session: string | null;
  userName: string | null;
  userId: string | null;  // This will store empCode
  userKey: string | null;  // New field for the actual primary key
  isLoading: boolean;
  isInitialized: boolean;

  signIn: (username: string, password: string) => Promise<void>;
  signUp: (empCode: string, username: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      userName: null,
      userId: null,  // Will store empCode
      userKey: null,
      isLoading: true,
      isInitialized: false,

      initializeAuth: async () => {
        try {
          const userData = await getUserData();

          if (userData?.isLoggedIn) {
            set({
              session: userData.userId,  // empCode
              userName: userData.name,
              userId: userData.userId,  // empCode
              userKey: userData.userKey,
              isLoading: false,
              isInitialized: true,
            });
            
            // Set username for attendance store
            useAttendanceStore.getState().setUserId(userData.name);
          } else {
            set({ isLoading: false, isInitialized: true });
          }
        } catch (e) {
          set({ isLoading: false, isInitialized: true });
        }
      },

      signIn: async (username, password) => {
        set({ isLoading: true });
        try {
          const res = await loginUser(username, password);
          
          if (res.success && res.user) {
            await storeUserData({
              userId: res.user.empCode,  // Store empCode as userId
              userKey: res.user.userKey,
              name: res.user.username,
              email: res.user.email,
              isLoggedIn: true,
            });
            
            set({
              session: res.user.empCode,
              userName: res.user.username,
              userId: res.user.empCode,
              userKey: res.user.userKey,
              isLoading: false,
            });
            
            // Set username for attendance store
            useAttendanceStore.getState().setUserId(res.user.username);
            
            // Check and set location type if available
            if (res.user.userLocation?.locationType) {
              useAttendanceStore.getState().setUserLocationType(
                res.user.userLocation.locationType
              );
            }
            
            Alert.alert('Success', 'Logged in successfully!');
          } else {
            set({ isLoading: false });
            Alert.alert('Login Failed', res.error || 'Unknown error');
          }
        } catch {
          set({ isLoading: false });
          Alert.alert('Error', 'Unexpected error during login');
        }
      },

      signUp: async (empCode, username, email, password) => {
        set({ isLoading: true });
        try {
          const res = await signupUser(empCode, username, email, password);
          
          if (res.success && res.user) {
            await storeUserData({
              userId: res.user.empCode,  // Store empCode as userId
              userKey: res.user.userKey,
              name: res.user.username,
              email: res.user.email,
              isLoggedIn: true,
            });
            
            set({
              session: res.user.empCode,
              userName: res.user.username,
              userId: res.user.empCode,
              userKey: res.user.userKey,
              isLoading: false,
            });
            
            // Set username for attendance store
            useAttendanceStore.getState().setUserId(res.user.username);
            
            Alert.alert('Success', 'Account created successfully!');
          } else {
            set({ isLoading: false });
            Alert.alert('Signup Failed', res.error || 'Unknown error');
          }
        } catch {
          set({ isLoading: false });
          Alert.alert('Error', 'Unexpected error during signup');
        }
      },

      signOut: async () => {
        try {
          await clearUserData();
          set({
            session: null,
            userName: null,
            userId: null,
            userKey: null,
          });
          useAttendanceStore.getState().clearUserId();
        } catch (e) {
          console.error(e);
        }
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        session: state.session,
        userName: state.userName,
        userId: state.userId,
        userKey: state.userKey,
      }),
    }
  )
);