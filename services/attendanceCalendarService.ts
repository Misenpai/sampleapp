// services/attendanceCalendarService.ts
import axios from "axios";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE;

export interface AttendanceDate {
  id: number;
  empId: string;
  date: string;
  year: number;
  month: number;
  day: number;
  dayOfWeek: number;
  weekOfYear: number;
  isPresent: boolean;
  attendanceType?: 'FULL_DAY' | 'HALF_DAY' | null; // Added this field
  attendance: {
    takenLocation: string | null;
    checkInTime: string;
    checkOutTime: string | null;
    sessionType?: 'FORENOON' | 'AFTERNOON'; // Added this field
    attendanceType?: 'FULL_DAY' | 'HALF_DAY' | null; // Added this field
    isCheckedOut?: boolean; // Added this field
  };
}

export interface AttendanceStatistics {
  totalDays: number;
  totalFullDays: number; // Added
  totalHalfDays: number; // Added
  currentStreak: number;
  longestStreak: number;
  lastAttendance: string | null;
}

export interface AttendanceCalendarResponse {
  success: boolean;
  data?: {
    dates: AttendanceDate[];
    statistics: AttendanceStatistics;
  };
  error?: string;
}

export interface AttendanceHistoryResponse {
  success: boolean;
  data?: {
    attendances: any[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
    };
  };
  error?: string;
}

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getAttendanceCalendar = async (
  empId: string,
  year?: number,
  month?: number
): Promise<AttendanceCalendarResponse> => {
  try {
    const params: any = {};
    if (year) params.year = year;
    if (month) params.month = month;

    const { data } = await apiClient.get(
      `/attendance/calendar/${empId}`,
      { params }
    );

    return {
      success: data.success,
      data: data.data,
    };
  } catch (error: any) {
    console.error("Get attendance calendar error:", error);

    return {
      success: false,
      error:
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch attendance calendar",
    };
  }
};

export const getAttendanceHistory = async (
  empId: string,
  startDate?: string,
  endDate?: string,
  limit: number = 30,
  offset: number = 0
): Promise<AttendanceHistoryResponse> => {
  try {
    const params: any = { limit, offset };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const { data } = await apiClient.get(
      `/attendance/history/${empId}`,
      { params }
    );

    return {
      success: data.success,
      data: data.data,
    };
  } catch (error: any) {
    console.error("Get attendance history error:", error);

    return {
      success: false,
      error:
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch attendance history",
    };
  }
};

// Helper function to format dates for display
export const formatAttendanceDate = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Updated helper function to get marked dates with half/full day colors
export const getMarkedDates = (attendanceDates: AttendanceDate[]) => {
  const marked: { [key: string]: any } = {};

  attendanceDates.forEach((item) => {
    const dateStr = item.date.split("T")[0];
    
    // Determine the color based on attendance type
    let dotColor = "#9CA3AF"; // Gray for not checked out
    let backgroundColor = "#F3F4F6"; // Light gray background
    let textColor = "#1F2937"; // Dark text
    
    if (item.attendance) {
      if (!item.attendance.isCheckedOut) {
        // In progress (not checked out)
        dotColor = "#F59E0B"; // Warning color (orange)
        backgroundColor = "#FEF3C7"; // Light orange
        textColor = "#92400E";
      } else if (item.attendance.attendanceType === 'FULL_DAY') {
        // Full day
        dotColor = "#10B981"; // Success color (green)
        backgroundColor = "#D1FAE5"; // Light green
        textColor = "#065F46";
      } else if (item.attendance.attendanceType === 'HALF_DAY') {
        // Half day
        dotColor = "#3B82F6"; // Info color (blue)
        backgroundColor = "#DBEAFE"; // Light blue
        textColor = "#1E40AF";
      }
    }

    marked[dateStr] = {
      marked: true,
      dotColor: dotColor,
      selected: false,
      selectedColor: dotColor,
      customStyles: {
        container: {
          backgroundColor: backgroundColor,
          borderRadius: 6,
        },
        text: {
          color: textColor,
          fontWeight: "bold",
        },
      },
    };
  });

  return marked;
};

// Helper function to calculate attendance percentage with half days
export const calculateAttendancePercentage = (
  totalFullDays: number,
  totalHalfDays: number,
  totalWorkingDays: number
): number => {
  if (totalWorkingDays === 0) return 0;
  const effectiveDays = totalFullDays + (totalHalfDays * 0.5);
  return Math.round((effectiveDays / totalWorkingDays) * 100);
};

// New helper function to get session time label
export const getSessionTimeLabel = (sessionType: 'FORENOON' | 'AFTERNOON'): string => {
  return sessionType === 'FORENOON' 
    ? 'Forenoon (9:30 AM - 1:00 PM)' 
    : 'Afternoon (1:00 PM - 5:30 PM)';
};

// New helper function to get attendance type label
export const getAttendanceTypeLabel = (attendanceType: 'FULL_DAY' | 'HALF_DAY' | null): string => {
  if (!attendanceType) return 'In Progress';
  return attendanceType === 'FULL_DAY' ? 'Full Day' : 'Half Day';
};