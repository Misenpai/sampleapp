// services/authService.ts
import axios from "axios";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE;

export interface AuthResponse {
  success: boolean;
  empCode?: string;  // Changed from userId
  username?: string;
  user?: {
    userKey: string;  // New primary key
    empCode: string;  // Changed from id
    username: string;
    email: string;
    location?: string;
    role?: 'USER' | 'SYSTEM';
    isActive?: boolean;
    userLocation?: {
      locationType: 'ABSOLUTE' | 'APPROX' | 'FIELDTRIP';
    };
  };
  error?: string;
  message?: string;
}

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export const signupUser = async (
  empCode: string,  // Changed from empId
  username: string, 
  email: string, 
  password: string
): Promise<AuthResponse> => {
  try {
    const { data } = await apiClient.post('/signup', {
      empCode: empCode.trim(),  // Changed from empId
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password
    });

    console.log('Signup response:', data);

    return {
      success: data.success,
      empCode: data.empCode,
      username: data.username,
      user: data.user,
      message: data.message
    };
  } catch (error: any) {
    console.error('Signup error:', error);
    
    if (error.response?.status === 409) {
      return {
        success: false,
        error: "User already exists with this email, employee code, or username"
      };
    }
    
    return {
      success: false,
      error: error.response?.data?.error || error.message || "Signup failed"
    };
  }
};

export const loginUser = async (
  username: string, 
  password: string
): Promise<AuthResponse> => {
  try {
    const { data } = await apiClient.post('/login', {
      username: username.trim(),
      password
    });

    console.log('Login response:', data);

    return {
      success: data.success,
      empCode: data.empCode,
      username: data.username,
      user: data.user,
      message: data.message
    };
  } catch (error: any) {
    console.error('Login error:', error);
    
    if (error.response?.status === 401) {
      const errorMessage = error.response.data?.error || "Invalid username or password";
      return {
        success: false,
        error: errorMessage
      };
    }
    
    return {
      success: false,
      error: error.response?.data?.error || error.message || "Login failed"
    };
  }
};