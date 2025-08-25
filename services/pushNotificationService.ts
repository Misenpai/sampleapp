// services/notificationService.ts
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PushNotificationToken {
  token: string;
  platform: 'ios' | 'android';
  deviceInfo: {
    os: string;
    version: string | number;
    deviceName?: string;
    deviceType?: string;
  };
}

class NotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  async initialize(): Promise<void> {
    try {
      // Request permissions
      await this.requestPermissions();
      
      // Get push token
      await this.registerForPushNotifications();
      
      // Set up listeners
      this.setupNotificationListeners();
      
      console.log('Notification service initialized');
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        if (finalStatus !== 'granted') {
          console.warn('Push notification permissions not granted');
          return false;
        }
        
        return true;
      } else {
        console.warn('Must use physical device for push notifications');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  async registerForPushNotifications(): Promise<PushNotificationToken | null> {
    try {
      if (!Device.isDevice) {
        console.warn('Must use physical device for push notifications');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      this.expoPushToken = token.data;

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const deviceInfo = {
        os: Platform.OS,
        version: Platform.Version,
        deviceName: await Device.deviceName || 'Unknown',
        deviceType: Device.deviceType?.toString() || 'Unknown',
      };

      const pushTokenData: PushNotificationToken = {
        token: token.data,
        platform: Platform.OS as 'ios' | 'android',
        deviceInfo,
      };

      console.log('Push token registered:', token.data);
      return pushTokenData;
    } catch (error) {
      console.error('Failed to get push token:', error);
      return null;
    }
  }

  setupNotificationListeners(): void {
    // Handle notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        
        // Handle specific notification types
        const notificationType = notification.request.content.data?.type;
        
        switch (notificationType) {
          case 'attendance_reminder':
            this.handleAttendanceReminder(notification);
            break;
          case 'session_expiry':
            this.handleSessionExpiry(notification);
            break;
          default:
            this.handleGeneralNotification(notification);
        }
      }
    );

    // Handle notification taps
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification tapped:', response);
        
        const notificationType = response.notification.request.content.data?.type;
        
        switch (notificationType) {
          case 'attendance_reminder':
            // Navigate to attendance screen
            // You'll need to implement navigation here
            break;
          case 'session_expiry':
            // Handle session expiry tap
            break;
        }
      }
    );
  }

  private handleAttendanceReminder(notification: Notifications.Notification): void {
    // Handle attendance reminder logic
    console.log('Attendance reminder received');
  }

  private handleSessionExpiry(notification: Notifications.Notification): void {
    // Handle session expiry logic
    console.log('Session expiry notification received');
  }

  private handleGeneralNotification(notification: Notifications.Notification): void {
    // Handle general notifications
    console.log('General notification received');
  }

async scheduleSessionExpiryReminder(minutesRemaining: number): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync('session-expiry');
    
    const seconds = minutesRemaining > 1 
      ? (minutesRemaining - 1) * 60
      : 30;

    const trigger: Notifications.TimeIntervalTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      repeats: false
    };

    await Notifications.scheduleNotificationAsync({
      identifier: 'session-expiry',
      content: {
        title: 'Session Expiring Soon',
        body: `Your session will expire in ${minutesRemaining > 1 ? '1 minute' : '30 seconds'}. Please save your work.`,
        data: { type: 'session_expiry' },
      },
      trigger,
    });
  } catch (error) {
    console.error('Failed to schedule session expiry reminder:', error);
  }
}

  async sendLocalNotification(title: string, body: string, data?: any): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
        },
        trigger: null, // Immediate notification
      });
    } catch (error) {
      console.error('Failed to send local notification:', error);
    }
  }

  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  cleanup(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

export const notificationService = new NotificationService();