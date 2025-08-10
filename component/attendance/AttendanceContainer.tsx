// component/attendance/AttendanceContainer.tsx
import React, { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, ListRenderItem } from "react-native";

import { useCamera } from "@/hooks/useCamera";
import { useGeofence } from "@/hooks/useGeofence";
import { useAttendanceStore } from "@/store/attendanceStore";

import { GEOFENCE_LOCATIONS } from "@/constants/geofenceLocation";
import { attendanceContainerStyles, globalStyles } from "@/constants/style";

import { useLocationStore } from "../../store/locationStore";
import { AudioRecorder } from "../audio/AudioRecorder";
import { CameraView } from "../camera/CameraView";
import { ExpandedMapView } from "../map/ExpandedMapView";
import { GeofenceMap } from "../map/GeofenceMap";
import { MapCard } from "../map/MapCard";
import { LoadingScreen } from "../ui/LoadingScreen";
import { PermissionScreen } from "../ui/PermissionScreen";
import { HomeView } from "./HomeView";

type ListItem = { id: string; type: "map" | "attendance" };

export function AttendanceContainer() {
  const {
    userId,
    isLoadingUserId,
    photos,
    audioRecording,
    currentView,
    uploading,
    currentPhotoIndex,
    retakeMode,
    selectedLocationLabel,
    TOTAL_PHOTOS,
    initializeUserId,
    setPhotos,
    setAudioRecording,
    setCurrentView,
    setCurrentPhotoIndex,
    setRetakeMode,
    setSelectedLocationLabel,
    setUploading,
    resetAll,
    todayAttendanceMarked,
    checkTodayAttendance,
  } = useAttendanceStore();

  const camera = useCamera();
  const { selectedGeofenceId, selectedLocationLabel: locationStoreLabel } =
    useLocationStore();

  const [showExpandedMap, setShowExpandedMap] = useState(false);
  const [isMapTouched, setIsMapTouched] = useState(false);
  const geofence = useGeofence(selectedGeofenceId);

  // Initialize user ID on mount
  useEffect(() => {
    if (isLoadingUserId && !userId) {
      initializeUserId();
    }
  }, [isLoadingUserId, userId, initializeUserId]);

  // Use useCallback to memoize the function
  const updateSelectedLocationLabel = useCallback(
    (label: string) => {
      setSelectedLocationLabel(label);
    },
    [setSelectedLocationLabel]
  );

  useEffect(() => {
    if (locationStoreLabel && selectedGeofenceId) {
      updateSelectedLocationLabel(locationStoreLabel);
    }
  }, [locationStoreLabel, selectedGeofenceId, updateSelectedLocationLabel]);

  useEffect(() => {
    const checkAttendance = () => {
      const isMarked = checkTodayAttendance();
      // Update the state if needed
    };
    checkAttendance();
  }, [checkTodayAttendance]);

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

        // If outside the selected location
        return `Outside (${selectedLocationLabel})`;
      }

      // If we can't determine, default to outside selected location
      return `Outside (${selectedLocationLabel})`;
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

    return "Outside (Unknown Location)";
  };

  const handleUpload = async () => {
    const finalLocation = resolveAttendanceLocation();
    if (!userId) return;

    setUploading(true);
    try {
      const { uploadAttendanceData } = await import(
        "@/services/attendanceService"
      );
      const result = await uploadAttendanceData({
        userId,
        photos,
        audioRecording: audioRecording || undefined,
        location: finalLocation,
      });

      if (result.success) {
        // Mark attendance for today
        const { markAttendanceForToday } = useAttendanceStore.getState();
        markAttendanceForToday(finalLocation);

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

  if (isLoadingUserId) return <LoadingScreen text="Loading user..." />;
  if (!camera.permission?.granted)
    return <PermissionScreen onRequestPermission={camera.requestPermission} />;
  if (uploading)
    return <LoadingScreen text="Uploading..." subtext="Please wait" />;
  if (showExpandedMap)
    return (
      <ExpandedMapView
        onClose={() => setShowExpandedMap(false)}
        mapComponent={mapComponent}
      />
    );

  switch (currentView) {
    case "audioRecorder":
      return (
        <AudioRecorder
          onBack={() => setCurrentView("home")}
          onRecordingComplete={(rec) => {
            setAudioRecording(rec);
            setCurrentView("home");
          }}
        />
      );
    case "camera":
      return (
        <CameraView
          camera={camera}
          currentPhotoIndex={currentPhotoIndex}
          retakeMode={retakeMode}
          totalPhotos={TOTAL_PHOTOS}
          onPhotoTaken={(photo) => {
            const next = [...photos];
            next[currentPhotoIndex] = photo;
            setPhotos(next);

            if (retakeMode) {
              setCurrentView("home");
              setRetakeMode(false);
            } else {
              setCurrentView("home");
            }
          }}
          onBack={() => {
            setCurrentView("home");
            setRetakeMode(false);
          }}
        />
      );
    default:
      const data: ListItem[] = [
        { id: "map", type: "map" },
        { id: "attendance", type: "attendance" },
      ];

      const renderItem: ListRenderItem<ListItem> = ({ item }) => {
        switch (item.type) {
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
                photos={photos}
                audioRecording={audioRecording}
                onTakePhotos={() => {
                  setCurrentPhotoIndex(0);
                  setRetakeMode(false);
                  setCurrentView("camera");
                }}
                onRetakePhoto={(idx) => {
                  setCurrentPhotoIndex(idx);
                  setRetakeMode(true);
                  setCurrentView("camera");
                }}
                onRetakeAll={() => {
                  resetAll();
                  setCurrentView("camera");
                }}
                onRecordAudio={() => setCurrentView("audioRecorder")}
                onUpload={handleUpload}
                uploading={uploading}
                totalPhotos={TOTAL_PHOTOS}
                selectedLocationLabel={selectedLocationLabel}
                todayAttendanceMarked={todayAttendanceMarked} // Add this line
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