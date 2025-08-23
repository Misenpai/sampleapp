// hooks/useProfile.ts
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import {
  AvatarData,
  getUserProfileByUsername,
  ProfileData,
  updateUserLocation,
} from "../services/profileService";
import { useAuthStore } from "../store/authStore";
import { getUserAvatar, saveUserAvatar } from "@/services/avatarStorageService";

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
    if (!userName) return;

    try {
      setLoading(true);
      const response = await getUserProfileByUsername(userName);

      if (response.success && response.data) {
        // Load avatar from local storage
        const avatar = await getUserAvatar(response.data.empCode);
        setProfile({
          ...response.data,
          avatar,
        });
      } else {
        Alert.alert("Error", response.error || "Failed to fetch profile");
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      Alert.alert("Error", "Failed to fetch profile data");
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
