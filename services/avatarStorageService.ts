import AsyncStorage from "@react-native-async-storage/async-storage";

export interface AvatarData {
  style: string;
  seed: string;
  url: string;
}

const AVATAR_KEY = "user_avatar_";

export const saveUserAvatar = async (
  empId: string,
  avatarData: AvatarData,
): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(AVATAR_KEY + empId, JSON.stringify(avatarData));
    return true;
  } catch (error) {
    console.error("Error saving avatar:", error);
    return false;
  }
};

export const getUserAvatar = async (
  empId: string,
): Promise<AvatarData | undefined> => {
  try {
    const avatarData = await AsyncStorage.getItem(AVATAR_KEY + empId);
    return avatarData ? JSON.parse(avatarData) : undefined; // Return undefined instead of null
  } catch (error) {
    console.error("Error getting avatar:", error);
    return undefined; // Return undefined instead of null
  }
};

export const deleteUserAvatar = async (empId: string): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(AVATAR_KEY + empId);
    return true;
  } catch (error) {
    console.error("Error deleting avatar:", error);
    return false;
  }
};
