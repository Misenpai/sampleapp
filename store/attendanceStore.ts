// store/attendanceStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraCapturedPicture } from 'expo-camera';
import { Alert } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import getOrCreateUserId from '../services/UserId';
import { AudioRecording, ViewMode } from '../types/attendance';

interface AttendanceRecord {
  date: string; // YYYY-MM-DD format
  timestamp: number;
  location: string;
  photosCount: number;
  hasAudio: boolean;
}

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
  attendanceRecords: AttendanceRecord[];
  todayAttendanceMarked: boolean;

  // Actions
  initializeUserId: () => Promise<void>;
  setPhotos: (photos: CameraCapturedPicture[]) => void;
  setAudioRecording: (recording: AudioRecording | null) => void;
  setCurrentView: (view: ViewMode) => void;
  setCurrentPhotoIndex: (index: number) => void;
  setRetakeMode: (mode: boolean) => void;
  setSelectedLocationLabel: (label: string | null) => void;
  setUploading: (uploading: boolean) => void;
  markAttendanceForToday: (location: string) => void;
  checkTodayAttendance: () => boolean;
  resetAll: () => void;
}

const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // YYYY-MM-DD format
};

export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set, get) => ({
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
      attendanceRecords: [],
      todayAttendanceMarked: false,

      // Actions
      initializeUserId: async () => {
        try {
          const id = await getOrCreateUserId();
          if (!id) throw new Error("User ID null");
          console.log(id);
          set({ userId: id, isLoadingUserId: false });
          
          // Check today's attendance after initializing
          const todayMarked = get().checkTodayAttendance();
          set({ todayAttendanceMarked: todayMarked });
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

      markAttendanceForToday: (location: string) => {
        const today = getTodayDateString();
        const state = get();
        
        const newRecord: AttendanceRecord = {
          date: today,
          timestamp: Date.now(),
          location,
          photosCount: state.photos.length,
          hasAudio: !!state.audioRecording,
        };

        const updatedRecords = [
          ...state.attendanceRecords.filter(record => record.date !== today),
          newRecord
        ];

        set({ 
          attendanceRecords: updatedRecords,
          todayAttendanceMarked: true 
        });
      },

      checkTodayAttendance: () => {
        const today = getTodayDateString();
        const state = get();
        const todayRecord = state.attendanceRecords.find(record => record.date === today);
        return !!todayRecord;
      },
      
      resetAll: () => set({
        photos: [],
        audioRecording: null,
        currentPhotoIndex: 0,
        currentView: 'home',
        retakeMode: false,
        selectedLocationLabel: null,
      }),
    }),
    {
      name: 'attendance-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        attendanceRecords: state.attendanceRecords,
      }),
    }
  )
);