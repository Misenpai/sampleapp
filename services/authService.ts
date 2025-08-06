// services/authService.ts
import axios from "axios";

// Make sure this matches your backend server exactly
const API_BASE = process.env.EXPO_PUBLIC_API_BASE; // Update this to your actual backend IP/port

export interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    createdAt?: string;
    updatedAt?: string;
  };
  error?: string;
  message?: string;
}

// Add timeout and better error handling
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

export const signupUser = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  try {
    console.log('Attempting signup with:', { name, email, apiBase: API_BASE });
    
    const { data } = await apiClient.post('/signup', {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password
    });

    console.log('Signup response:', data);

    return {
      success: data.success,
      user: data.user,
      message: data.message
    };
  } catch (error: any) {
    console.error('Signup error:', error);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR') {
      return {
        success: false,
        error: "Cannot connect to server. Please check your internet connection and try again."
      };
    }
    
    if (error.code === 'ECONNABORTED') {
      return {
        success: false,
        error: "Request timeout. Please try again."
      };
    }

    return {
      success: false,
      error: error.response?.data?.error || error.message || "Signup failed"
    };
  }
};

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    console.log('Attempting login with:', { email, apiBase: API_BASE });
    
    const { data } = await apiClient.post('/login', {
      email: email.toLowerCase().trim(),
      password
    });

    console.log('Login response:', data);

    return {
      success: data.success,
      user: data.user,
      message: data.message
    };
  } catch (error: any) {
    console.error('Login error:', error);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR') {
      return {
        success: false,
        error: "Cannot connect to server. Please check your internet connection and try again."
      };
    }
    
    if (error.code === 'ECONNABORTED') {
      return {
        success: false,
        error: "Request timeout. Please try again."
      };
    }

    return {
      success: false,
      error: error.response?.data?.error || error.message || "Login failed"
    };
  }
};

// Test function to check if backend is reachable
export const testConnection = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get('/test', { timeout: 5000 });
    console.log('Connection test successful');
    return true;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
};