import { CameraCapturedPicture } from "expo-camera";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

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
        console.log(id);
        setUserId(id);
      } catch {
        Alert.alert("Error", "Failed to initialize user ID");
      } finally {
        setIsLoadingUserId(false);
      }
    };
    init();
  }, []);

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
    resetAll,
    setUploading,
  };
}
