import { CameraCapturedPicture } from "expo-camera";

export interface AudioRecording {
  uri: string;
  duration?: number; // Duration in seconds
}

export interface AttendanceData {
  userId: string;
  photos: CameraCapturedPicture[];
  audioRecording?: AudioRecording;
}

export type ViewMode = "home" | "camera" | "audioRecorder";

export interface UploadResult {
  success: boolean;
  error?: string;
}
