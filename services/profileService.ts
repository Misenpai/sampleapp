import axios from "axios";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE;

export interface ProfileData {
  empCode: string;
  username: string;
  email: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileResponse {
  success: boolean;
  data?: ProfileData;
  error?: string;
  message?: string;
}

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export const getUserProfileByUsername = async (username: string): Promise<ProfileResponse> => {
  try {
    console.log('Fetching profile for username:', username);
    
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
    
    return {
      success: false,
      error: error.response?.data?.error || error.message || "Failed to fetch profile"
    };
  }
};

export const updateUserLocation = async (empId: string, location: string): Promise<ProfileResponse> => {
  try {
    console.log('Updating location for empId:', empId, 'to:', location);
    
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
    
    return {
      success: false,
      error: error.response?.data?.error || error.message || "Failed to update location"
    };
  }
};