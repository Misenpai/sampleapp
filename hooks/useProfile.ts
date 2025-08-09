// hooks/useProfile.ts
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { getUserProfileByUsername, ProfileData, updateUserLocation } from '../services/profileService';
import { useAuthStore } from '../store/authStore';

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

  const fetchProfile = async () => {
    if (!userName) return;
    
    try {
      setLoading(true);
      const response = await getUserProfileByUsername(userName);
      
      if (response.success && response.data) {
        setProfile(response.data);
      } else {
        Alert.alert('Error', response.error || 'Failed to fetch profile');
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      Alert.alert('Error', 'Failed to fetch profile data');
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = async (newLocation: string) => {
    if (!profile?.empId) return false;
    
    try {
      setUpdating(true);
      const response = await updateUserLocation(profile.empId, newLocation);
      
      if (response.success && response.data) {
        setProfile(response.data);
        Alert.alert('Success', 'Location updated successfully');
        return true;
      } else {
        Alert.alert('Error', response.error || 'Failed to update location');
        return false;
      }
    } catch (error) {
      console.error('Location update error:', error);
      Alert.alert('Error', 'Failed to update location');
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
    userName,
    userId,  
  };
};