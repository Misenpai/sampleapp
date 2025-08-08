
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
    if (!userId){
      return { success: false, error: "User not logged in" }
    }

    const form = new FormData();

    const uploadTimestamp = Date.now();
    
    form.append("username", userId);
    form.append("timestamp", uploadTimestamp.toString());
    if (location) form.append("location", location);

    photos.forEach((p, idx) => {
      if (!p.uri) return;
      form.append("photos", {
        uri: p.uri,
        type: "image/jpeg",
        name: p.name || `photo_${idx}.jpg`,
      } as any);
    });

    if (audioRecording?.uri) {
      form.append("audio", {
        uri: audioRecording.uri,
        type: "audio/mp4",
        name: "audio_rec.m4a",
      } as any);
    }

    const { data } = await axios.post(`${API_BASE}/attendance`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return { success: true, id: data.id };
  } catch (e: any) {
    return { success: false, error: e.response?.data?.error || e.message };
  }
};