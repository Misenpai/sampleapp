import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  ListRenderItem,
  View,
} from "react-native";

import { useAttendance } from "@/hooks/useAttendance";
import { useAudio } from "@/hooks/useAudio";
import { useCamera } from "@/hooks/useCamera";
import { useGeofence } from "@/hooks/useGeofence";

import { GEOFENCE_LOCATIONS } from "@/constants/geofenceLocation";
import {
  attendanceContainerStyles,
  globalStyles,
} from "@/constants/style";

import { AudioRecorder } from "../audio/AudioRecorder";
import { CameraView } from "../camera/CameraView";
import { ExpandedMapView } from "../map/ExpandedMapView";
import { GeofenceMap } from "../map/GeofenceMap";
import { MapCard } from "../map/MapCard";
import { LoadingScreen } from "../ui/LoadingScreen";
import { PermissionScreen } from "../ui/PermissionScreen";
import { HomeView } from "./HomeView";
import { LocationDropdown } from "./LocationDropdown";
import { useLocationContext } from "@/context/LocationContenxt";
import { useLocationStore } from "../../store/locationStore";

type ListItem = { id: string; type: "dropdown" | "map" | "attendance" };

export function AttendanceContainer() {
    const attendance = useAttendance();
  const camera = useCamera();
  const audio = useAudio();
   const { 
    selectedGeofenceId, 
    selectedLocationLabel, 
    setSelectedLocation 
  } = useLocationStore();

  const [showExpandedMap, setShowExpandedMap] = useState(false);
  const [isMapTouched, setIsMapTouched] = useState(false);

  // Move geofence hook to parent level
  const geofence = useGeofence(selectedGeofenceId);

  // Sync store state with attendance state
  useEffect(() => {
    attendance.setSelectedLocationLabel(selectedLocationLabel);
  }, [selectedLocationLabel]);

  const handleLocationSelection = (geofenceId: string | null, label: string | null) => {
    setSelectedLocation(geofenceId, label);
  };

  const resolveAttendanceLocation = () => {
    if (selectedLocationLabel) {
      const fence = GEOFENCE_LOCATIONS.find(
        (g) => g.label === selectedLocationLabel
      );
      if (fence && geofence.userPos) {
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
        const inside = R * c <= fence.radius;
        if (inside) return selectedLocationLabel;
      }

      return "IIT Guwahati";
    }

    for (const g of GEOFENCE_LOCATIONS) {
      if (!geofence.userPos) break;
      const R = 6371000;
      const toRad = (deg: number) => (deg * Math.PI) / 180;
      const dLat = toRad(g.center.lat - geofence.userPos.lat);
      const dLng = toRad(g.center.lng - geofence.userPos.lng);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(geofence.userPos.lat)) *
          Math.cos(toRad(g.center.lat)) *
          Math.sin(dLng / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      if (R * c <= g.radius) return g.label;
    }

    return "IIT Guwahati";
  };

  const handleUpload = async () => {
    const finalLocation = resolveAttendanceLocation();
    if (!attendance.userId) return;

    attendance.setUploading(true);
    try {
      const { uploadAttendanceData } = await import("@/services/attendanceService");
      const result = await uploadAttendanceData({
        userId: attendance.userId,
        photos: attendance.photos,
        audioRecording: attendance.audioRecording || undefined,
        location: finalLocation,
      });

      if (result.success) {
        Alert.alert("Success", "Attendance recorded!", [
          { text: "OK", onPress: attendance.resetAll },
        ]);
      } else {
        Alert.alert("Error", result.error ?? "Upload failed");
      }
    } catch {
      Alert.alert("Error", "Upload error");
    } finally {
      attendance.setUploading(false);
    }
  };

  // Memoize the map component with geofence data
  const mapComponent = React.useMemo(
    () => (
      <GeofenceMap
        html={geofence.html}
        userPos={geofence.userPos}
        initialPos={geofence.initialPos}
        isInitialized={geofence.isInitialized}
        mapShapes={geofence.mapShapes}
        mapLayers={geofence.mapLayers}
        mapMarkers={geofence.mapMarkers}
        mapCenter={geofence.mapCenter}
      />
    ),
    [
      geofence.html,
      geofence.userPos,
      geofence.initialPos,
      geofence.isInitialized,
      geofence.mapShapes,
      geofence.mapLayers,
      geofence.mapMarkers,
      geofence.mapCenter,
    ]
  );

  if (attendance.isLoadingUserId)
    return <LoadingScreen text="Loading user..." />;
  if (!camera.permission?.granted)
    return <PermissionScreen onRequestPermission={camera.requestPermission} />;
  if (attendance.uploading)
    return <LoadingScreen text="Uploading..." subtext="Please wait" />;
  if (showExpandedMap)
    return (
      <ExpandedMapView
        onClose={() => setShowExpandedMap(false)}
        mapComponent={mapComponent}
      />
    );

  switch (attendance.currentView) {
    case "audioRecorder":
      return (
        <AudioRecorder
          audio={audio}
          onBack={() => attendance.setCurrentView("home")}
          onRecordingComplete={(rec) => {
            attendance.setAudioRecording(rec);
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
            const next = [...attendance.photos];
            next[attendance.currentPhotoIndex] = photo;
            attendance.setPhotos(next);

            if (attendance.retakeMode) {
              attendance.setCurrentView("home");
              attendance.setRetakeMode(false);
            } else if (
              attendance.currentPhotoIndex < attendance.TOTAL_PHOTOS - 1
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
      const data: ListItem[] = [
        { id: "dropdown", type: "dropdown" },
        { id: "map", type: "map" },
        { id: "attendance", type: "attendance" },
      ];

      const renderItem: ListRenderItem<ListItem> = ({ item }) => {
        switch (item.type) {
          case "dropdown":
            return (
              <LocationDropdown
                selectedGeofenceId={selectedGeofenceId}
                onSelectionChange={handleLocationSelection}
              />
            );
          case "map":
            return (
              <MapCard
                onExpand={() => setShowExpandedMap(true)}
                mapComponent={mapComponent}
                onMapTouchStart={() => setIsMapTouched(true)}
                onMapTouchEnd={() => setIsMapTouched(false)}
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
                onRetakePhoto={(idx) => {
                  attendance.setCurrentPhotoIndex(idx);
                  attendance.setRetakeMode(true);
                  attendance.setCurrentView("camera");
                }}
                onRetakeAll={() => {
                  attendance.resetAll();
                  attendance.setCurrentView("camera");
                }}
                onRecordAudio={() => attendance.setCurrentView("audioRecorder")}
                onUpload={handleUpload}
                uploading={attendance.uploading}
                totalPhotos={attendance.TOTAL_PHOTOS}
                selectedLocationLabel={selectedLocationLabel}
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
          keyExtractor={(i) => i.id}
          style={[globalStyles.container, attendanceContainerStyles.container]}
          contentContainerStyle={attendanceContainerStyles.contentContainer}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!isMapTouched}
        />
      );
  }
}