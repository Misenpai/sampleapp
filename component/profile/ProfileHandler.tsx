import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProfileHeaderProps {
  username?: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ username }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Profile</Text>
      {username && (
        <Text style={styles.subtitle}>Welcome, {username}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#007AFF',
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
});