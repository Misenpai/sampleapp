// component/attendance/AttendanceContainer.tsx
import { FontAwesome6 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, AppState, FlatList, ListRenderItem, Text, View } from "react-native";

import { useCamera } from "@/hooks/useCamera";
import { useGeofence } from "@/hooks/useGeofence";
import { useAttendanceStore } from "@/store/attendanceStore";
import { useAuthStore } from "@/store/authStore";

import { colors } from "@/constants/colors";
import {
  attendanceContainerStyles,
  globalStyles,
} from "@/constants/style";

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
    isInitialized,
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
    // ✅ Added
    userLocationType,
    isFieldTrip,
    checkFieldTripStatus,
  } = useAttendanceStore();

  const { session, userName } = useAuthStore();
  const camera = useCamera();
  const { selectedGeofenceId, selectedLocationLabel: locationStoreLabel } =
    useLocationStore();

  const [showExpandedMap, setShowExpandedMap] = useState(false);
  const [isMapTouched, setIsMapTouched] = useState(false);

  // ✅ Pass location type & field trip status
  const geofence = useGeofence(selectedGeofenceId, userLocationType, isFieldTrip);

  useEffect(() => {
    if (session && userName && !isInitialized) {
      initializeUserId();
    }
  }, [session, userName, isInitialized, initializeUserId]);

  useEffect(() => {
    checkFieldTripStatus();
  }, [checkFieldTripStatus]);

  const canSelectLocation = userLocationType === "ABSOLUTE";

  const updateSelectedLocationLabel = useCallback(
    (label: string) => setSelectedLocationLabel(label),
    [setSelectedLocationLabel]
  );

  useEffect(() => {
    if (locationStoreLabel && selectedGeofenceId) {
      updateSelectedLocationLabel(locationStoreLabel);
    }
  }, [locationStoreLabel, selectedGeofenceId, updateSelectedLocationLabel]);

  useEffect(() => {
    checkTodayAttendance();
  }, [checkTodayAttendance]);

    useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (session && userName) {
        checkFieldTripStatus();
      }
    }, 1000);
    return () => clearInterval(refreshInterval);
  }, [session, userName, checkFieldTripStatus]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && session && userName) {
        checkFieldTripStatus();
      }
    });

    return () => subscription?.remove();
  }, [session, userName, checkFieldTripStatus]);


  // ✅ Updated with first snippet logic
  const resolveAttendanceLocation = () => {
    const activeLocations = geofence.activeGeofenceLocations;

    if (selectedLocationLabel && canSelectLocation) {
      const fence = activeLocations.find(
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

        return `Outside (${selectedLocationLabel})`;
      }
      return `Outside (${selectedLocationLabel})`;
    }

    for (const g of activeLocations) {
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

    return userLocationType === "APPROX"
      ? "Outside (IIT Guwahati)"
      : "Outside (Unknown Location)";
  };

  const handleUpload = async () => {
    const finalLocation = resolveAttendanceLocation();

    if (!userId) {
      Alert.alert("Error", "Please login to mark attendance");
      return;
    }

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
        const { markAttendanceForToday } = useAttendanceStore.getState();
        markAttendanceForToday(finalLocation);
        await useAttendanceStore.getState().fetchTodayAttendanceFromServer();

        Alert.alert("Success", "Attendance recorded!", [
          { text: "OK", onPress: resetAll },
        ]);
      } else {
        Alert.alert("Error", result.error ?? "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
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
    [geofence]
  );

  if (isLoadingUserId) return <LoadingScreen text="Loading..." />;
  if (isInitialized && !userId)
    return (
      <LoadingScreen text="Please login to continue" subtext="Redirecting..." />
    );
  if (!camera.permission?.granted)
    return <PermissionScreen onRequestPermission={camera.requestPermission} />;
  if (uploading)
    return <LoadingScreen text="Uploading..." subtext="Please wait" />;

  if (isFieldTrip) {
    return (
      <View style={attendanceContainerStyles.fieldTripContainer}>
        <LinearGradient
          colors={[colors.success, "#059669"]}
          style={attendanceContainerStyles.fieldTripGradient}
        >
          <FontAwesome6 name="route" size={48} color={colors.white} />
          <Text style={attendanceContainerStyles.fieldTripTitle}>
            Field Trip Mode
          </Text>
          <Text style={attendanceContainerStyles.fieldTripText}>
            Your attendance is automatically marked while on field trip
          </Text>
          <View style={attendanceContainerStyles.fieldTripInfo}>
            <FontAwesome6
              name="calendar-check"
              size={20}
              color={colors.white}
            />
            <Text style={attendanceContainerStyles.fieldTripDate}>
              Attendance marked for today
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

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
            setCurrentView("home");
            setRetakeMode(false);
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
                  const { generateNewPhotoPosition } =
                    useAttendanceStore.getState();
                  generateNewPhotoPosition();
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
                todayAttendanceMarked={todayAttendanceMarked}
                canSelectLocation={canSelectLocation}
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
