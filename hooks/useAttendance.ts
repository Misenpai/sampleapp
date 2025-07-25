import { CameraCapturedPicture } from "expo-camera";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

import uploadAttendanceData from "@/services/attendanceService";
import getOrCreateUserId from "../services/UserId";
import { AudioRecording, ViewMode } from "../types/attendance";

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
  const [selectedLocationLabel, setSelectedLocationLabel] = useState<
    string | null
  >(null);

  const TOTAL_PHOTOS = 3;

  useEffect(() => {
    const init = async () => {
      try {
        const id = await getOrCreateUserId();
        if (!id) throw new Error("User ID null");
        setUserId(id);
      } catch {
        Alert.alert("Error", "Failed to initialize user ID");
      } finally {
        setIsLoadingUserId(false);
      }
    };
    init();
  }, []);

  const handleUpload = async () => {
    if (!userId) {
      Alert.alert("Error", "User ID not found");
      return;
    }
    if (photos.length < TOTAL_PHOTOS) {
      Alert.alert("Error", "Please take all 3 photos");
      return;
    }

    setUploading(true);
    try {
      const result = await uploadAttendanceData({
        userId,
        photos,
        audioRecording: audioRecording || undefined,
        location: selectedLocationLabel,
      });

      if (result.success) {
        Alert.alert("Success", "Attendance recorded!", [
          { text: "OK", onPress: resetAll },
        ]);
      } else {
        Alert.alert("Error", result.error ?? "Upload failed");
      }
    } catch {
      Alert.alert("Error", "Upload error");
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
    setSelectedLocationLabel(null);
  };

  return {
    userId,
    isLoadingUserId,
    photos,
    audioRecording,
    currentView,
    uploading,
    currentPhotoIndex,
    retakeMode,
    TOTAL_PHOTOS,
    selectedLocationLabel,
    setPhotos,
    setAudioRecording,
    setCurrentView,
    setCurrentPhotoIndex,
    setRetakeMode,
    setSelectedLocationLabel,
    handleUpload,
    resetAll,
  };
}
