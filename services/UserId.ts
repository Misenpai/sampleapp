// services/UserId.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "app_user_data";

export interface UserData {
  userId: string;
  name: string;
  email: string;
  isLoggedIn: boolean;
  hasAcceptedTerms?: boolean;
}

// This function should only be called when we know user is logged in
const getOrCreateUserId = async () => {
  const userData = await getUserData();
  
  if (userData && userData.isLoggedIn) {
    // Return the username, not name (this was the bug)
    return userData.name; // This is actually the username in your system
  }
  
  return null;
};

export const getUserData = async (): Promise<UserData | null> => {
  try {
    const userData = await AsyncStorage.getItem(STORAGE_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};

export const storeUserData = async (userData: UserData): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error("Error storing user data:", error);
    throw error;
  }
};

export const clearUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing user data:", error);
    throw error;
  }
};

export default getOrCreateUserId;