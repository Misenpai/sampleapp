import { CameraCapturedPicture } from "expo-camera";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

import getOrCreateUserId from "../services/UserId";
import { AudioRecording, ViewMode } from "../types/attendance";
import uploadAttendanceData from "@/services/attendanceService";

export function useAttendance() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoadingUserId, setIsLoadingUserId] = useState(true);
  const [photos, setPhotos] = useState<CameraCapturedPicture[]>([]);
  const [audioRecording, setAudioRecording] = useState<AudioRecording | null>(
    null
  );
  const [currentView, setCurrentView] = useState<ViewMode>("home");
  const [uploading, setUploading] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [retakeMode, setRetakeMode] = useState(false);

  const TOTAL_PHOTOS = 3;

  useEffect(() => {
    const initializeUserId = async () => {
      try {
        const id = await getOrCreateUserId();
        console.log("User ID fetched:", id);
        if (!id) {
          throw new Error("User ID is null or undefined");
        }
        setUserId(id);
      } catch (error) {
        console.error("Error initializing user ID:", error);
        Alert.alert("Error", "Failed to initialize user ID");
      } finally {
        setIsLoadingUserId(false);
      }
    };
    initializeUserId();
  }, []);

  const handleUpload = async () => {
    if (!userId) {
      Alert.alert("Error", "User ID not found. Please try again.");
      return;
    }

    if (photos.length < TOTAL_PHOTOS) {
      Alert.alert("Error", "Please take all 3 photos before saving.");
      return;
    }

    setUploading(true);
    try {
      const result = await uploadAttendanceData({
        userId,
        photos,
        audioRecording: audioRecording || undefined,
      });

      if (result.success) {
        Alert.alert("Success", "Attendance recorded successfully!", [
          { text: "OK", onPress: resetAll },
        ]);
      } else {
        Alert.alert(
          "Error",
          `Upload failed: ${result.error ?? "Unknown error"}`
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to upload data");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const resetAll = () => {
    setPhotos([]);
    setAudioRecording(null);
    setCurrentPhotoIndex(0);
    setCurrentView("home");
    setRetakeMode(false);
  };

  return {
    // State
    userId,
    isLoadingUserId,
    photos,
    audioRecording,
    currentView,
    uploading,
    currentPhotoIndex,
    retakeMode,
    TOTAL_PHOTOS,

    // Actions
    setPhotos,
    setAudioRecording,
    setCurrentView,
    setCurrentPhotoIndex,
    setRetakeMode,
    handleUpload,
    resetAll,
  };
}
