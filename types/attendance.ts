import { CameraCapturedPicture } from "expo-camera";

export interface AudioRecording {
  uri: string;
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
