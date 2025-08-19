// hooks/useAppPermissions.ts
import { useCameraPermissions } from "expo-camera";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { permissionsService, PermissionStatus } from "../services/permissionsService";

export interface AppPermissionsHook {
  permissions: PermissionStatus;
  isLoading: boolean;
  isRequestingPermissions: boolean;
  allPermissionsGranted: boolean;
  requestAllPermissions: () => Promise<boolean>;
  checkPermissions: () => Promise<void>;
}

export function useAppPermissions(): AppPermissionsHook {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  
  const [permissions, setPermissions] = useState<PermissionStatus>({
    camera: false,
    audio: false,
    location: false,
    allGranted: false,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestingPermissions, setIsRequestingPermissions] = useState(false);

  // Check all permissions
  const checkPermissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const audioPermissions = await permissionsService.checkAllPermissions();
      
      const currentPermissions: PermissionStatus = {
        camera: cameraPermission?.granted || false,
        audio: audioPermissions.audio,
        location: audioPermissions.location,
        allGranted: false,
      };
      
      currentPermissions.allGranted = 
        currentPermissions.camera && 
        currentPermissions.audio && 
        currentPermissions.location;
      
      setPermissions(currentPermissions);
    } catch (error) {
      console.error("Error checking permissions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [cameraPermission?.granted]);

  // Request all permissions
  const requestAllPermissions = useCallback(async (): Promise<boolean> => {
    setIsRequestingPermissions(true);
    try {
      console.log("Requesting all permissions...");
      
      // Request camera permission first
      const cameraResult = await requestCameraPermission();
      if (!cameraResult?.granted) {
        Alert.alert(
          "Camera Permission Required",
          "Camera access is required to capture attendance photos. Please grant camera permission to continue.",
          [{ text: "OK" }]
        );
        setIsRequestingPermissions(false);
        await checkPermissions();
        return false;
      }

      // Request other permissions
      const result = await permissionsService.requestAllPermissions();
      
      if (!result.success) {
        if (result.error) {
          Alert.alert("Permission Required", result.error, [{ text: "OK" }]);
        }
        await checkPermissions();
        return false;
      }

      // Final check
      await checkPermissions();
      
      const finalCheck = await permissionsService.checkAllPermissions();
      const allGranted = cameraResult?.granted && finalCheck.allGranted;
      
      if (!allGranted) {
        Alert.alert(
          "Permissions Required",
          "All permissions (Camera, Microphone, and Location) are required for the app to function properly. Please grant all permissions.",
          [{ text: "OK" }]
        );
      }
      
      return allGranted;
    } catch (error) {
      console.error("Error requesting permissions:", error);
      Alert.alert(
        "Permission Error",
        "Failed to request permissions. Please try again.",
        [{ text: "OK" }]
      );
      await checkPermissions();
      return false;
    } finally {
      setIsRequestingPermissions(false);
    }
  }, [requestCameraPermission, checkPermissions]);

  // Check permissions on mount and when camera permission changes
  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  return {
    permissions,
    isLoading,
    isRequestingPermissions,
    allPermissionsGranted: permissions.allGranted,
    requestAllPermissions,
    checkPermissions,
  };
}