// services/UserId.ts - Updated for JWT session management
import { authService } from "./authService";
import { secureStorageService } from "./secureStorageService";

const STORAGE_KEY = "app_user_data"; // Keep for backward compatibility

export interface UserData {
  userId: string;  // This is empCode
  userKey?: string;  // The actual primary key from database
  name: string;  // username
  email: string;
  isLoggedIn: boolean;
  hasAcceptedTerms?: boolean;
}

const getOrCreateUserId = async () => {
  try {
    // First check if user is authenticated with JWT
    const isAuthenticated = await authService.isAuthenticated();
    if (isAuthenticated) {
      const userData = await authService.getUserData();
      if (userData) {
        return userData.username; // Return username for attendance marking
      }
    }
    
    // Fallback to legacy method for backward compatibility
    const userData = await getUserData();
    if (userData && userData.isLoggedIn) {
      return userData.name;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting user ID:", error);
    return null;
  }
};

export const getUserData = async (): Promise<UserData | null> => {
  try {
    // Try to get from secure storage first
    const secureUserData = await secureStorageService.getUserData();
    if (secureUserData) {
      return {
        userId: secureUserData.empCode,
        userKey: secureUserData.userKey,
        name: secureUserData.username,
        email: secureUserData.email,
        isLoggedIn: true,
      };
    }

    // Fallback to legacy storage for backward compatibility
    const { default: AsyncStorage } = await import("@react-native-async-storage/async-storage");
    const userData = await AsyncStorage.getItem(STORAGE_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};

export const storeUserData = async (userData: UserData): Promise<void> => {
  try {
    // Store in secure storage (new method)
    await secureStorageService.storeUserData({
      userKey: userData.userKey || userData.userId,
      empCode: userData.userId,
      username: userData.name,
      email: userData.email,
      role: 'USER', // Default role
      location: 'all', // Default location
    });

    // Also store in legacy format for backward compatibility
    const { default: AsyncStorage } = await import("@react-native-async-storage/async-storage");
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error("Error storing user data:", error);
    throw error;
  }
};

export const clearUserData = async (): Promise<void> => {
  try {
    // Clear secure storage
    await secureStorageService.clearAll();
    
    // Clear legacy storage
    const { default: AsyncStorage } = await import("@react-native-async-storage/async-storage");
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing user data:", error);
    throw error;
  }
};

// New function to check authentication status
export const isUserAuthenticated = async (): Promise<boolean> => {
  try {
    return await authService.isAuthenticated();
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
};

// New function to get session time remaining
export const getSessionTimeRemaining = async (): Promise<number> => {
  try {
    return await authService.getSessionTimeRemaining();
  } catch (error) {
    console.error("Error getting session time:", error);
    return 0;
  }
};

export default getOrCreateUserId;