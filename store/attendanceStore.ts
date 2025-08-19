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
  lastAttendanceUpdate: number;

  // Field trip related state
  userLocationType: "ABSOLUTE" | "APPROX" | "FIELDTRIP" | null;
  isFieldTrip: boolean;
  fieldTripDates: { startDate: string; endDate: string }[];

  // Actions
  initializeUserId: () => Promise<void>;
  setUserId: (userId: string | null) => void;
  clearUserId: () => void;
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
  fetchTodayAttendanceFromServer: () => Promise<boolean>;
  triggerAttendanceUpdate: () => void;
  refreshAttendanceData: () => Promise<void>;
  setUserLocationType: (
    type: "ABSOLUTE" | "APPROX" | "FIELDTRIP" | null
  ) => void;
  checkFieldTripStatus: () => Promise<void>;
  fetchUserLocationSettings: () => Promise<void>;
}

const getTodayDateString = () => new Date().toISOString().split("T")[0];

const generateRandomPhotoPosition = (): PhotoPosition => {
  const positions: PhotoPosition[] = ["front", "left", "right"];
  return positions[Math.floor(Math.random() * positions.length)];
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
      lastAttendanceUpdate: 0,

      // Field trip state
      userLocationType: null,
      isFieldTrip: false,
      fieldTripDates: [],

      // Actions
      initializeUserId: async () => {
        try {
          set({ isLoadingUserId: true });
          const userData = await getUserData();

          if (userData?.isLoggedIn) {
            set({
              userId: userData.name,
              isLoadingUserId: false,
              isInitialized: true,
            });

            // Fetch user location settings first, then attendance
            await get().fetchUserLocationSettings();
            await get().fetchTodayAttendanceFromServer();
          } else {
            set({
              userId: null,
              isLoadingUserId: false,
              isInitialized: true,
              todayAttendanceMarked: false,
            });
          }
        } catch (err) {
          console.error("Error initializing user ID:", err);
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
          todayAttendanceMarked: false,
          attendanceRecords: [],
          lastAttendanceUpdate: Date.now(),
        });

        if (userId) {
          setTimeout(async () => {
            await get().fetchUserLocationSettings();
            await get().fetchTodayAttendanceFromServer();
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
          attendanceRecords: [],
lastAttendanceUpdate: Date.now(),
         userLocationType: null,
         isFieldTrip: false,
         fieldTripDates: [],
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
         set({
           currentView: view,
           currentSessionPhotoPosition: generateRandomPhotoPosition(),
         });
       } else {
         set({ currentView: view });
       }
     },

     setCurrentPhotoIndex: (i) => set({ currentPhotoIndex: i }),
     setRetakeMode: (m) => set({ retakeMode: m }),
     setSelectedLocationLabel: (label) =>
       set({ selectedLocationLabel: label }),
     setUploading: (u) => set({ uploading: u }),

     markAttendanceForToday: (location) => {
       const today = getTodayDateString();
       const state = get();
       const newRecord: AttendanceRecord = {
         date: today,
         timestamp: Date.now(),
         location,
         photosCount: state.photos.length,
         hasAudio: !!state.audioRecording,
       };
       set({
         attendanceRecords: [
           ...state.attendanceRecords.filter((r) => r.date !== today),
           newRecord,
         ],
         todayAttendanceMarked: true,
         lastAttendanceUpdate: Date.now(),
       });
       setTimeout(() => get().fetchTodayAttendanceFromServer(), 2000);
     },

     fetchTodayAttendanceFromServer: async () => {
       const state = get();
       if (!state.userId) return false;
       try {
         const res = await fetch(
           `${process.env.EXPO_PUBLIC_API_BASE}/attendance/today/${state.userId}`,
           { cache: "no-cache" }
         );
         const data = await res.json();
         const today = getTodayDateString();

         if (data.success && data.data) {
           const serverRecord: AttendanceRecord = {
             date: today,
             timestamp: new Date(data.data.checkInTime).getTime(),
             location: data.data.takenLocation || "Unknown",
             photosCount: data.data.photos?.length || 0,
             hasAudio: data.data.audio?.length > 0,
             checkInTime: data.data.checkInTime,
             checkOutTime: data.data.checkOutTime,
             sessionType: data.data.sessionType,
             attendanceType: data.data.attendanceType,
             isCheckedOut: data.data.isCheckedOut,
             takenLocation: data.data.takenLocation,
           };
           set({
             attendanceRecords: [
               ...state.attendanceRecords.filter((r) => r.date !== today),
               serverRecord,
             ],
             todayAttendanceMarked: true,
             lastAttendanceUpdate: Date.now(),
           });
           return true;
         } else {
           set({
             attendanceRecords: state.attendanceRecords.filter(
               (r) => r.date !== today
             ),
             todayAttendanceMarked: false,
             lastAttendanceUpdate: Date.now(),
           });
           return false;
         }
       } catch (err) {
         console.error("Error fetching attendance:", err);
         return get().checkTodayAttendance();
       }
     },

     checkTodayAttendance: () => {
       const today = getTodayDateString();
       const hasRecord = get().attendanceRecords.some((r) => r.date === today);
       if (get().todayAttendanceMarked !== hasRecord) {
         set({
           todayAttendanceMarked: hasRecord,
           lastAttendanceUpdate: Date.now(),
         });
       }
       return hasRecord;
     },

     getTodayPhotoPosition: () => get().currentSessionPhotoPosition || "front",

     generateNewPhotoPosition: () => {
       const pos = generateRandomPhotoPosition();
       set({ currentSessionPhotoPosition: pos });
       return pos;
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

     triggerAttendanceUpdate: () => set({ lastAttendanceUpdate: Date.now() }),

     refreshAttendanceData: async () => {
       if (!get().userId) return;
       await get().fetchUserLocationSettings();
       await get().fetchTodayAttendanceFromServer();
       get().triggerAttendanceUpdate();
     },

     setUserLocationType: (type) => set({ userLocationType: type }),

     // Fetch user location settings and preserve field trip dates
     fetchUserLocationSettings: async () => {
       const state = get();
       if (!state.userId) return;

       try {
         console.log("Fetching location settings for username:", state.userId);

         // Use username endpoint instead of empId
         const res = await fetch(
           `${process.env.EXPO_PUBLIC_API_BASE}/user-location/username/${state.userId}`,
           {
             method: "GET",
             headers: {
               "Content-Type": "application/json",
             },
             cache: "no-cache",
           }
         );

         const data = await res.json();
         console.log("Location settings response:", data);

         if (data.success && data.data) {
           const locationData = data.data;

           // Check if user is currently on a field trip
           const today = new Date();
           today.setHours(0, 0, 0, 0); // Reset time for date comparison

           const isOnTrip =
             locationData.fieldTrips?.some((trip: any) => {
               const start = new Date(trip.startDate);
               const end = new Date(trip.endDate);
               start.setHours(0, 0, 0, 0);
               end.setHours(23, 59, 59, 999);
               return today >= start && today <= end && trip.isActive;
             }) || false;

           set({
             userLocationType: locationData.locationType || "ABSOLUTE",
             // Always preserve field trip dates from server, regardless of location type
             fieldTripDates: locationData.fieldTrips || [],
             // Only set isFieldTrip true if currently on FIELDTRIP location type AND on an active trip
             isFieldTrip:
               locationData.locationType === "FIELDTRIP" && isOnTrip,
           });
           console.log("Updated location state:", {
             userLocationType: locationData.locationType || "ABSOLUTE",
             isFieldTrip:
               locationData.locationType === "FIELDTRIP" && isOnTrip,
             fieldTripsCount: locationData.fieldTrips?.length || 0,
           });
         } else {
           console.warn("Failed to fetch location settings:", data);
           // Don't clear existing field trip dates if API call fails
           const currentState = get();
           set({
             userLocationType: "ABSOLUTE",
             isFieldTrip: false,
             // Keep existing fieldTripDates if they exist
             fieldTripDates: currentState.fieldTripDates || [],
           });
         }
       } catch (err) {
         console.error("Error fetching user location settings:", err);
         // Don't clear existing field trip dates on error
         const currentState = get();
         set({
           userLocationType: "ABSOLUTE",
           isFieldTrip: false,
           // Keep existing fieldTripDates if they exist
           fieldTripDates: currentState.fieldTripDates || [],
         });
       }
     },

     // Simplified checkFieldTripStatus that uses fetchUserLocationSettings
     checkFieldTripStatus: async () => {
       await get().fetchUserLocationSettings();
     },
   }),
   {
     name: "attendance-storage",
     storage: createJSONStorage(() => AsyncStorage),
     partialize: (state) => ({
       attendanceRecords: state.attendanceRecords,
       lastAttendanceUpdate: state.lastAttendanceUpdate,
       userLocationType: state.userLocationType, // Persist location type
       fieldTripDates: state.fieldTripDates, // Always persist field trip dates
     }),
     onRehydrateStorage: () => (state) => {
       if (state) {
         state.lastAttendanceUpdate = Date.now();
         // Re-fetch location settings on app startup to ensure consistency
         if (state.userId) {
           setTimeout(() => {
             state.fetchUserLocationSettings();
           }, 1000);
         }
       }
     },
   }
 )
);