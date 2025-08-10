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

export type PhotoPosition = 'front' | 'left' | 'right';

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
  todayPhotoPosition: PhotoPosition | null;

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
  getTodayPhotoPosition: () => PhotoPosition;
  resetAll: () => void;
}

const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // YYYY-MM-DD format
};

// Generate a deterministic random position based on userId and date
const generateDailyPhotoPosition = (userId: string, date: string): PhotoPosition => {
  // Create a seed from userId and date
  let seed = 0;
  const combined = userId + date;
  for (let i = 0; i < combined.length; i++) {
    seed = ((seed << 5) - seed) + combined.charCodeAt(i);
    seed = seed & seed; // Convert to 32-bit integer
  }
  
  // Use the seed to generate a number between 0-2
  const random = Math.abs(seed) % 3;
  const positions: PhotoPosition[] = ['front', 'left', 'right'];
  return positions[random];
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
      TOTAL_PHOTOS: 1, // Changed from 3 to 1
      attendanceRecords: [],
      todayAttendanceMarked: false,
      todayPhotoPosition: null,

      // Actions
      initializeUserId: async () => {
        try {
          const id = await getOrCreateUserId();
          if (!id) throw new Error("User ID null");
          console.log(id);
          set({ userId: id, isLoadingUserId: false });
          
          // Initialize today's photo position
          const today = getTodayDateString();
          const position = generateDailyPhotoPosition(id, today);
          set({ todayPhotoPosition: position });
          
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

      getTodayPhotoPosition: () => {
        const state = get();
        if (!state.userId) return 'front'; // Default fallback
        
        // If already calculated for today, return it
        if (state.todayPhotoPosition) {
          return state.todayPhotoPosition;
        }
        
        // Generate and store for today
        const today = getTodayDateString();
        const position = generateDailyPhotoPosition(state.userId, today);
        set({ todayPhotoPosition: position });
        return position;
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