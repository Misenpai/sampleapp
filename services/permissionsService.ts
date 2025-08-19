// services/permissionsService.ts
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
      // Check audio permission
      const audioStatus = await this.checkAudioPermission();
      
      // Check location permission
      const locationStatus = await this.checkLocationPermission();

      const permissions: PermissionStatus = {
        camera: false, // Camera will be checked by the hook
        audio: audioStatus,
        location: locationStatus,
        allGranted: false,
      };

      // Note: Camera permission status will be set by the hook
      permissions.allGranted = permissions.audio && permissions.location;

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
      console.log("PermissionsService: Starting permission requests...");

      // Request audio permission
      const audioResult = await this.requestAudioPermission();
      console.log("PermissionsService: Audio permission result:", audioResult);
      
      if (!audioResult.success) {
        return {
          success: false,
          permissions: await this.checkAllPermissions(),
          error: audioResult.error,
        };
      }

      // Request location permission
      const locationResult = await this.requestLocationPermission();
      console.log("PermissionsService: Location permission result:", locationResult);
      
      if (!locationResult.success) {
        return {
          success: false,
          permissions: await this.checkAllPermissions(),
          error: locationResult.error,
        };
      }

      const finalPermissions = await this.checkAllPermissions();
      
      // Note: Camera permission is handled separately by the hook
      // We only check audio and location here
      const success = finalPermissions.audio && finalPermissions.location;
      
      return {
        success: success,
        permissions: finalPermissions,
        error: success ? undefined : "Some permissions were not granted",
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

  private async checkAudioPermission(): Promise<boolean> {
    try {
      const status = await AudioModule.getRecordingPermissionsAsync();
      console.log("Audio permission check:", status);
      return status.granted;
    } catch (error) {
      console.error("Error checking audio permission:", error);
      return false;
    }
  }

  private async checkLocationPermission(): Promise<boolean> {
    try {
      const status = await Location.getForegroundPermissionsAsync();
      console.log("Location permission check:", status);
      return status.granted;
    } catch (error) {
      console.error("Error checking location permission:", error);
      return false;
    }
  }

  private async requestAudioPermission(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("Requesting audio permission...");
      const status = await AudioModule.requestRecordingPermissionsAsync();
      console.log("Audio permission request result:", status);
      
      if (!status.granted) {
        return {
          success: false,
          error: "Microphone permission is required for voice verification during attendance marking.",
        };
      }
      return { success: true };
    } catch (error) {
      console.error("Error requesting audio permission:", error);
      return {
        success: false,
        error: "Failed to request microphone permission",
      };
    }
  }

  private async requestLocationPermission(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("Requesting location permission...");
      const status = await Location.requestForegroundPermissionsAsync();
      console.log("Location permission request result:", status);
      
      if (!status.granted) {
        return {
          success: false,
          error: "Location permission is required to verify you are at the correct attendance location.",
        };
      }
      return { success: true };
    } catch (error) {
      console.error("Error requesting location permission:", error);
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