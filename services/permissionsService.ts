
import { AudioModule } from "expo-audio";
import * as Location from "expo-location";
import { Alert } from "react-native";

export interface PermissionStatus {
  camera: boolean;
  audio: boolean;
  location: boolean;
  allGranted: boolean;
}

export interface PermissionResult {
  success: boolean;
  permissions: PermissionStatus;
  error?: string;
}

class PermissionsService {
  async checkAllPermissions(): Promise<PermissionStatus> {
    try {
      // Check camera permission
      const cameraStatus = await this.checkCameraPermission();
      
      // Check audio permission
      const audioStatus = await this.checkAudioPermission();
      
      // Check location permission
      const locationStatus = await this.checkLocationPermission();

      const permissions: PermissionStatus = {
        camera: cameraStatus,
        audio: audioStatus,
        location: locationStatus,
        allGranted: cameraStatus && audioStatus && locationStatus,
      };

      return permissions;
    } catch (error) {
      console.error("Error checking permissions:", error);
      return {
        camera: false,
        audio: false,
        location: false,
        allGranted: false,
      };
    }
  }

  async requestAllPermissions(): Promise<PermissionResult> {
    try {
      console.log("Starting permission requests...");

      // Request camera permission
      const cameraResult = await this.requestCameraPermission();
      if (!cameraResult.success) {
        return {
          success: false,
          permissions: await this.checkAllPermissions(),
          error: cameraResult.error,
        };
      }

      // Request audio permission
      const audioResult = await this.requestAudioPermission();
      if (!audioResult.success) {
        return {
          success: false,
          permissions: await this.checkAllPermissions(),
          error: audioResult.error,
        };
      }

      // Request location permission
      const locationResult = await this.requestLocationPermission();
      if (!locationResult.success) {
        return {
          success: false,
          permissions: await this.checkAllPermissions(),
          error: locationResult.error,
        };
      }

      const finalPermissions = await this.checkAllPermissions();
      
      return {
        success: finalPermissions.allGranted,
        permissions: finalPermissions,
        error: finalPermissions.allGranted ? undefined : "Some permissions were not granted",
      };
    } catch (error) {
      console.error("Error requesting permissions:", error);
      return {
        success: false,
        permissions: await this.checkAllPermissions(),
        error: "Failed to request permissions",
      };
    }
  }

  private async checkCameraPermission(): Promise<boolean> {
    try {
      // Note: We can't directly check camera permissions without using the hook
      // This is a limitation of expo-camera. We'll handle this in the component.
      return false; // Will be overridden by the hook in component
    } catch (error) {
      console.error("Error checking camera permission:", error);
      return false;
    }
  }

  private async checkAudioPermission(): Promise<boolean> {
    try {
      const status = await AudioModule.getRecordingPermissionsAsync();
      return status.granted;
    } catch (error) {
      console.error("Error checking audio permission:", error);
      return false;
    }
  }

  private async checkLocationPermission(): Promise<boolean> {
    try {
      const status = await Location.getForegroundPermissionsAsync();
      return status.granted;
    } catch (error) {
      console.error("Error checking location permission:", error);
      return false;
    }
  }

  private async requestCameraPermission(): Promise<{ success: boolean; error?: string }> {
    try {
      // Camera permission will be handled by the hook in the component
      // This is just a placeholder
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: "Failed to request camera permission",
      };
    }
  }

  private async requestAudioPermission(): Promise<{ success: boolean; error?: string }> {
    try {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        return {
          success: false,
          error: "Microphone permission is required for voice verification during attendance marking.",
        };
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: "Failed to request microphone permission",
      };
    }
  }

  private async requestLocationPermission(): Promise<{ success: boolean; error?: string }> {
    try {
      const status = await Location.requestForegroundPermissionsAsync();
      if (!status.granted) {
        return {
          success: false,
          error: "Location permission is required to verify you are at the correct attendance location.",
        };
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: "Failed to request location permission",
      };
    }
  }

  showPermissionDeniedAlert(permissionType: string, explanation: string) {
    Alert.alert(
      `${permissionType} Permission Required`,
      `${explanation}\n\nYou can enable this permission in your device settings if you change your mind.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Open Settings",
          onPress: () => {
            // Note: Opening settings is platform-specific and may require additional setup
            Alert.alert(
              "Settings",
              "Please go to your device settings and enable the required permissions for this app."
            );
          },
        },
      ]
    );
  }

  showAllPermissionsRequiredAlert() {
    Alert.alert(
      "Permissions Required",
      "This app requires camera, microphone, and location permissions to function properly. Please grant all permissions to continue using the app.",
      [
        {
          text: "Try Again",
          onPress: () => this.requestAllPermissions(),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  }
}

export const permissionsService = new PermissionsService();