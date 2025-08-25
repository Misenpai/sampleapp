// services/attendanceService.ts
import { useAttendanceStore } from "@/store/attendanceStore";
import { AttendanceProps } from "@/types/geofence";
import axios from "axios";
import { authService } from "./authService";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE;

export interface CheckoutResponse {
  success: boolean;
  
  data?: {
    checkOutTime: string;
    attendanceType: 'FULL_DAY' | 'HALF_DAY';
    message: string;
  };
  error?: string;
}

export interface TodayAttendanceResponse {
  success: boolean;
  data?: {
    attendanceKey: string;
    checkInTime: string;
    checkOutTime?: string;
    sessionType: 'FORENOON' | 'AFTERNOON';
    attendanceType?: 'FULL_DAY' | 'HALF_DAY';
    isCheckedOut: boolean;
    takenLocation?: string;
    photos?: any[];
    audio?: any[];
  };
  error?: string;
}

// Create axios instance with auth interceptor
const createAuthenticatedClient = async () => {
  const token = await authService.getAccessToken();
  
  return axios.create({
    baseURL: API_BASE,
    timeout: 30000,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  });
};

const createJsonClient = async () => {
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

export const uploadAttendanceData = async ({
  userId,
  photos,
  audioRecording,
  location,
}: AttendanceProps) => {
  try {
    if (!userId) {
      return { success: false, error: "User not logged in" };
    }

    // Check authentication
    const isAuthenticated = await authService.isAuthenticated();
    if (!isAuthenticated) {
      return { success: false, error: "Authentication required. Please login again." };
    }

    const client = await createAuthenticatedClient();
    const form = new FormData();
    const uploadTimestamp = Date.now();
    
    form.append("username", userId.toString());
    form.append("timestamp", uploadTimestamp.toString());
    
    if (location && location.trim()) {
      form.append("location", location);
    }

    const currentPhotoPosition = useAttendanceStore.getState().currentSessionPhotoPosition || 'front';
    form.append("photoType", currentPhotoPosition);

    photos.forEach((photo, idx) => {
      if (photo?.uri) {
        const photoFile = {
          uri: photo.uri,
          type: "image/jpeg",
          name: `photo_${idx}_${uploadTimestamp}.jpg`,
        };
        form.append("photos", photoFile as any);
      }
    });

    if (audioRecording?.uri) {
      const audioFile = {
        uri: audioRecording.uri,
        type: "audio/m4a",
        name: `audio_${uploadTimestamp}.m4a`,
      };
      form.append("audio", audioFile as any);
      
      if (audioRecording.duration) {
        form.append("audioDuration", audioRecording.duration.toString());
      }
    }

    const { data } = await client.post('/attendance', form);

    return { success: true, id: data.id, data: data.data };
  } catch (e: any) {
    console.error("Upload error:", e);
    
    // Handle authentication errors
    if (e.response?.status === 401) {
      return { 
        success: false, 
        error: "Authentication expired. Please login again." 
      };
    }
    
    return { 
      success: false, 
      error: e.response?.data?.error || e.message || "Upload failed"
    };
  }
};

export const checkoutAttendance = async (username: string): Promise<CheckoutResponse> => {
  try {
    // Check authentication
    const isAuthenticated = await authService.isAuthenticated();
    if (!isAuthenticated) {
      return { success: false, error: "Authentication required. Please login again." };
    }

    const client = await createJsonClient();
    const { data } = await client.post('/attendance/checkout', {
      username
    });

    return { 
      success: true, 
      data: data.data 
    };
  } catch (e: any) {
    console.error("Checkout error:", e);
    
    // Handle authentication errors
    if (e.response?.status === 401) {
      return { 
        success: false, 
        error: "Authentication expired. Please login again." 
      };
    }
    
    return { 
      success: false, 
      error: e.response?.data?.error || e.message || "Checkout failed"
    };
  }
};

export const getTodayAttendance = async (username: string): Promise<TodayAttendanceResponse> => {
  try {
    // Check authentication
    const isAuthenticated = await authService.isAuthenticated();
    if (!isAuthenticated) {
      return { success: false, error: "Authentication required. Please login again." };
    }

    const client = await createJsonClient();
    const { data } = await client.get(`/attendance/today/${username}`);

    return {
      success: data.success,
      data: data.data
    };
  } catch (e: any) {
    console.error("Get today attendance error:", e);
    
    // Handle authentication errors
    if (e.response?.status === 401) {
      return {
        success: false,
        error: "Authentication expired. Please login again."
      };
    }
    
    return {
      success: false,
      error: e.response?.data?.error || e.message || "Failed to get attendance"
    };
  }
};