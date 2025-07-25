import { CameraCapturedPicture } from "expo-camera";
import React from "react";
import { Text, View } from "react-native";

import { AudioRecording } from "../../types/attendance";
import { ActionButtons } from "./ActionButton";
import { AudioSection } from "./AudioSection";
import { PhotoGrid } from "./PhotoGrid";
import { homeStyles } from "@/constants/style";

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
}: HomeViewProps) {
  return (
    <View style={homeStyles.container}>
      <Text style={homeStyles.title}>Take Attendance</Text>
      <Text style={homeStyles.subtitle}>
        Please take 3 photos and record audio
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
