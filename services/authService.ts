
import axios from "axios";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE;

export interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    username: string;
    email: string;
    createdAt?: string;
    updatedAt?: string;
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

export const signupUser = async (empId: string, username: string, email: string, password: string): Promise<AuthResponse> => {
  try {
    console.log('Attempting signup with:', { empId, username, email, apiBase: API_BASE });
    
    const { data } = await apiClient.post('/signup', {
      empId: empId.trim(),
      username: username.trim(),
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

export const loginUser = async (username: string, password: string): Promise<AuthResponse> => {
  try {
    console.log('Attempting login with:', { username, apiBase: API_BASE });
    
    const { data } = await apiClient.post('/login', {
      username: username.trim(),
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
