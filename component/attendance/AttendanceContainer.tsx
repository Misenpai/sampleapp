import React from "react";
import { useAttendance } from "../../hooks/useAttendance";
import { useAudio } from "../../hooks/useAudio";
import { useCamera } from "../../hooks/useCamera";
import { AudioRecorder } from "../audio/AudioRecorder";
import { CameraView } from "../camera/CameraView";
import { LoadingScreen } from "../ui/LoadingScreen";
import { PermissionScreen } from "../ui/PermissionScreen";
import { HomeView } from "./HomeView";

export function AttendanceContainer() {
  const attendance = useAttendance();
  const camera = useCamera();
  const audio = useAudio();

  if (attendance.isLoadingUserId) {
    return <LoadingScreen text="Loading user data..." />;
  }

  if (!camera.permission?.granted) {
    return <PermissionScreen onRequestPermission={camera.requestPermission} />;
  }

  if (attendance.uploading) {
    return <LoadingScreen text="Uploading data..." subtext="Please wait" />;
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
  }
}
