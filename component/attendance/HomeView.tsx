import React from "react";
import { Text, View } from "react-native";

import { CameraCapturedPicture } from "expo-camera";
import { AudioRecording } from "../../types/attendance";

import { homeStyles } from "@/constants/style";
import { ActionButtons } from "./ActionButton";
import { AudioSection } from "./AudioSection";
import { PhotoGrid } from "./PhotoGrid";

interface HomeViewProps {
  photos: CameraCapturedPicture[];
  audioRecording: AudioRecording | null;
  onTakePhotos: () => void;
  onRetakePhoto: (index: number) => void;
  onRetakeAll: () => void;
  onRecordAudio: () => void;
  onUpload: () => void;
  uploading: boolean;
  totalPhotos: number;
  selectedLocationLabel: string | null;
}

export function HomeView({
  photos,
  audioRecording,
  onTakePhotos,
  onRetakePhoto,
  onRetakeAll,
  onRecordAudio,
  onUpload,
  uploading,
  totalPhotos,
  selectedLocationLabel,
}: HomeViewProps) {
  return (
    <View style={homeStyles.container}>
      <Text style={homeStyles.title}>Take Attendance</Text>
      <Text style={homeStyles.subtitle}>
        {selectedLocationLabel
          ? `Department: ${selectedLocationLabel}`
          : "Showing all departments (auto-detect)"}
      </Text>

      <PhotoGrid
        photos={photos}
        onRetakePhoto={onRetakePhoto}
        totalPhotos={totalPhotos}
      />
      <AudioSection
        audioRecording={audioRecording}
        onRecordAudio={onRecordAudio}
      />
      <ActionButtons
        photos={photos}
        onTakePhotos={onTakePhotos}
        onRetakeAll={onRetakeAll}
        onUpload={onUpload}
        uploading={uploading}
        totalPhotos={totalPhotos}
      />
    </View>
  );
}
