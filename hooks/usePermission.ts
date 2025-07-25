import { AudioModule } from "expo-audio";
import { useCameraPermissions } from "expo-camera";
import { useEffect, useState } from "react";

export function usePermissions() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [audioPermission, setAudioPermission] = useState<boolean>(false);

  useEffect(() => {
    const requestAudioPermission = async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      setAudioPermission(status.granted);
    };
    requestAudioPermission();
  }, []);

  return {
    cameraPermission,
    requestCameraPermission,
    audioPermission,
    allPermissionsGranted: cameraPermission?.granted && audioPermission,
  };
}
