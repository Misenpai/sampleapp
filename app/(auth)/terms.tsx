// app/(auth)/terms.tsx
import { TermsAndConditionsScreen } from "@/component/ui/TermsAndConditionsScreen";
import { useAudio } from "@/hooks/useAudio";
import { useCamera } from "@/hooks/useCamera";
import { useGeofence as useLocation } from "@/hooks/useGeofence";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "expo-router";

export default function TermsScreen() {
  const { acceptTerms } = useAuthStore();
  const router = useRouter();

  const { requestPermission: requestCamera } = useCamera();
  const { requestPermission: requestMic } = useAudio();
  const { requestPermission: requestLocation } = useLocation();

  const handleAccept = async () => {
    await Promise.all([
      requestCamera(),
      requestMic(),
      requestLocation(),
    ]);
    await acceptTerms();
    router.replace("/(tabs)");
  };

  return <TermsAndConditionsScreen onAccept={handleAccept} />;
}