// services/profileService.ts - Fixed version
import axios from "axios";
import { authService } from "./authService";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE;

export interface ProfileData {
  empCode: string;
  username: string;
  email: string;
  location: string;
  createdAt: string;
  updatedAt: string;
  avatar?: import("@/services/avatarStorageService").AvatarData;
}

export interface ProfileResponse {
  success: boolean;
  data?: ProfileData;
  error?: string;
  message?: string;
}

// Create authenticated API client
const createApiClient = async () => {
  const token = await authService.getAccessToken();
  
  return axios.create({
    baseURL: API_BASE,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  });
};

export const getUserProfileByUsername = async (username: string): Promise<ProfileResponse> => {
  try {
    console.log('Fetching profile for username:', username);
    
    // Check authentication first
    const isAuthenticated = await authService.isAuthenticated();
    if (!isAuthenticated) {
      return {
        success: false,
        error: "Authentication required. Please login again."
      };
    }

    const apiClient = await createApiClient();
    const { data } = await apiClient.get(`/profile/username/${username}`);
    
    console.log('Profile response:', data);
    
    return {
      success: data.success,
      data: {
        ...data.data,
        empId: data.data.empCode,  // Map empCode to empId for backward compatibility
      }
    };
  } catch (error: any) {
    console.error('Get profile error:', error);
    
    // Handle authentication errors specifically
    if (error.response?.status === 401) {
      return {
        success: false,
        error: "Authentication expired. Please login again."
      };
    }
    
    return {
      success: false,
      error: error.response?.data?.error || error.message || "Failed to fetch profile"
    };
  }
};

export const updateUserLocation = async (empId: string, location: string): Promise<ProfileResponse> => {
  try {
    console.log('Updating location for empId:', empId, 'to:', location);
    
    // Check authentication first
    const isAuthenticated = await authService.isAuthenticated();
    if (!isAuthenticated) {
      return {
        success: false,
        error: "Authentication required. Please login again."
      };
    }

    const apiClient = await createApiClient();
    const { data } = await apiClient.patch(`/profile/${empId}/location`, { location });
    
    console.log('Update location response:', data);
    
    return {
      success: data.success,
      data: {
        ...data.data,
        empId: data.data.empCode,  // Map for backward compatibility
      },
      message: data.message
    };
  } catch (error: any) {
    console.error('Update location error:', error);
    
    // Handle authentication errors specifically
    if (error.response?.status === 401) {
      return {
        success: false,
        error: "Authentication expired. Please login again."
      };
    }
    
    return {
      success: false,
      error: error.response?.data?.error || error.message || "Failed to update location"
    };
  }
};