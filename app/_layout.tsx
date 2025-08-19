// app/_layout.tsx
import { TermsAndConditionsScreen } from "@/component/ui/TermsAndConditionsScreen";
import { useAudio } from "@/hooks/useAudio";
import { useCamera } from "@/hooks/useCamera";
import { useGeofence as useLocation } from "@/hooks/useGeofence";
import { router, Stack, useRootNavigationState, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";

// ------------------------------------------------------------------
// 1) AuthGate – unchanged from your current file
// ------------------------------------------------------------------
function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, isLoading, isInitialized, initializeAuth } = useAuthStore();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!isInitialized) initializeAuth();
  }, [isInitialized, initializeAuth]);

  useEffect(() => {
    if (!navigationState?.key || isLoading || !isInitialized) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (session && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [session, segments, navigationState?.key, isLoading, isInitialized]);

  return <>{children}</>;
}

// ------------------------------------------------------------------
// 2) TermsGate – new: shows T&C once, then requests permissions
// ------------------------------------------------------------------
function TermsGate({ children }: { children: React.ReactNode }) {
  const { hasAcceptedTerms, acceptTerms } = useAuthStore();
  const [processing, setProcessing] = useState(false);

  const { requestPermission: requestCamera } = useCamera();
  const { requestPermission: requestMic } = useAudio();
  const { requestPermission: requestLocation } = useLocation();

  const handleAccept = async () => {
    setProcessing(true);
    // request all required permissions
    await Promise.all([
      requestCamera(),
      requestMic(),
      requestLocation(),
    ]);
    await acceptTerms();
    setProcessing(false);
  };

  if (!hasAcceptedTerms) {
    return (
      <TermsAndConditionsScreen
        isProcessing={processing}
        onAccept={handleAccept}
      />
    );
  }

  return <>{children}</>;
}

// ------------------------------------------------------------------
// 3) Root layout – wrap everything
// ------------------------------------------------------------------
export default function RootLayout() {
  return (
    <AuthGate>
      <TermsGate>
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </TermsGate>
    </AuthGate>
  );
}