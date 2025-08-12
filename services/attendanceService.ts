// services/attendanceService.ts
import { useAttendanceStore } from "@/store/attendanceStore";
import { AttendanceProps } from "@/types/geofence";
import axios from "axios";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE;


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
    
    // Ensure values are strings and not null/undefined
    form.append("username", userId.toString());
    form.append("timestamp", uploadTimestamp.toString());
    
    // Only append location if it exists and is not null/undefined
    if (location && location.trim()) {
      form.append("location", location);
    }

    // Get the current photo position from the store
    const currentPhotoPosition = useAttendanceStore.getState().currentSessionPhotoPosition || 'front';
    form.append("photoType", currentPhotoPosition);

    // Add photos with better error handling
    photos.forEach((photo, idx) => {
      if (photo?.uri) {
        const photoFile = {
          uri: photo.uri,
          type: "image/jpeg",
          name: `photo_${idx}_${uploadTimestamp}.jpg`, // Use timestamp for unique name
        };
        form.append("photos", photoFile as any);
      }
    });

    // Add audio with duration if available
    if (audioRecording?.uri) {
      const audioFile = {
        uri: audioRecording.uri,
        type: "audio/m4a", // Changed from mp4 to m4a
        name: `audio_${uploadTimestamp}.m4a`,
      };
      form.append("audio", audioFile as any);
      
      // Add audio duration if available
      if (audioRecording.duration) {
        form.append("audioDuration", audioRecording.duration.toString());
      }
    }

    console.log("Uploading attendance data:", {
      username: userId,
      location: location,
      photosCount: photos.length,
      hasAudio: !!audioRecording?.uri
    });

    

    const { data } = await axios.post(`${API_BASE}/attendance`, form, {
      headers: { 
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000, // 30 second timeout
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

export const checkoutAttendance = async (userId: string) => {
  try {
    if (!userId) {
      return { success: false, error: "User not logged in" };
    }

    const { data } = await axios.post(`${API_BASE}/attendance/checkout`, {
      username: userId
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    return { success: true, data: data.data };
  } catch (e: any) {
    console.error("Checkout error:", e);
    return { 
      success: false, 
      error: e.response?.data?.error || e.message || "Checkout failed"
    };
  }
};