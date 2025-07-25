import { Alert } from "react-native";

export const showAlert = (
  title: string,
  message: string,
  onPress?: () => void
) => {
  Alert.alert(title, message, onPress ? [{ text: "OK", onPress }] : undefined);
};

export const showConfirmAlert = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  Alert.alert(title, message, [
    { text: "Cancel", style: "cancel", onPress: onCancel },
    { text: "Confirm", onPress: onConfirm },
  ]);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
