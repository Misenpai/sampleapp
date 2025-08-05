// utils/getOrCreateUserId.ts (or wherever this file is located)
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "app_user_data";

const getOrCreateUserId = async (name?: string) => {
  let userData = await AsyncStorage.getItem(STORAGE_KEY);
  
  if (userData) {
    const parsed = JSON.parse(userData);
    return parsed.userId;
  }
  
  if (name) {
    // Create user ID from name (remove spaces, convert to lowercase, add timestamp for uniqueness)
    const userId = `${name.replace(/\s+/g, '').toLowerCase()}_${Date.now()}`;
    const userDataToStore = {
      userId,
      name,
      isLoggedIn: true
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userDataToStore));
    return userId;
  }
  
  return null;
};

export const getUserData = async () => {
  const userData = await AsyncStorage.getItem(STORAGE_KEY);
  return userData ? JSON.parse(userData) : null;
};

export const clearUserData = async () => {
  await AsyncStorage.removeItem(STORAGE_KEY);
};

export default getOrCreateUserId;