// hooks/useProfile.ts
import { authService } from "@/services/authService";
import { AvatarData, getUserAvatar, saveUserAvatar } from "@/services/avatarStorageService";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import {
  getUserProfileByUsername,
  ProfileData,
  updateUserLocation,
} from "../services/profileService";
import { useAuthStore } from "../store/authStore";


export const useProfile = () => {
  const { userName, userId } = useAuthStore();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (userName) {
      fetchProfile();
    }
  }, [userName]);

  const updateLocation = async (newLocation: string) => {
    if (!profile?.empCode) return false;

    try {
      setUpdating(true);
      const response = await updateUserLocation(profile.empCode, newLocation);

      if (response.success && response.data) {
        setProfile(response.data);
        Alert.alert("Success", "Location updated successfully");
        return true;
      } else {
        Alert.alert("Error", response.error || "Failed to update location");
        return false;
      }
    } catch (error) {
      console.error("Location update error:", error);
      Alert.alert("Error", "Failed to update location");
      return false;
    } finally {
      setUpdating(false);
    }
  };

const fetchProfile = async () => {
  if (!userName) {
    console.log('No username available for profile fetch');
    setLoading(false);
    return;
  }

  try {
    setLoading(true);
    
    // Check if user is still authenticated before making request
    const isAuth = await authService.isAuthenticated();
    
    if (!isAuth) {
      console.log('User not authenticated, cannot fetch profile');
      // Don't show alert, let auth store handle navigation to login
      setLoading(false);
      return;
    }

    const response = await getUserProfileByUsername(userName);

    if (response.success && response.data) {
      // Load avatar from local storage
      const avatar = await getUserAvatar(response.data.empCode);
      setProfile({
        ...response.data,
        avatar,
      });
    } else {
      console.error('Profile fetch failed:', response.error);
      Alert.alert("Error", response.error || "Failed to fetch profile");
    }
  } catch (error) {
    console.error("Profile fetch error:", error);
    
    // Check if it's an authentication error
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof (error as any).response?.status === "number" &&
      (error as any).response.status === 401
    ) {
      console.log('Authentication error during profile fetch');
      // Let auth store handle this
    } else {
      Alert.alert("Error", "Failed to fetch profile data");
    }
  } finally {
    setLoading(false);
  }
};

  // Update the updateAvatar function
  const updateAvatar = async (avatarData: AvatarData) => {
    if (!profile?.empCode) return false;

    try {
      setUpdating(true);
      const success = await saveUserAvatar(profile.empCode, avatarData);

      if (success) {
        setProfile((prev) => (prev ? { ...prev, avatar: avatarData } : null));
        Alert.alert("Success", "Profile picture updated successfully");
        return true;
      } else {
        Alert.alert("Error", "Failed to update profile picture");
        return false;
      }
    } catch (error) {
      console.error("Avatar update error:", error);
      Alert.alert("Error", "Failed to update profile picture");
      return false;
    } finally {
      setUpdating(false);
    }
  };

  return {
    profile,
    loading,
    updating,
    fetchProfile,
    updateLocation,
    updateAvatar,
    userName,
    userId,
  };
};
