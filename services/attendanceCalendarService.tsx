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
  attendance: {
    takenLocation: string | null;
    checkInTime: string;
    checkOutTime: string | null;
  };
}

export interface AttendanceStatistics {
  totalDays: number;
  currentStreak: number;
  longestStreak: number;
  lastAttendance: string | null;
  weeklyAverage: number;
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

// Helper function to get marked dates for calendar component
export const getMarkedDates = (attendanceDates: AttendanceDate[]) => {
  const marked: { [key: string]: any } = {};

  attendanceDates.forEach((item) => {
    const dateStr = item.date.split("T")[0]; // Format: YYYY-MM-DD
    marked[dateStr] = {
      marked: true,
      dotColor: "#10B981",
      selected: false,
      selectedColor: "#10B981",
      customStyles: {
        container: {
          backgroundColor: "#10B98120",
          borderRadius: 6,
        },
        text: {
          color: "#10B981",
          fontWeight: "bold",
        },
      },
    };
  });

  return marked;
};

// Helper function to calculate attendance percentage
export const calculateAttendancePercentage = (
  totalDays: number,
  totalWorkingDays: number
): number => {
  if (totalWorkingDays === 0) return 0;
  return Math.round((totalDays / totalWorkingDays) * 100);
};
