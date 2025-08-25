import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../store/authStore';

interface LogoutButtonProps {
  disabled?: boolean;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ disabled = false }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { signOut, sessionTimeRemaining } = useAuthStore();

  const handleLogout = () => {
    const timeRemaining = Math.floor(sessionTimeRemaining / 60); // minutes

    Alert.alert(
      'Logout Confirmation',
      `Are you sure you want to logout?\n\n${
        timeRemaining > 0
          ? `You still have ${timeRemaining} minutes remaining in your session.`
          : 'Your session has expired.'
      }`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: performLogout,
        },
      ]
    );
  };

  const performLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      router.replace('/(auth)/login'); // keep your navigation
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.logoutButton,
        (disabled || isLoggingOut) && styles.disabled,
      ]}
      onPress={handleLogout}
      disabled={disabled || isLoggingOut}
    >
      {isLoggingOut ? (
        <ActivityIndicator color="white" size="small" />
      ) : (
        <>
          <FontAwesome6 name="arrow-right-from-bracket" size={18} color="white" />
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  logoutButton: {
    backgroundColor: '#ef4444',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 40,
    flexDirection: 'row',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabled: {
    opacity: 0.6,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
