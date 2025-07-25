import React from "react";
import { Alert, Text, View } from "react-native";

import { CameraCapturedPicture } from "expo-camera";
import { AudioRecording } from "../../types/attendance";

import { homeStyles } from "@/constants/style";
import { ActionButtons } from "./ActionButton";
import { AudioSection } from "./AudioSection";
import { PhotoGrid } from "./PhotoGrid";

/* --- NEW: simple geofence check --- */
import { GEOFENCE_LOCATIONS } from "@/constants/geofenceLocation";
import { useGeofence } from "@/hooks/useGeofence";

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
  selectedLocationLabel: string | null; // injected from useAttendance
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
  /* ---------- NEW: geofence hook inside HomeView ---------- */
  const geofence = useGeofence(selectedLocationLabel);

  const isInsideSelectedGeofence = () => {
    if (!selectedLocationLabel || !geofence.userPos) return false;
    const fence = GEOFENCE_LOCATIONS.find(
      (g) => g.label === selectedLocationLabel
    );
    if (!fence) return false;

    const R = 6371000;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(fence.center.lat - geofence.userPos.lat);
    const dLng = toRad(fence.center.lng - geofence.userPos.lng);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(geofence.userPos.lat)) *
        Math.cos(toRad(fence.center.lat)) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c <= fence.radius;
  };

  const canTakeActions = selectedLocationLabel && isInsideSelectedGeofence();

  /* ---------- NEW: small helper to block actions ---------- */
  const guard = (callback: () => void) => () => {
    if (!selectedLocationLabel) {
      Alert.alert(
        "No department selected",
        "Please pick a department from the dropdown first."
      );
      return;
    }
    if (!isInsideSelectedGeofence()) {
      Alert.alert(
        "Outside geofence",
        `You must be inside ${selectedLocationLabel} to continue.`
      );
      return;
    }
    callback();
  };

  return (
    <View style={homeStyles.container}>
      <Text style={homeStyles.title}>Take Attendance</Text>
      {!selectedLocationLabel && (
        <Text style={homeStyles.subtitle}>
          Please select a department first.
        </Text>
      )}
      {selectedLocationLabel && !canTakeActions && (
        <Text style={homeStyles.subtitle}>
          You are currently outside {selectedLocationLabel}.
        </Text>
      )}
      {selectedLocationLabel && canTakeActions && (
        <Text style={homeStyles.subtitle}>
          Please take {totalPhotos} photos and record audio
        </Text>
      )}

      <PhotoGrid
        photos={photos}
        onRetakePhoto={canTakeActions ? onRetakePhoto : () => {}} // no-op when outside
        totalPhotos={totalPhotos}
      />
      <AudioSection
        audioRecording={audioRecording}
        onRecordAudio={guard(onRecordAudio)}
      />
      <ActionButtons
        photos={photos}
        onTakePhotos={guard(onTakePhotos)}
        onRetakeAll={guard(onRetakeAll)}
        onUpload={guard(onUpload)}
        uploading={uploading}
        totalPhotos={totalPhotos}
      />
    </View>
  );
}
