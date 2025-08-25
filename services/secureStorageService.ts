// services/secureStorageService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

const ACCESS_TOKEN_SERVICE = 'access_token';
const REFRESH_TOKEN_SERVICE = 'refresh_token';
const USER_DATA_KEY = 'user_data';

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
  // Store tokens securely using Keychain
  async storeTokens(tokens: Omit<SecureTokens, 'tokenTimestamp'>): Promise<void> {
    try {
      const tokenData: SecureTokens = {
        ...tokens,
        tokenTimestamp: Date.now(),
      };

      // Store access token
      await Keychain.setGenericPassword(
        ACCESS_TOKEN_SERVICE,
        tokenData.accessToken,
        { service: ACCESS_TOKEN_SERVICE }
      );

      // Store refresh token
      await Keychain.setGenericPassword(
        REFRESH_TOKEN_SERVICE,
        tokenData.refreshToken,
        { service: REFRESH_TOKEN_SERVICE }
      );

      // Store token metadata in AsyncStorage
      await AsyncStorage.setItem(
        ACCESS_TOKEN_SERVICE,
        JSON.stringify({
          expiresIn: tokenData.expiresIn,
          tokenTimestamp: tokenData.tokenTimestamp,
        })
      );

      console.log('Tokens stored securely');
    } catch (error) {
      console.error('Failed to store tokens:', error);
      throw new Error('Failed to store authentication tokens');
    }
  }

  // Retrieve tokens from secure storage
  async getTokens(): Promise<SecureTokens | null> {
    try {
      // Retrieve access token
      const accessCredentials = await Keychain.getGenericPassword({
        service: ACCESS_TOKEN_SERVICE,
      });
      
      // Retrieve refresh token
      const refreshCredentials = await Keychain.getGenericPassword({
        service: REFRESH_TOKEN_SERVICE,
      });
      
      // Retrieve token metadata
      const tokenMetadata = await AsyncStorage.getItem(ACCESS_TOKEN_SERVICE);
      
      if (accessCredentials && refreshCredentials && tokenMetadata) {
        const metadata = JSON.parse(tokenMetadata);
        const tokenData: SecureTokens = {
          accessToken: accessCredentials.password,
          refreshToken: refreshCredentials.password,
          expiresIn: metadata.expiresIn,
          tokenTimestamp: metadata.tokenTimestamp,
        };
        
        // Check if token is expired
        const now = Date.now();
        const tokenAge = now - tokenData.tokenTimestamp;
        const isExpired = tokenAge >= tokenData.expiresIn * 1000;
        
        if (isExpired) {
          console.log('Access token expired, attempting refresh...');
          return tokenData; // Return expired token for refresh attempt
        }
        
        return tokenData;
      }
      
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
      await Keychain.resetGenericPassword({ service: ACCESS_TOKEN_SERVICE });
      await Keychain.resetGenericPassword({ service: REFRESH_TOKEN_SERVICE });
      await AsyncStorage.removeItem(USER_DATA_KEY);
      await AsyncStorage.removeItem(ACCESS_TOKEN_SERVICE);
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