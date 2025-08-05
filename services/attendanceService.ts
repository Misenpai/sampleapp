import { AttendanceProps } from "@/types/geofence";
import axios from "axios";

const API_BASE = "http://10.150.11.131:3000/api";

export const uploadAttendanceData = async ({
  userId,
  photos,
  audioRecording,
  location,
}: AttendanceProps) => {
  try {
    const ts = Date.now().toString();

    const form = new FormData();

    form.append("userId", userId);
    form.append("ts", ts);
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

export default uploadAttendanceData;
