// services/secureStorageService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_DATA_KEY = 'user_data';
const TOKEN_METADATA_KEY = 'token_metadata';

export interface SecureTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenTimestamp: number;
}

export interface SecureUserData {
  userKey: string;
  empCode: string;
  username: string;
  email: string;
  role: string;
  location: string;
  userLocation?: {
    locationType: 'ABSOLUTE' | 'APPROX' | 'FIELDTRIP';
  };
}

class SecureStorageService {
  // Check if SecureStore is available (it won't be on web)
  private async isSecureStoreAvailable(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }
    try {
      // Test if SecureStore is available
      await SecureStore.getItemAsync('test');
      return true;
    } catch {
      return true; // Even if test fails, SecureStore is available
    }
  }

  // Store tokens securely
  async storeTokens(tokens: Omit<SecureTokens, 'tokenTimestamp'>): Promise<void> {
  try {
    console.log('Storing tokens...');
    const tokenData: SecureTokens = {
      ...tokens,
      tokenTimestamp: Date.now(),
    };

    const isSecure = await this.isSecureStoreAvailable();
    console.log('SecureStore available:', isSecure);

    if (isSecure) {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokenData.accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokenData.refreshToken);
      console.log('Tokens stored in SecureStore');
    } else {
      console.warn('Using AsyncStorage fallback for tokens (less secure)');
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, tokenData.accessToken);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, tokenData.refreshToken);
      console.log('Tokens stored in AsyncStorage');
    }

    await AsyncStorage.setItem(
      TOKEN_METADATA_KEY,
      JSON.stringify({
        expiresIn: tokenData.expiresIn,
        tokenTimestamp: tokenData.tokenTimestamp,
      })
    );

    console.log('Token metadata stored');
    
    // Verify storage immediately
    const storedTokens = await this.getTokens();
    console.log('Verification - tokens retrieved successfully:', !!storedTokens);

  } catch (error) {
    console.error('Failed to store tokens:', error);
    throw new Error('Failed to store authentication tokens');
  }
}

  // Retrieve tokens from secure storage
async getTokens(): Promise<SecureTokens | null> {
  try {
    const isSecure = await this.isSecureStoreAvailable();
    let accessToken: string | null = null;
    let refreshToken: string | null = null;

    if (isSecure) {
      // Try to get from SecureStore
      accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } else {
      // Fallback to AsyncStorage
      accessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    }

    // Retrieve token metadata
    const tokenMetadata = await AsyncStorage.getItem(TOKEN_METADATA_KEY);
    
    console.log('Token retrieval debug:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      hasMetadata: !!tokenMetadata,
    });

    if (accessToken && refreshToken && tokenMetadata) {
      const metadata = JSON.parse(tokenMetadata);
      const tokenData: SecureTokens = {
        accessToken,
        refreshToken,
        expiresIn: metadata.expiresIn,
        tokenTimestamp: metadata.tokenTimestamp,
      };
      
      // Check if token is expired
      const now = Date.now();
      const tokenAge = now - tokenData.tokenTimestamp;
      const isExpired = tokenAge >= tokenData.expiresIn * 1000;
      
      console.log('Token status:', {
        tokenAge: Math.floor(tokenAge / 1000),
        expiresIn: tokenData.expiresIn,
        isExpired,
      });
      
      return tokenData;
    }
    
    console.log('No complete token set found');
    return null;
  } catch (error) {
    console.error('Failed to retrieve tokens:', error);
    return null;
  }
}

  // Store user data (non-sensitive)
  async storeUserData(userData: SecureUserData): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
      console.log('User data stored');
    } catch (error) {
      console.error('Failed to store user data:', error);
      throw new Error('Failed to store user data');
    }
  }

  // Get user data
  async getUserData(): Promise<SecureUserData | null> {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to retrieve user data:', error);
      return null;
    }
  }

  // Check if tokens are valid (not expired)
  async isTokenValid(): Promise<boolean> {
    try {
      const tokens = await this.getTokens();
      if (!tokens) return false;
      
      const now = Date.now();
      const tokenAge = now - tokens.tokenTimestamp;
      const isExpired = tokenAge >= tokens.expiresIn * 1000;
      
      return !isExpired;
    } catch (error) {
      console.error('Error checking token validity:', error);
      return false;
    }
  }

  // Get time remaining until token expires (in seconds)
  async getTokenTimeRemaining(): Promise<number> {
    try {
      const tokens = await this.getTokens();
      if (!tokens) return 0;
      
      const now = Date.now();
      const tokenAge = now - tokens.tokenTimestamp;
      const timeRemaining = Math.max(0, tokens.expiresIn * 1000 - tokenAge);
      
      return Math.floor(timeRemaining / 1000); // Return seconds
    } catch (error) {
      console.error('Error calculating token time remaining:', error);
      return 0;
    }
  }

  // Clear all stored data (logout)
  async clearAll(): Promise<void> {
    try {
      const isSecure = await this.isSecureStoreAvailable();
      
      if (isSecure) {
        // Clear from SecureStore
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      } else {
        // Clear from AsyncStorage fallback
        await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
        await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      }
      
      // Clear non-sensitive data from AsyncStorage
      await AsyncStorage.removeItem(USER_DATA_KEY);
      await AsyncStorage.removeItem(TOKEN_METADATA_KEY);
      await AsyncStorage.removeItem('termsAcceptedOnce');
      
      console.log('All secure data cleared');
    } catch (error) {
      console.error('Failed to clear secure data:', error);
      throw new Error('Failed to clear authentication data');
    }
  }

  // Update tokens (for refresh)
  async updateTokens(newTokens: Omit<SecureTokens, 'tokenTimestamp'>): Promise<void> {
    await this.storeTokens(newTokens);
  }
}

export const secureStorageService = new SecureStorageService();