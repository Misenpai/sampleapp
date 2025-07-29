import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";

const STORAGE_KEY = "app_user_id";


const getOrCreateUserId = async () => {
  let userId = await AsyncStorage.getItem(STORAGE_KEY);
  if (!userId) {
    userId = uuid.v4();
    await AsyncStorage.setItem(STORAGE_KEY, userId);
  }

  return userId;
};

export default getOrCreateUserId;
