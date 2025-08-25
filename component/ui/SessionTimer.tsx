// components/ui/SessionTimer.tsx
import { useAuthStore } from '@/store/authStore';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SessionTimerProps {
  style?: any;
  showRefreshButton?: boolean;
}

export const SessionTimer: React.FC<SessionTimerProps> = ({ 
  style,
  showRefreshButton = true 
}) => {
  const { 
    sessionTimeRemaining, 
    isSessionExpiring, 
    refreshSession,
    isAuthenticated 
  } = useAuthStore();
  
  const [displayTime, setDisplayTime] = useState(sessionTimeRemaining);

  useEffect(() => {
    setDisplayTime(sessionTimeRemaining);
  }, [sessionTimeRemaining]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      setDisplayTime(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRefreshSession = async () => {
    try {
      const success = await refreshSession();
      if (success) {
        Alert.alert('Success', 'Session refreshed successfully');
      } else {
        Alert.alert('Error', 'Failed to refresh session. You may need to login again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh session');
    }
  };

  if (!isAuthenticated || displayTime <= 0) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.timerContainer}>
        <Text style={styles.label}>Session:</Text>
        <Text style={[
          styles.time,
          isSessionExpiring && styles.timeExpiring
        ]}>
          {formatTime(displayTime)}
        </Text>
      </View>
      
      {showRefreshButton && isSessionExpiring && (
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefreshSession}
        >
          <Text style={styles.refreshButtonText}>Extend</Text>
        </TouchableOpacity>
      )}
      
      {isSessionExpiring && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            Session expiring soon!
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#6c757d',
    marginRight: 4,
  },
  time: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28a745',
    fontFamily: 'monospace',
  },
  timeExpiring: {
    color: '#dc3545',
  },
  refreshButton: {
    marginLeft: 8,
    backgroundColor: '#007bff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  warningContainer: {
    marginLeft: 8,
  },
  warningText: {
    fontSize: 10,
    color: '#dc3545',
    fontWeight: '500',
  },
});