// hooks/useAppPermissions.ts
import { useCameraPermissions } from "expo-camera";
import { useCallback, useEffect, useState } from "react";
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
      const audioAndLocationPermissions = await permissionsService.checkAllPermissions();
      
      const currentPermissions: PermissionStatus = {
        camera: cameraPermission?.granted || false,
        audio: audioAndLocationPermissions.audio,
        location: audioAndLocationPermissions.location,
        allGranted: false,
      };
      
      currentPermissions.allGranted = 
        currentPermissions.camera && 
        currentPermissions.audio && 
        currentPermissions.location;
      
      setPermissions(currentPermissions);
      
      console.log("Current permissions status:", {
        camera: currentPermissions.camera,
        audio: currentPermissions.audio,
        location: currentPermissions.location,
        allGranted: currentPermissions.allGranted
      });
    } catch (error) {
      console.error("Error checking permissions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [cameraPermission?.granted]);

  // Request all permissions sequentially
  const requestAllPermissions = useCallback(async (): Promise<boolean> => {
    console.log("=== Starting requestAllPermissions ===");
    
    if (isRequestingPermissions) {
      console.log("Already requesting permissions, returning false");
      return false;
    }
    
    setIsRequestingPermissions(true);
    
    try {
      let cameraGranted = false;
      let audioGranted = false;
      let locationGranted = false;

      // Step 1: Request camera permission
      console.log("Step 1: Requesting camera permission...");
      try {
        const cameraResult = await requestCameraPermission();
        cameraGranted = cameraResult?.granted || false;
        console.log("Camera permission result:", cameraGranted);
        
        if (!cameraGranted) {
          console.log("Camera permission was denied");
        }
      } catch (error) {
        console.error("Error requesting camera permission:", error);
        cameraGranted = false;
      }

      // Step 2: Request audio and location permissions
      console.log("Step 2: Requesting audio and location permissions...");
      try {
        const otherPermissionsResult = await permissionsService.requestAllPermissions();
        console.log("Other permissions result:", otherPermissionsResult);
        
        if (otherPermissionsResult.success) {
          audioGranted = otherPermissionsResult.permissions.audio;
          locationGranted = otherPermissionsResult.permissions.location;
        }
      } catch (error) {
        console.error("Error requesting other permissions:", error);
      }

      // Step 3: Update permission states
      const finalPermissions: PermissionStatus = {
        camera: cameraGranted,
        audio: audioGranted,
        location: locationGranted,
        allGranted: cameraGranted && audioGranted && locationGranted
      };
      
      setPermissions(finalPermissions);
      
      console.log("=== Final permission status ===", {
        camera: cameraGranted,
        audio: audioGranted,
        location: locationGranted,
        allGranted: finalPermissions.allGranted
      });
      
      // Don't show alert here - let the parent component handle it
      return finalPermissions.allGranted;
      
    } catch (error) {
      console.error("Unexpected error in requestAllPermissions:", error);
      return false;
    } finally {
      setIsRequestingPermissions(false);
      console.log("=== requestAllPermissions complete ===");
    }
  }, [requestCameraPermission, isRequestingPermissions]);

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