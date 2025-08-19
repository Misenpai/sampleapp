// app/_layout.tsx
import {
  router,
  Stack,
  useRootNavigationState,
  useSegments,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
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
    isSettingUpPermissions,
    setSettingUpPermissions,
  } = useAuthStore();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const {
    requestAllPermissions,
    allPermissionsGranted,
    isRequestingPermissions,
  } = useAppPermissions();
  const [showTermsScreen, setShowTermsScreen] = useState(false);

  // Initialize auth on mount
  useEffect(() => {
    if (!isInitialized) {
      initializeAuth();
    }
  }, [isInitialized, initializeAuth]);

  // Handle terms and permissions flow
  useEffect(() => {
    if (!navigationState?.key || isLoading || !isInitialized) return;

    const inAuthGroup = segments[0] === "(auth)";

    // If user is not logged in, go to auth
    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
      return;
    }

    // If user is logged in but in auth group, handle terms/permissions flow
    if (session && inAuthGroup) {
      // If user hasn't accepted terms, don't navigate yet
      if (!hasAcceptedTerms) {
        setShowTermsScreen(true);
        return;
      }
      // If terms accepted but permissions not granted, handle permissions
      if (
        hasAcceptedTerms &&
        !allPermissionsGranted &&
        !isRequestingPermissions
      ) {
        handlePermissionsRequest();
        return;
      }
      // Everything is ready, go to main app
      if (hasAcceptedTerms && allPermissionsGranted) {
        router.replace("/(tabs)");
        return;
      }
    }

    // If user is in main app but hasn't accepted terms or permissions
    if (session && !inAuthGroup) {
      if (!hasAcceptedTerms) {
        setShowTermsScreen(true);
        return;
      }
      if (!allPermissionsGranted && !isRequestingPermissions) {
        handlePermissionsRequest();
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
    isRequestingPermissions,
  ]);
  const handlePermissionsRequest = async () => {
    if (isSettingUpPermissions || isRequestingPermissions) return;
    setSettingUpPermissions(true);
    try {
      const success = await requestAllPermissions();
      if (success) {
        // All permissions granted, navigate to main app
        router.replace("/(tabs)");
      } else {
        // Some permissions were denied
        Alert.alert(
          "Permissions Required",
          "This app requires camera, microphone, and location permissions to function properly. Please grant all permissions to continue.",
          [
            {
              text: "Try Again",
              onPress: () => {
                setSettingUpPermissions(false);
                setTimeout(() => handlePermissionsRequest(), 500);
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
          ],
        );
      }
    } catch (error) {
      console.error("Error requesting permissions:", error);
      Alert.alert("Error", "Failed to set up permissions. Please try again.", [
        {
          text: "Try Again",
          onPress: () => {
            setSettingUpPermissions(false);
            setTimeout(() => handlePermissionsRequest(), 500);
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
      ]);
    } finally {
      setSettingUpPermissions(false);
    }
  };

  const handleTermsAccept = async () => {
    try {
      await acceptTerms();
      setShowTermsScreen(false);
      // After accepting terms, request permissions
      setTimeout(() => {
        handlePermissionsRequest();
      }, 500);
    } catch (error) {
      console.error("Error accepting terms:", error);
      Alert.alert("Error", "Failed to accept terms. Please try again.");
    }
  };

  // Show terms screen if needed
  if (showTermsScreen && session && !hasAcceptedTerms) {
    return (
      <TermsAndConditionsScreen
        onAccept={handleTermsAccept}
        isProcessing={false}
      />
    );
  }

  // Show permissions loading screen when setting up permissions
  if (
    session &&
    hasAcceptedTerms &&
    (isSettingUpPermissions || isRequestingPermissions)
  ) {
    return <PermissionsLoadingScreen />;
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
