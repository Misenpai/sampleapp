import React, { useMemo, useState } from "react";
import {
  FlatList,
  ListRenderItem,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAttendance } from "@/hooks/useAttendance";
import { useAudio } from "@/hooks/useAudio";
import { useCamera } from "@/hooks/useCamera";
import { useGeofence } from "@/hooks/useGeofence";

import { GEOFENCE_LOCATIONS } from "@/constants/geofenceLocation";
import {
  attendanceContainerStyles,
  dropdownStyles,
  globalStyles,
} from "@/constants/style";

import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { AudioRecorder } from "../audio/AudioRecorder";
import { CameraView } from "../camera/CameraView";
import { ExpandedMapView } from "../map/ExpandedMapView";
import { GeofenceMap } from "../map/GeofenceMap";
import { MapCard } from "../map/MapCard";
import { LoadingScreen } from "../ui/LoadingScreen";
import { PermissionScreen } from "../ui/PermissionScreen";
import { HomeView } from "./HomeView";

type ListItem = { id: string; type: "dropdown" | "map" | "attendance" };

export function AttendanceContainer() {
  const attendance = useAttendance();
  const camera = useCamera();
  const audio = useAudio();
  const geofence = useGeofence(attendance.selectedLocationLabel);

  const [showExpandedMap, setShowExpandedMap] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedGeofenceId, setSelectedGeofenceId] = useState<string | null>(
    null
  );

  /* ---------- dropdown options ---------- */
  const dropdownOptions = useMemo(() => {
    const opts = [{ id: "all", label: "Show All Departments" }];
    GEOFENCE_LOCATIONS.forEach((g) => opts.push({ id: g.id, label: g.label }));
    return opts;
  }, []);

  const selectedOptionLabel = useMemo(() => {
    if (!selectedGeofenceId) return "Show All Departments";
    return (
      dropdownOptions.find((o) => o.id === selectedGeofenceId)?.label ?? ""
    );
  }, [selectedGeofenceId, dropdownOptions]);

  /* ---------- dropdown selection handler ---------- */
  const handleDropdownSelect = (optionId: string) => {
    if (optionId === "all") {
      setSelectedGeofenceId(null);
      attendance.setSelectedLocationLabel(null);
    } else {
      const option = dropdownOptions.find((o) => o.id === optionId)!;
      setSelectedGeofenceId(option.id);
      attendance.setSelectedLocationLabel(option.label);
    }
    setDropdownVisible(false);
  };

  /* ---------- NEW: resolve final location ---------- */
  const resolveAttendanceLocation = () => {
    // 1. If user picked a specific department
    if (attendance.selectedLocationLabel) {
      // check if user is inside that department
      const fence = GEOFENCE_LOCATIONS.find(
        (g) => g.label === attendance.selectedLocationLabel
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
        if (inside) return attendance.selectedLocationLabel;
      }
      // not inside that department → default
      return "IIT Guwahati";
    }

    // 2. "Show All Departments" → auto-detect
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
    // fallback
    return "IIT Guwahati";
  };

  const handleUpload = async () => {
    const finalLocation = resolveAttendanceLocation();
    if (!attendance.userId) {
      attendance.handleUpload(); // will show its own alert
      return;
    }
    attendance.setUploading(true);
    try {
      const result = await import("@/services/attendanceService").then((m) =>
        m.default({
          userId: attendance.userId!,
          photos: attendance.photos,
          audioRecording: attendance.audioRecording || undefined,
          location: finalLocation,
        })
      );

      if (result.success) {
        attendance.resetAll();
      } else {
        alert(result.error ?? "Upload failed");
      }
    } catch {
      alert("Upload error");
    } finally {
      attendance.setUploading(false);
    }
  };

  /* ---------- dropdown render ---------- */
  const renderDropdown = () => (
    <View style={dropdownStyles.container}>
      <TouchableOpacity
        style={dropdownStyles.selector}
        onPress={() => setDropdownVisible(true)}
      >
        <Text style={dropdownStyles.selectorText} numberOfLines={1}>
          {selectedOptionLabel}
        </Text>
        <FontAwesome6
          name={dropdownVisible ? "chevron-up" : "chevron-down"}
          size={14}
          color="#666"
        />
      </TouchableOpacity>

      <Modal
        visible={dropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity
          style={dropdownStyles.modalOverlay}
          onPress={() => setDropdownVisible(false)}
        >
          <View style={dropdownStyles.dropdownMenu}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {dropdownOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    dropdownStyles.option,
                    selectedGeofenceId === opt.id &&
                      dropdownStyles.selectedOption,
                  ]}
                  onPress={() => handleDropdownSelect(opt.id)}
                >
                  <Text
                    style={[
                      dropdownStyles.optionText,
                      selectedGeofenceId === opt.id &&
                        dropdownStyles.selectedOptionText,
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {selectedGeofenceId === opt.id && (
                    <FontAwesome6 name="check" size={14} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );

  const mapComponent = React.useMemo(
    () => <GeofenceMap selectedGeofenceId={selectedGeofenceId} />,
    [selectedGeofenceId]
  );

  /* ---------- switch screens ---------- */
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
        dropdownComponent={renderDropdown()}
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
      const data: ListItem[] = [
        { id: "dropdown", type: "dropdown" },
        { id: "map", type: "map" },
        { id: "attendance", type: "attendance" },
      ];

      const renderItem: ListRenderItem<ListItem> = ({ item }) => {
        switch (item.type) {
          case "dropdown":
            return renderDropdown();
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
                selectedLocationLabel={attendance.selectedLocationLabel}
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
        />
      );
  }
}
