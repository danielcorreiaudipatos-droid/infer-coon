import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export function usePushNotifications() {
  useEffect(() => {
    if (Device.isDevice) {
      registerForPushNotifications();
    }
  }, []);
}

async function registerForPushNotifications() {
  try {
    // Request permission
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Push notification permission denied');
      return;
    }

    // Get device token
    const token = await Notifications.getExpoPushTokenAsync();
    console.log('Push token:', token.data);

    // Send to backend
    await fetch('https://api.ongame.com/notifications/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pushToken: token.data })
    });

    // Set notification handler
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        console.log('Notification received:', notification);
        return {
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        };
      },
    });

    // Handle notification taps
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification tapped:', response.notification.request.content);
        // Handle navigation based on notification type
        const data = response.notification.request.content.data;
        if (data.type === 'game_reward') {
          // Navigate to wallet
        }
      }
    );

    return () => subscription.remove();
  } catch (error) {
    console.error('Push notification setup error:', error);
  }
}
