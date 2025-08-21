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

export type SessionType = 'FORENOON' | 'AFTERNOON';
export type AttendanceType = 'FULL_DAY' | 'HALF_DAY';

export interface AttendanceSession {
  sessionType: SessionType;
  checkInTime: string;
  checkOutTime?: string;
  attendanceType?: AttendanceType;
  isCheckedOut: boolean;
}