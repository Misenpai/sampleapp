// app/_layout.tsx
import { SessionTimer } from "@/component/ui/SessionTimer";
import { TermsAndConditionsScreen } from "@/component/ui/TermsAndConditionsScreen";
import { useAudio } from "@/hooks/useAudio";
import { useCamera } from "@/hooks/useCamera";
import { useGeofence as useLocation } from "@/hooks/useGeofence";
import { notificationService } from "@/services/pushNotificationService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import {
  router,
  Stack,
  useRootNavigationState,
  useSegments,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Alert, AppState, View } from "react-native";
import { useAuthStore } from "../store/authStore";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { 
    isAuthenticated, 
    isLoading, 
    isInitialized, 
    initializeAuth,
    checkSessionStatus,
    handleSessionExpiry 
  } = useAuthStore();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!isInitialized) {
      initializeAuth();
    }
  }, [isInitialized, initializeAuth]);

  useEffect(() => {
    if (!navigationState?.key || isLoading || !isInitialized) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, segments, navigationState?.key, isLoading, isInitialized]);

  // Handle app state changes for session management
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleAppStateChange = async (nextAppState: string) => {
      if (nextAppState === 'active') {
        // App came to foreground, check session status
        try {
          await checkSessionStatus();
        } catch (error) {
          console.error('Session check failed:', error);
          await handleSessionExpiry();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [isAuthenticated, checkSessionStatus, handleSessionExpiry]);

  return <>{children}</>;
}

function TermsGate({ children }: { children: React.ReactNode }) {
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean | null>(null);
  const [processing, setProcessing] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const { requestPermission: requestCamera } = useCamera();
  const { requestPermission: requestMic } = useAudio();
  const { requestPermission: requestLocation } = useLocation();

  // Check if terms have been accepted (only once after install)
  useEffect(() => {
    const checkTermsAcceptance = async () => {
      try {
        const accepted = await AsyncStorage.getItem("termsAcceptedOnce");
        setHasAcceptedTerms(accepted === "true");
      } catch (error) {
        console.error("Error checking terms acceptance:", error);
        setHasAcceptedTerms(false);
      }
    };

    checkTermsAcceptance();
  }, []);

  const handleAccept = async () => {
    setProcessing(true);
    try {
      // Request all required permissions
      const [cameraGranted, micGranted, locationGranted] = await Promise.all([
        requestCamera(),
        requestMic(), 
        requestLocation()
      ]);

      if (!cameraGranted || !micGranted || !locationGranted) {
        Alert.alert(
          'Permissions Required',
          'All permissions are required for the app to function properly. Please grant all permissions.',
          [{ text: 'OK' }]
        );
        setProcessing(false);
        return;
      }

      // Initialize notification service
      await notificationService.initialize();

      // Mark terms as accepted permanently
      await AsyncStorage.setItem("termsAcceptedOnce", "true");
      setHasAcceptedTerms(true);
    } catch (error) {
      console.error("Error accepting terms:", error);
      Alert.alert('Error', 'Failed to initialize app. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Loading state
  if (hasAcceptedTerms === null) {
    return null; // Or a loading screen
  }

  // Show terms only if not accepted AND user is logged in
  if (!hasAcceptedTerms && isAuthenticated) {
    return (
      <TermsAndConditionsScreen
        isProcessing={processing}
        onAccept={handleAccept}
      />
    );
  }

  return <>{children}</>;
}

function SessionStatusBar() {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) return null;
  
  return (
    <View style={{ 
      backgroundColor: '#f8f9fa', 
      paddingHorizontal: 16, 
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#e9ecef'
    }}>
      <SessionTimer />
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthGate>
      <TermsGate>
        {/* Reserve space for the status bar */}
        <View style={{ flex: 1, paddingTop: Constants.statusBarHeight }}>
          <SessionStatusBar />
          
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </View>

        <StatusBar style="auto" translucent={false} backgroundColor="#fff" />
      </TermsGate>
    </AuthGate>
  );
}