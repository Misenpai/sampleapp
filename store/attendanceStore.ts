// store/attendanceStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraCapturedPicture } from "expo-camera";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getUserData } from "../services/UserId";
import { AudioRecording, ViewMode } from "../types/attendance";

interface AttendanceRecord {
  date: string;
  timestamp: number;
  location: string;
  photosCount: number;
  hasAudio: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  sessionType?: string;
  attendanceType?: string;
  isCheckedOut?: boolean;
  takenLocation?: string;
}

export type PhotoPosition = "front" | "left" | "right";

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
  setUserId: (userId: string | null) => void;
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
  clearUserId: () => void;
  fetchTodayAttendanceFromServer: () => Promise<boolean>;
}

const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const generateRandomPhotoPosition = (): PhotoPosition => {
  const positions: PhotoPosition[] = ["front", "left", "right"];
  const randomIndex = Math.floor(Math.random() * positions.length);
  return positions[randomIndex];
};

export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set, get) => ({
      // Initial state
      userId: null,
      isLoadingUserId: false,
      isInitialized: false,
      photos: [],
      audioRecording: null,
      currentView: "home",
      uploading: false,
      currentPhotoIndex: 0,
      retakeMode: false,
      selectedLocationLabel: null,
      TOTAL_PHOTOS: 1,
      attendanceRecords: [],
      todayAttendanceMarked: false,
      currentSessionPhotoPosition: null,

      // Actions
      initializeUserId: async () => {
        try {
          set({ isLoadingUserId: true });

          // Check if user is logged in first
          const userData = await getUserData();

          if (userData && userData.isLoggedIn) {
            // User is logged in, set the userId (which is the username)
            set({
              userId: userData.name,
              isLoadingUserId: false,
              isInitialized: true,
            });

            // Check server attendance first, then local
            const serverAttendanceExists =
              await get().fetchTodayAttendanceFromServer();
            if (!serverAttendanceExists) {
              // If no server attendance, double-check local records
              const localCheck = get().checkTodayAttendance();
              set({ todayAttendanceMarked: localCheck });
            }
          } else {
            // User is not logged in, don't show error
            set({
              userId: null,
              isLoadingUserId: false,
              isInitialized: true,
              todayAttendanceMarked: false,
            });
          }
        } catch (error) {
          console.error("Error initializing user ID:", error);
          set({
            userId: null,
            isLoadingUserId: false,
            isInitialized: true,
            todayAttendanceMarked: false,
          });
        }
      },

      setUserId: (userId) => {
        set({
          userId,
          isInitialized: true,
          isLoadingUserId: false,
          // Reset attendance status for new user
          todayAttendanceMarked: false,
          attendanceRecords: [], // Clear previous user's records
        });

        // Check attendance after setting userId
        if (userId) {
          setTimeout(async () => {
            const serverAttendanceExists =
              await get().fetchTodayAttendanceFromServer();
            if (!serverAttendanceExists) {
              const localCheck = get().checkTodayAttendance();
              set({ todayAttendanceMarked: localCheck });
            }
          }, 100);
        }
      },

      clearUserId: () => {
        set({
          userId: null,
          photos: [],
          audioRecording: null,
          currentView: "home",
          currentPhotoIndex: 0,
          retakeMode: false,
          selectedLocationLabel: null,
          currentSessionPhotoPosition: null,
          todayAttendanceMarked: false,
          attendanceRecords: [], // Clear all attendance records on logout
        });
      },

      setPhotos: (photos) => set({ photos }),

      setAudioRecording: (recording) => set({ audioRecording: recording }),

      setCurrentView: (view) => {
        const state = get();

        if (
          view === "camera" &&
          !state.retakeMode &&
          !state.currentSessionPhotoPosition
        ) {
          const newPosition = generateRandomPhotoPosition();
          set({
            currentView: view,
            currentSessionPhotoPosition: newPosition,
          });
        } else {
          set({ currentView: view });
        }
      },

      setCurrentPhotoIndex: (index) => set({ currentPhotoIndex: index }),

      setRetakeMode: (mode) => set({ retakeMode: mode }),

      setSelectedLocationLabel: (label) =>
        set({ selectedLocationLabel: label }),

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
          ...state.attendanceRecords.filter((record) => record.date !== today),
          newRecord,
        ];

        set({
          attendanceRecords: updatedRecords,
          todayAttendanceMarked: true,
        });
      },

      fetchTodayAttendanceFromServer: async () => {
        const state = get();
        if (!state.userId) return false;

        try {
          const response = await fetch(
            `${process.env.EXPO_PUBLIC_API_BASE}/attendance/today/${state.userId}`
          );
          const data = await response.json();

          if (data.success && data.data) {
            // Server has attendance record for today
            const today = getTodayDateString();
            const serverRecord: AttendanceRecord = {
              date: today,
              timestamp: new Date(data.data.checkInTime).getTime(),
              location: data.data.takenLocation || "Unknown",
              photosCount: data.data.photos?.length || 0,
              hasAudio: data.data.audio?.length > 0,
              // Add server-specific data
              checkInTime: data.data.checkInTime,
              checkOutTime: data.data.checkOutTime,
              sessionType: data.data.sessionType,
              attendanceType: data.data.attendanceType,
              isCheckedOut: data.data.isCheckedOut,
              takenLocation: data.data.takenLocation,
            };

            // Update local records with server data
            const updatedRecords = [
              ...state.attendanceRecords.filter(
                (record) => record.date !== today
              ),
              serverRecord,
            ];

            set({
              attendanceRecords: updatedRecords,
              todayAttendanceMarked: true,
            });

            return true;
          } else {
            // No server record found, ensure local state is also false
            const today = getTodayDateString();
            const updatedRecords = state.attendanceRecords.filter(
              (record) => record.date !== today
            );

            set({
              attendanceRecords: updatedRecords,
              todayAttendanceMarked: false,
            });

            return false;
          }
        } catch (error) {
          console.error("Error checking server attendance:", error);
          // On error, check local records as fallback
          return state.checkTodayAttendance();
        }
      },

      checkTodayAttendance: () => {
        const today = getTodayDateString();
        const state = get();
        const todayRecord = state.attendanceRecords.find(
          (record) => record.date === today
        );
        const isMarked = !!todayRecord;

        // Update the state if it's different
        if (state.todayAttendanceMarked !== isMarked) {
          set({ todayAttendanceMarked: isMarked });
        }

        return isMarked;
      },

      getTodayPhotoPosition: () => {
        const state = get();

        if (state.currentSessionPhotoPosition) {
          return state.currentSessionPhotoPosition;
        }

        return "front";
      },

      generateNewPhotoPosition: () => {
        const position = generateRandomPhotoPosition();
        set({ currentSessionPhotoPosition: position });
        return position;
      },

      resetAll: () =>
        set({
          photos: [],
          audioRecording: null,
          currentPhotoIndex: 0,
          currentView: "home",
          retakeMode: false,
          selectedLocationLabel: null,
          currentSessionPhotoPosition: null,
        }),
    }),
    {
      name: "attendance-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        attendanceRecords: state.attendanceRecords,
      }),
    }
  )
);