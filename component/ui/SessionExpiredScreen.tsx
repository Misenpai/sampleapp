// components/ui/SessionExpiredScreen.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface SessionExpiredScreenProps {
  onReturnToLogin?: () => void;
}

export const SessionExpiredScreen: React.FC<SessionExpiredScreenProps> = ({
  onReturnToLogin,
}) => {
  const handleReturnToLogin = () => {
    if (onReturnToLogin) {
      onReturnToLogin();
    } else {
      router.replace('/(auth)/login');
    }
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Please contact your system administrator for assistance.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <MaterialIcons name="access-time" size={80} color="#dc3545" />
        </View>

        {/* Title */}
        <Text style={styles.title}>Session Expired</Text>

        {/* Description */}
        <Text style={styles.description}>
          Your session has expired for security reasons. Please login again to continue using the app.
        </Text>

        {/* Security Info */}
        <View style={styles.securityInfo}>
          <MaterialIcons name="security" size={20} color="#6c757d" />
          <Text style={styles.securityText}>
            Sessions automatically expire after 1 hour of login
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleReturnToLogin}
            activeOpacity={0.8}
          >
            <MaterialIcons name="login" size={20} color="#ffffff" />
            <Text style={styles.loginButtonText}>Login Again</Text>
          </TouchableOpacity>

          {/* Support Button */}
          <TouchableOpacity
            style={styles.supportButton}
            onPress={handleContactSupport}
            activeOpacity={0.8}
          >
            <MaterialIcons name="help-outline" size={20} color="#6c757d" />
            <Text style={styles.supportButtonText}>Need Help?</Text>
          </TouchableOpacity>
        </View>

        {/* Additional Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Why did this happen?</Text>
          <Text style={styles.infoText}>
            • Sessions expire automatically after 1 hour{'\n'}
            • This helps protect your account and data{'\n'}
            • You can extend your session while logged in
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  contentContainer: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  iconContainer: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  securityText: {
    fontSize: 14,
    color: '#6c757d',
    marginLeft: 8,
    flex: 1,
  },
  actionsContainer: {
    width: '100%',
    marginBottom: 32,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#007bff',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  supportButtonText: {
    color: '#6c757d',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  infoContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
});