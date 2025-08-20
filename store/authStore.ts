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
  userId: string | null;
  isLoading: boolean;
  isInitialized: boolean;

  signIn: (username: string, password: string) => Promise<void>;
  signUp: (empId: string, name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      userName: null,
      userId: null,
      isLoading: true,
      isInitialized: false,

      initializeAuth: async () => {
        try {
          const userData = await getUserData();

          set({
            ...(userData?.isLoggedIn
              ? {
                  session: userData.userId,
                  userName: userData.name,
                  userId: userData.userId,
                  isLoading: false,
                  isInitialized: true,
                }
              : { isLoading: false, isInitialized: true }),
          });

          if (userData?.isLoggedIn)
            useAttendanceStore.getState().setUserId(userData.name);
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
              userId: res.user.id,
              name: res.user.username,
              email: res.user.email,
              isLoggedIn: true,
            });
            set({
              session: res.user.id,
              userName: res.user.username,
              userId: res.user.id,
              isLoading: false,
            });
            useAttendanceStore.getState().setUserId(res.user.username);
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

      signUp: async (empId, name, email, password) => {
        set({ isLoading: true });
        try {
          const res = await signupUser(empId, name, email, password);
          if (res.success && res.user) {
            await storeUserData({
              userId: res.user.id,
              name: res.user.username,
              email: res.user.email,
              isLoggedIn: true,
            });
            set({
              session: res.user.id,
              userName: res.user.username,
              userId: res.user.id,
              isLoading: false,
            });
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
      }),
    }
  )
);
