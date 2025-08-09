// store/attendanceStore.ts
import { create } from 'zustand';
import { CameraCapturedPicture } from 'expo-camera';
import { AudioRecording, ViewMode } from '../types/attendance';
import { Alert } from 'react-native';
import getOrCreateUserId from '../services/UserId';

interface AttendanceState {
  // State
  userId: string | null;
  isLoadingUserId: boolean;
  photos: CameraCapturedPicture[];
  audioRecording: AudioRecording | null;
  currentView: ViewMode;
  uploading: boolean;
  currentPhotoIndex: number;
  retakeMode: boolean;
  selectedLocationLabel: string | null;
  TOTAL_PHOTOS: number;

  // Actions
  initializeUserId: () => Promise<void>;
  setPhotos: (photos: CameraCapturedPicture[]) => void;
  setAudioRecording: (recording: AudioRecording | null) => void;
  setCurrentView: (view: ViewMode) => void;
  setCurrentPhotoIndex: (index: number) => void;
  setRetakeMode: (mode: boolean) => void;
  setSelectedLocationLabel: (label: string | null) => void;
  setUploading: (uploading: boolean) => void;
  resetAll: () => void;
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  // Initial state
  userId: null,
  isLoadingUserId: true,
  photos: [],
  audioRecording: null,
  currentView: 'home',
  uploading: false,
  currentPhotoIndex: 0,
  retakeMode: false,
  selectedLocationLabel: null,
  TOTAL_PHOTOS: 3,

  // Actions
  initializeUserId: async () => {
    try {
      const id = await getOrCreateUserId();
      if (!id) throw new Error("User ID null");
      console.log(id);
      set({ userId: id, isLoadingUserId: false });
    } catch {
      Alert.alert("Error", "Failed to initialize user ID");
      set({ isLoadingUserId: false });
    }
  },

  setPhotos: (photos) => set({ photos }),
  
  setAudioRecording: (recording) => set({ audioRecording: recording }),
  
  setCurrentView: (view) => set({ currentView: view }),
  
  setCurrentPhotoIndex: (index) => set({ currentPhotoIndex: index }),
  
  setRetakeMode: (mode) => set({ retakeMode: mode }),
  
  setSelectedLocationLabel: (label) => set({ selectedLocationLabel: label }),
  
  setUploading: (uploading) => set({ uploading }),
  
  resetAll: () => set({
    photos: [],
    audioRecording: null,
    currentPhotoIndex: 0,
    currentView: 'home',
    retakeMode: false,
    selectedLocationLabel: null,
  }),
}));