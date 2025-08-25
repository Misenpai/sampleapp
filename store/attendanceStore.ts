// store/attendanceStore.ts
import { authService } from "@/services/authService";
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
  sessionType?: "FORENOON" | "AFTERNOON";
  attendanceType?: "FULL_DAY" | "HALF_DAY";
  isCheckedOut?: boolean;
  takenLocation?: string;
  attendanceKey?: string;
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

  // NEW: Session & checkout
  currentSessionType: "FORENOON" | "AFTERNOON" | null;
  canCheckout: boolean;

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

  // NEW: Checkout & session helpers
  checkoutAttendance: () => Promise<boolean>;
  getCurrentSessionType: () => "FORENOON" | "AFTERNOON" | "OUTSIDE";
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

      // NEW: Session & checkout
      currentSessionType: null,
      canCheckout: false,

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
          currentSessionType: null,
          canCheckout: false,
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
          currentSessionType: null,
          canCheckout: false,
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
        const sessionType = state.getCurrentSessionType();
        const newRecord: AttendanceRecord = {
          date: today,
          timestamp: Date.now(),
          location,
          photosCount: state.photos.length,
          hasAudio: !!state.audioRecording,
          sessionType: sessionType === "OUTSIDE" ? undefined : sessionType,
        };
        set({
          attendanceRecords: [
            ...state.attendanceRecords.filter((r) => r.date !== today),
            newRecord,
          ],
          todayAttendanceMarked: true,
          lastAttendanceUpdate: Date.now(),
          currentSessionType: sessionType === "OUTSIDE" ? null : sessionType,
          canCheckout: sessionType !== "OUTSIDE",
        });
        setTimeout(() => get().fetchTodayAttendanceFromServer(), 2000);
      },

      fetchTodayAttendanceFromServer: async () => {
        const state = get();
        if (!state.userId) return false;

        try {
          const token = await authService.getAccessToken(); // 🔑 grab token
          const res = await fetch(
            `${process.env.EXPO_PUBLIC_API_BASE}/attendance/today/${state.userId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              cache: "no-cache",
            }
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
              attendanceKey: data.data.attendanceKey,
            };
            const canCheckout =
              !data.data.isCheckedOut && data.data.sessionType !== undefined;
            set({
              attendanceRecords: [
                ...state.attendanceRecords.filter((r) => r.date !== today),
                serverRecord,
              ],
              todayAttendanceMarked: true,
              lastAttendanceUpdate: Date.now(),
              currentSessionType: serverRecord.sessionType || null,
              canCheckout,
            });
            return true;
          } else {
            set({
              attendanceRecords: state.attendanceRecords.filter(
                (r) => r.date !== today
              ),
              todayAttendanceMarked: false,
              lastAttendanceUpdate: Date.now(),
              currentSessionType: null,
              canCheckout: false,
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
        const state = get();
        if (!state.userId) return;

        try {
          console.log("Checking field trip status for username:", state.userId);

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
          console.log("Field trip check response:", data);

          if (data.success && data.data) {
            const locationData = data.data;

            // Check if user is currently on a field trip
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let isOnTrip = false;
            let previousLocationType = locationData.locationType;

            // Store the non-fieldtrip location type
            if (locationData.locationType !== "FIELDTRIP") {
              // Store this as the default location type
              await AsyncStorage.setItem(
                "defaultLocationType",
                locationData.locationType
              );
            } else {
              // Retrieve the stored default location type
              const stored = await AsyncStorage.getItem("defaultLocationType");
              if (stored) {
                previousLocationType = stored as "ABSOLUTE" | "APPROX";
              }
            }

            // Check if today falls within any field trip dates
            if (locationData.fieldTrips && locationData.fieldTrips.length > 0) {
              isOnTrip = locationData.fieldTrips.some((trip: any) => {
                const start = new Date(trip.startDate);
                const end = new Date(trip.endDate);
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                return today >= start && today <= end && trip.isActive;
              });
            }

            // Set location type based on whether we're on a field trip today
            const effectiveLocationType = isOnTrip
              ? "FIELDTRIP"
              : previousLocationType;

            set({
              userLocationType: effectiveLocationType,
              fieldTripDates: locationData.fieldTrips || [],
              isFieldTrip: isOnTrip,
            });

            console.log("Updated location state:", {
              userLocationType: effectiveLocationType,
              isFieldTrip: isOnTrip,
              fieldTripsCount: locationData.fieldTrips?.length || 0,
            });
          }
        } catch (err) {
          console.error("Error checking field trip status:", err);
        }
      },

      // NEW: Checkout & session helpers
      getCurrentSessionType: () => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const timeInMinutes = hours * 60 + minutes;

        // Forenoon: 9:30 AM to 1:00 PM
        if (timeInMinutes >= 570 && timeInMinutes < 780) {
          return "FORENOON";
        }
        // Afternoon: 1:00 PM to 5:30 PM
        else if (timeInMinutes >= 780 && timeInMinutes <= 1050) {
          return "AFTERNOON";
        }
        return "OUTSIDE";
      },

      checkoutAttendance: async () => {
        const state = get();
        if (!state.userId) return false;

        try {
          const { checkoutAttendance } = await import(
            "../services/attendanceService"
          );
          const result = await checkoutAttendance(state.userId);

          if (result.success) {
            // Update local state
            await state.fetchTodayAttendanceFromServer();
            return true;
          }
          return false;
        } catch (error) {
          console.error("Checkout error:", error);
          return false;
        }
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
        currentSessionType: state.currentSessionType,
        canCheckout: state.canCheckout,
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
