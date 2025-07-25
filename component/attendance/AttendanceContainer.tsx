import React, { useMemo, useState } from "react";
import { FlatList, ListRenderItem } from "react-native";

import { attendanceContainerStyles, globalStyles } from "@/constants/style";
import { useAttendance } from "../../hooks/useAttendance";
import { useAudio } from "../../hooks/useAudio";
import { useCamera } from "../../hooks/useCamera";
import { AudioRecorder } from "../audio/AudioRecorder";
import { CameraView } from "../camera/CameraView";
import { ExpandedMapView } from "../map/ExpandedMapView";
import { GeofenceMap } from "../map/GeofenceMap";
import { MapCard } from "../map/MapCard";
import { LoadingScreen } from "../ui/LoadingScreen";
import { PermissionScreen } from "../ui/PermissionScreen";
import { HomeView } from "./HomeView";

type ListItem = {
  id: string;
  type: "map" | "attendance";
};

export function AttendanceContainer() {
  const attendance = useAttendance();
  const camera = useCamera();
  const audio = useAudio();
  const [showExpandedMap, setShowExpandedMap] = useState(false);

  const mapComponent = useMemo(() => <GeofenceMap />, []);

  const data: ListItem[] = [
    { id: "map", type: "map" },
    { id: "attendance", type: "attendance" },
  ];

  if (attendance.isLoadingUserId) {
    return <LoadingScreen text="Loading user data..." />;
  }

  if (!camera.permission?.granted) {
    return <PermissionScreen onRequestPermission={camera.requestPermission} />;
  }

  if (attendance.uploading) {
    return <LoadingScreen text="Uploading data..." subtext="Please wait" />;
  }

  if (showExpandedMap) {
    return (
      <ExpandedMapView
        onClose={() => setShowExpandedMap(false)}
        mapComponent={mapComponent}
      />
    );
  }

  switch (attendance.currentView) {
    case "audioRecorder":
      return (
        <AudioRecorder
          audio={audio}
          onBack={() => attendance.setCurrentView("home")}
          onRecordingComplete={(recording) => {
            attendance.setAudioRecording(recording);
            attendance.setCurrentView("home");
          }}
        />
      );

    case "camera":
      return (
        <CameraView
          camera={camera}
          currentPhotoIndex={attendance.currentPhotoIndex}
          retakeMode={attendance.retakeMode}
          totalPhotos={attendance.TOTAL_PHOTOS}
          onPhotoTaken={(photo) => {
            const newPhotos = [...attendance.photos];
            newPhotos[attendance.currentPhotoIndex] = photo;
            attendance.setPhotos(newPhotos);

            if (attendance.retakeMode) {
              attendance.setCurrentView("home");
              attendance.setRetakeMode(false);
            } else if (
              attendance.currentPhotoIndex <
              attendance.TOTAL_PHOTOS - 1
            ) {
              attendance.setCurrentPhotoIndex(attendance.currentPhotoIndex + 1);
            } else {
              attendance.setCurrentView("home");
            }
          }}
          onBack={() => {
            attendance.setCurrentView("home");
            attendance.setRetakeMode(false);
          }}
        />
      );

    default:
      const renderItem: ListRenderItem<ListItem> = ({ item }) => {
        switch (item.type) {
          case "map":
            return (
              <MapCard
                onExpand={() => setShowExpandedMap(true)}
                mapComponent={mapComponent}
              />
            );
          case "attendance":
            return (
              <HomeView
                photos={attendance.photos}
                audioRecording={attendance.audioRecording}
                onTakePhotos={() => {
                  attendance.setCurrentPhotoIndex(0);
                  attendance.setRetakeMode(false);
                  attendance.setCurrentView("camera");
                }}
                onRetakePhoto={(index) => {
                  attendance.setCurrentPhotoIndex(index);
                  attendance.setRetakeMode(true);
                  attendance.setCurrentView("camera");
                }}
                onRetakeAll={() => {
                  attendance.resetAll();
                  attendance.setCurrentView("camera");
                }}
                onRecordAudio={() => attendance.setCurrentView("audioRecorder")}
                onUpload={attendance.handleUpload}
                uploading={attendance.uploading}
                totalPhotos={attendance.TOTAL_PHOTOS}
              />
            );
          default:
            return null;
        }
      };

      return (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={[globalStyles.container, attendanceContainerStyles.container]}
          contentContainerStyle={attendanceContainerStyles.contentContainer}
          showsVerticalScrollIndicator={false}
        />
      );
  }
}
