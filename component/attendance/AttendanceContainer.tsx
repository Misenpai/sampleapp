import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
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

import { GEOFENCE_LOCATIONS } from "@/constants/geofenceLocation";
import {
  attendanceContainerStyles,
  dropdownStyles,
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

type ListItem = {
  id: string;
  type: "dropdown" | "map" | "attendance";
};

type DropdownOption = {
  id: string;
  label: string;
};

export function AttendanceContainer() {
  const attendance = useAttendance();
  const camera = useCamera();
  const audio = useAudio();
  const [showExpandedMap, setShowExpandedMap] = useState(false);
  const [selectedGeofenceId, setSelectedGeofenceId] = useState<string | null>(
    null
  );
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const dropdownOptions: DropdownOption[] = useMemo(() => {
    const options: DropdownOption[] = [
      { id: "all", label: "Show All Departments" },
    ];

    GEOFENCE_LOCATIONS.forEach((location) => {
      options.push({
        id: location.id,
        label: location.label,
      });
    });

    return options;
  }, []);

  const selectedOptionLabel = useMemo(() => {
    if (!selectedGeofenceId) return "Show All Departments";
    const option = dropdownOptions.find((opt) => opt.id === selectedGeofenceId);
    return option?.label || "Show All Departments";
  }, [selectedGeofenceId, dropdownOptions]);

  const mapComponent = useMemo(
    () => <GeofenceMap selectedGeofenceId={selectedGeofenceId} />,
    [selectedGeofenceId]
  );

  const handleDropdownSelect = (optionId: string) => {
    setSelectedGeofenceId(optionId === "all" ? null : optionId);
    setDropdownVisible(false);
  };

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
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity
          style={dropdownStyles.modalOverlay}
          onPress={() => setDropdownVisible(false)}
        >
          <View style={dropdownStyles.dropdownMenu}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {dropdownOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    dropdownStyles.option,
                    (selectedGeofenceId === option.id ||
                      (selectedGeofenceId === null && option.id === "all")) &&
                      dropdownStyles.selectedOption,
                  ]}
                  onPress={() => handleDropdownSelect(option.id)}
                >
                  <Text
                    style={[
                      dropdownStyles.optionText,
                      (selectedGeofenceId === option.id ||
                        (selectedGeofenceId === null && option.id === "all")) &&
                        dropdownStyles.selectedOptionText,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {(selectedGeofenceId === option.id ||
                    (selectedGeofenceId === null && option.id === "all")) && (
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

  const data: ListItem[] = [
    { id: "dropdown", type: "dropdown" },
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
        dropdownComponent={renderDropdown()}
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
