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
  userId: string | null;
  isLoadingUserId: boolean;
  isInitialized: boolean;
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
  currentSessionPhotoPosition: PhotoPosition | null;

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
  generateNewPhotoPosition: () => PhotoPosition;
  resetAll: () => void;
}

const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // YYYY-MM-DD format
};

// Generate a truly random position
const generateRandomPhotoPosition = (): PhotoPosition => {
  const positions: PhotoPosition[] = ['front', 'left', 'right'];
  const randomIndex = Math.floor(Math.random() * positions.length);
  return positions[randomIndex];
};

export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set, get) => ({
      // Initial state
      userId: null,
      isLoadingUserId: true,
      isInitialized: false,
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
      currentSessionPhotoPosition: null,

      // Actions
      initializeUserId: async () => {
        try {
          const id = await getOrCreateUserId();
          if (!id) throw new Error("User ID null");
          console.log(id);
          set({ 
            userId: id, 
            isLoadingUserId: false,
            isInitialized: true 
          });
          
          // Check today's attendance after initializing
          const todayMarked = get().checkTodayAttendance();
          set({ todayAttendanceMarked: todayMarked });
        } catch {
          Alert.alert("Error", "Failed to initialize user ID");
          set({ 
            isLoadingUserId: false,
            isInitialized: true 
          });
        }
      },

      setPhotos: (photos) => set({ photos }),
      
      setAudioRecording: (recording) => set({ audioRecording: recording }),
      
      setCurrentView: (view) => {
        const state = get();
        
        // Generate a new random position when starting camera for the first time in this session
        // (not in retake mode and no position set yet)
        if (view === 'camera' && !state.retakeMode && !state.currentSessionPhotoPosition) {
          const newPosition = generateRandomPhotoPosition();
          set({ 
            currentView: view,
            currentSessionPhotoPosition: newPosition 
          });
        } else {
          set({ currentView: view });
        }
      },
      
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
        
        // If we already have a position for this session, return it
        // Don't set state here to avoid updates during render
        if (state.currentSessionPhotoPosition) {
          return state.currentSessionPhotoPosition;
        }
        
        // Return a default if not set yet (will be set when camera opens)
        return 'front';
      },

      generateNewPhotoPosition: () => {
        // This can be called to explicitly generate a new position
        const position = generateRandomPhotoPosition();
        set({ currentSessionPhotoPosition: position });
        return position;
      },
      
      resetAll: () => set({
        photos: [],
        audioRecording: null,
        currentPhotoIndex: 0,
        currentView: 'home',
        retakeMode: false,
        selectedLocationLabel: null,
        currentSessionPhotoPosition: null, // Reset the position for next attendance
      }),
    }),
    {
      name: 'attendance-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        attendanceRecords: state.attendanceRecords,
        // Don't persist currentSessionPhotoPosition - it should be fresh each session
      }),
    }
  )
);