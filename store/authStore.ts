// store/authStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { loginUser, signupUser } from '../services/authService';
import { clearUserData, getUserData, storeUserData } from '../services/UserId';
import { useAttendanceStore } from './attendanceStore';

interface AuthState {
  // State
  session: string | null;
  userName: string | null;
  userId: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  hasAcceptedTerms: boolean;
  isSettingUpPermissions: boolean;

  // Actions
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (empId: string, name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  acceptTerms: () => Promise<void>;
  setSettingUpPermissions: (setting: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      session: null,
      userName: null,
      userId: null,
      isLoading: true,
      isInitialized: false,
      hasAcceptedTerms: false,
      isSettingUpPermissions: false,

      // Initialize auth from storage
      initializeAuth: async () => {
        try {
          const userData = await getUserData();
          if (userData && userData.isLoggedIn) {
            set({
              session: userData.userId,
              userName: userData.name,
              userId: userData.userId,
              isInitialized: true,
              isLoading: false,
              hasAcceptedTerms: userData.hasAcceptedTerms || false,
            });
            
            // Sync with attendance store
            useAttendanceStore.getState().setUserId(userData.name);
          } else {
            set({
              isInitialized: true,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error("Error checking existing session:", error);
          set({
            isInitialized: true,
            isLoading: false,
          });
        }
      },

      // Sign in action
      signIn: async (username: string, password: string) => {
        set({ isLoading: true });
        try {
          console.log('Starting sign in process...');
          const result = await loginUser(username, password);
          console.log('Login result:', result);
          
          if (result.success && result.user) {
            const userData = {
              userId: result.user.id,
              name: result.user.username,
              email: result.user.email,
              isLoggedIn: true,
              hasAcceptedTerms: false
            };
            
            await storeUserData(userData);
            
            set({
              session: result.user.id,
              userName: result.user.username,
              userId: result.user.id,
              isLoading: false,
              hasAcceptedTerms: false, // New users haven't accepted terms yet
            });
            
            // IMPORTANT: Sync with attendance store after successful login
            useAttendanceStore.getState().setUserId(result.user.username);
            
            Alert.alert("Success", "Logged in successfully!");
          } else {
            set({ isLoading: false });
            Alert.alert("Login Failed", result.error || "Unknown error occurred");
          }
        } catch (error) {
          console.error("Sign in error:", error);
          set({ isLoading: false });
          Alert.alert("Error", "An unexpected error occurred during login");
        }
      },

      // Sign up action
      signUp: async (empId: string, name: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          console.log('Starting sign up process...');
          const result = await signupUser(empId, name, email, password);
          console.log('Signup result:', result);
          
          if (result.success && result.user) {
            const userData = {
              userId: result.user.id,
              name: result.user.username,
              email: result.user.email,
              isLoggedIn: true,
              hasAcceptedTerms: false
            };
            
            await storeUserData(userData);
            
            set({
              session: result.user.id,
              userName: result.user.username,
              userId: result.user.id,
              isLoading: false,
              hasAcceptedTerms: false, // New users haven't accepted terms yet
            });
            
            // IMPORTANT: Sync with attendance store after successful signup
            useAttendanceStore.getState().setUserId(result.user.username);
            
            Alert.alert("Success", "Account created successfully!");
          } else {
            set({ isLoading: false });
            Alert.alert("Signup Failed", result.error || "Unknown error occurred");
          }
        } catch (error) {
          console.error("Sign up error:", error);
          set({ isLoading: false });
          Alert.alert("Error", "An unexpected error occurred during signup");
        }
      },

      // Sign out action
      signOut: async () => {
        try {
          await clearUserData();
          
          // Clear auth state
          set({
            session: null,
            userName: null,
            userId: null,
            hasAcceptedTerms: false,
            isSettingUpPermissions: false,
          });
          
          // IMPORTANT: Clear attendance store as well
          useAttendanceStore.getState().clearUserId();
          
        } catch (error) {
          console.error("Error signing out:", error);
        }
      },

      // Set loading state
      setLoading: (loading: boolean) => set({ isLoading: loading }),

      // Accept terms and update user data
      acceptTerms: async () => {
        const state = get();
        if (state.userName) {
          try {
            // Update stored user data to include terms acceptance
            const currentUserData = await getUserData();
            if (currentUserData) {
              const updatedUserData = {
                ...currentUserData,
                hasAcceptedTerms: true
              };
              await storeUserData(updatedUserData);
            }
            set({ hasAcceptedTerms: true });
          } catch (error) {
            console.error("Error updating terms acceptance:", error);
            // Still set in memory even if storage fails
            set({ hasAcceptedTerms: true });
          }
        }
      },

      // Set permissions setup state
      setSettingUpPermissions: (setting: boolean) => set({ isSettingUpPermissions: setting }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        session: state.session,
        userName: state.userName,
        userId: state.userId,
        hasAcceptedTerms: state.hasAcceptedTerms,
      }),
    }
  )
);