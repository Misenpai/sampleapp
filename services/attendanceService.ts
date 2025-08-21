// services/attendanceService.ts
import { useAttendanceStore } from "@/store/attendanceStore";
import { AttendanceProps } from "@/types/geofence";
import axios from "axios";

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

    const { data } = await axios.post(`${API_BASE}/attendance`, form, {
      headers: { 
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000,
    });

    return { success: true, id: data.id, data: data.data };
  } catch (e: any) {
    console.error("Upload error:", e);
    return { 
      success: false, 
      error: e.response?.data?.error || e.message || "Upload failed"
    };
  }
};

export const checkoutAttendance = async (username: string): Promise<CheckoutResponse> => {
  try {
    const { data } = await axios.post(`${API_BASE}/attendance/checkout`, {
      username
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    return { 
      success: true, 
      data: data.data 
    };
  } catch (e: any) {
    console.error("Checkout error:", e);
    return { 
      success: false, 
      error: e.response?.data?.error || e.message || "Checkout failed"
    };
  }
};

export const getTodayAttendance = async (username: string): Promise<TodayAttendanceResponse> => {
  try {
    const { data } = await axios.get(
      `${API_BASE}/attendance/today/${username}`,
      { timeout: 10000 }
    );

    return {
      success: data.success,
      data: data.data
    };
  } catch (e: any) {
    console.error("Get today attendance error:", e);
    return {
      success: false,
      error: e.response?.data?.error || e.message || "Failed to get attendance"
    };
  }
};