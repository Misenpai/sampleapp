import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

interface LogoutButtonProps {
  disabled?: boolean;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ disabled = false }) => {
  const { signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity 
      style={[styles.logoutButton, disabled && styles.disabled]} 
      onPress={handleLogout}
      disabled={disabled}
    >
      <Text style={styles.logoutButtonText}>Logout</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  logoutButton: {
    backgroundColor: '#dc3545',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabled: {
    opacity: 0.6,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});