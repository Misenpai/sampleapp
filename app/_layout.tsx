// app/_layout.tsx
import {
  router,
  Stack,
  useRootNavigationState,
  useSegments,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { PermissionsLoadingScreen } from "../component/ui/PermissionsLoadingScreen";
import { TermsAndConditionsScreen } from "../component/ui/TermsAndConditionsScreen";
import { useAppPermissions } from "../hooks/useAppPermissions";
import { useAuthStore } from "../store/authStore";

function AuthGate({ children }: { children: React.ReactNode }) {
  const {
    session,
    isLoading,
    isInitialized,
    initializeAuth,
    hasAcceptedTerms,
    acceptTerms,
  } = useAuthStore();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const {
    requestAllPermissions,
    allPermissionsGranted,
    isRequestingPermissions,
    checkPermissions,
  } = useAppPermissions();
  
  const [showTermsScreen, setShowTermsScreen] = useState(false);
  const [isHandlingPermissions, setIsHandlingPermissions] = useState(false);
  const permissionRequestAttempts = useRef(0);
  const hasRequestedPermissions = useRef(false);

  // Initialize auth on mount
  useEffect(() => {
    if (!isInitialized) {
      initializeAuth();
    }
  }, [isInitialized, initializeAuth]);

  // Main navigation flow
  useEffect(() => {
    if (!navigationState?.key || isLoading || !isInitialized) return;

    const inAuthGroup = segments[0] === "(auth)";

    // Not logged in -> go to auth
    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
      return;
    }

    // Logged in and in auth screens
    if (session && inAuthGroup) {
      // Check terms first
      if (!hasAcceptedTerms) {
        setShowTermsScreen(true);
        return;
      }

      // Terms accepted, check permissions
      if (!allPermissionsGranted && !isHandlingPermissions && !hasRequestedPermissions.current) {
        console.log("User needs to grant permissions");
        hasRequestedPermissions.current = true;
        // Delay to ensure UI is ready
        setTimeout(() => {
          handleInitialPermissionRequest();
        }, 1000);
        return;
      }

      // Everything ready -> go to tabs
      if (hasAcceptedTerms && allPermissionsGranted) {
        router.replace("/(tabs)");
        hasRequestedPermissions.current = false; // Reset for next time
        return;
      }
    }

    // In main app but missing requirements
    if (session && !inAuthGroup) {
      if (!hasAcceptedTerms) {
        setShowTermsScreen(true);
        router.replace("/(auth)/login");
        return;
      }
      
      if (!allPermissionsGranted) {
        // User somehow got to tabs without permissions, send back
        router.replace("/(auth)/login");
        return;
      }
    }
  }, [
    session,
    segments,
    navigationState?.key,
    isLoading,
    isInitialized,
    hasAcceptedTerms,
    allPermissionsGranted,
    isHandlingPermissions,
  ]);

  const handleInitialPermissionRequest = async () => {
    if (isHandlingPermissions || isRequestingPermissions) {
      console.log("Already handling permissions");
      return;
    }

    console.log("Starting initial permission request");
    setIsHandlingPermissions(true);
    permissionRequestAttempts.current += 1;

    try {
      const success = await requestAllPermissions();
      console.log("Permission request completed, success:", success);

      if (success) {
        console.log("All permissions granted!");
        router.replace("/(tabs)");
      } else {
        // Only show alert if this is the first attempt
        if (permissionRequestAttempts.current === 1) {
          Alert.alert(
            "Permissions Required",
            "This app needs Camera, Microphone, and Location permissions to work properly.\n\nThe system will now ask for these permissions one by one. Please grant all of them.",
            [
              {
                text: "OK, I understand",
                onPress: () => {
                  setIsHandlingPermissions(false);
                  // Try again after user acknowledges
                  setTimeout(() => {
                    handleRetryPermissions();
                  }, 500);
                },
              },
              {
                text: "Sign Out",
                style: "destructive",
                onPress: () => {
                  useAuthStore.getState().signOut();
                  router.replace("/(auth)/login");
                },
              },
            ]
          );
        } else {
          // Subsequent attempts
          Alert.alert(
            "Permissions Still Required",
            "Some permissions were not granted. All permissions are required for the app to function.",
            [
              {
                text: "Try Again",
                onPress: () => {
                  setIsHandlingPermissions(false);
                  setTimeout(() => {
                    handleRetryPermissions();
                  }, 500);
                },
              },
              {
                text: "Sign Out",
                style: "destructive",
                onPress: () => {
                  useAuthStore.getState().signOut();
                  router.replace("/(auth)/login");
                },
              },
            ]
          );
        }
      }
    } catch (error) {
      console.error("Error during permission request:", error);
      Alert.alert(
        "Error",
        "There was an error requesting permissions. Please try again.",
        [
          {
            text: "Try Again",
            onPress: () => {
              setIsHandlingPermissions(false);
              setTimeout(() => {
                handleRetryPermissions();
              }, 500);
            },
          },
          {
            text: "Sign Out",
            style: "destructive",
            onPress: () => {
              useAuthStore.getState().signOut();
              router.replace("/(auth)/login");
            },
          },
        ]
      );
    } finally {
      setIsHandlingPermissions(false);
    }
  };

  const handleRetryPermissions = async () => {
    if (isHandlingPermissions || isRequestingPermissions) {
      console.log("Already handling permissions (retry)");
      return;
    }

    console.log("Retrying permission request");
    setIsHandlingPermissions(true);
    permissionRequestAttempts.current += 1;

    try {
      // First check current status
      await checkPermissions();
      
      // If still not all granted, request again
      if (!allPermissionsGranted) {
        const success = await requestAllPermissions();
        
        if (success) {
          console.log("Permissions granted on retry!");
          router.replace("/(tabs)");
        } else {
          // Show alert for retry
          Alert.alert(
            "Permissions Still Required",
            "Please grant all permissions to continue using the app.",
            [
              {
                text: "Try Again",
                onPress: () => {
                  setIsHandlingPermissions(false);
                  setTimeout(() => {
                    handleRetryPermissions();
                  }, 1000);
                },
              },
              {
                text: "Sign Out",
                style: "destructive",
                onPress: () => {
                  useAuthStore.getState().signOut();
                  router.replace("/(auth)/login");
                },
              },
            ]
          );
        }
      } else {
        // Permissions were actually granted
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.error("Error during permission retry:", error);
    } finally {
      setIsHandlingPermissions(false);
    }
  };

  const handleTermsAccept = async () => {
    try {
      await acceptTerms();
      setShowTermsScreen(false);
      hasRequestedPermissions.current = false; // Reset permission request flag
      permissionRequestAttempts.current = 0; // Reset attempts
      // Navigation will be handled by the effect
    } catch (error) {
      console.error("Error accepting terms:", error);
      Alert.alert("Error", "Failed to accept terms. Please try again.");
    }
  };

  // Show terms screen
  if (showTermsScreen && session && !hasAcceptedTerms) {
    return (
      <TermsAndConditionsScreen
        onAccept={handleTermsAccept}
        isProcessing={false}
      />
    );
  }

  // Show loading screen during permission setup
  if (session && hasAcceptedTerms && (isHandlingPermissions || isRequestingPermissions)) {
    return <PermissionsLoadingScreen message="Requesting permissions..." />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthGate>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </AuthGate>
  );
}