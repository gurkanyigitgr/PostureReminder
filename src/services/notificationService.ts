// src/services/notificationService.ts
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { StorageService } from "./storageService";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  private static isInitialized = false;

  // Initialize notification service
  static async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) return true;

      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn("Notification permission denied");
        return false;
      }

      this.isInitialized = true;
      console.log("Notification service initialized successfully");
      return true;
    } catch (error) {
      console.error("Error initializing notification service:", error);
      return false;
    }
  }

  // Request notification permissions
  static async requestPermissions(): Promise<boolean> {
    let hasPermission = false;

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        hasPermission = status === "granted";
      } else {
        hasPermission = true;
      }
    } else {
      console.warn("Must use physical device for Push Notifications");
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("posture-reminders", {
        name: "Posture Reminders",
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#667eea",
      });
    }

    return hasPermission;
  }

  // Get personalized reminder messages
  static getRandomReminderMessage(userName: string): string {
    const messages = [
      `Hey ${userName}! Time to check your posture 🧘‍♀️`,
      `${userName}, let's straighten that back! 💪`,
      `Posture check, ${userName}! Shoulders back, head up ✨`,
      `${userName}, your spine will thank you! Stand tall 🌟`,
      `Quick reminder ${userName}: How's your posture? 🤔`,
      `${userName}, time to reset your posture! 🔄`,
      `Gentle reminder ${userName}: Sit up straight! 📏`,
      `${userName}, your future self thanks you for good posture! 🙏`,
      `Posture patrol ${userName}! How are we sitting? 👮‍♀️`,
      `${userName}, let's give your spine some love! ❤️`,
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Send immediate notification (for manual trigger)
  static async sendImmediateReminder(): Promise<void> {
    try {
      const userName = (await StorageService.getUserName()) || "there";
      const message = this.getRandomReminderMessage(userName);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Posture Reminder 🧘‍♀️",
          body: message,
          vibrate: [0, 250, 250, 250],
          sound: "../../assets/sound.wav",
          ...(Platform.OS === "android" && {
            channelId: "posture-reminders",
          }),
        },
        trigger: null, // Send immediately
      });

      console.log("Immediate reminder sent");
    } catch (error) {
      console.error("Error sending immediate reminder:", error);
    }
  }

  // Schedule recurring notifications
  static async scheduleRecurringReminders(): Promise<void> {
    try {
      // Cancel existing notifications first
      await this.cancelAllNotifications();

      const userName = (await StorageService.getUserName()) || "there";
      const { start, end } = await StorageService.getNotificationHours();
      const intervalMinutes = await StorageService.getNotificationInterval();

      console.log(
        `Scheduling reminders: ${start}:00 - ${end}:00, every ${intervalMinutes} minutes`
      );

      // Calculate how many notifications we need per day
      const activeHours = end - start;
      const notificationsPerDay = Math.floor(
        (activeHours * 60) / intervalMinutes
      );

      // Schedule notifications for the next 7 days
      for (let day = 0; day < 7; day++) {
        for (let i = 0; i < notificationsPerDay; i++) {
          const notificationTime = new Date();
          notificationTime.setDate(notificationTime.getDate() + day);
          notificationTime.setHours(start);
          notificationTime.setMinutes(i * intervalMinutes);
          notificationTime.setSeconds(0);
          notificationTime.setMilliseconds(0);

          // Skip if the time has already passed today
          if (day === 0 && notificationTime.getTime() <= Date.now()) {
            continue;
          }

          // Don't schedule if it's past the end hour
          if (notificationTime.getHours() >= end) {
            continue;
          }

          const message = this.getRandomReminderMessage(userName);

          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Posture Reminder 🧘‍♀️",
              body: message,
              vibrate: [0, 250, 250, 250],
              sound: "../../assets/sound.wav",
              ...(Platform.OS === "android" && {
                channelId: "posture-reminders",
              }),
              data: {
                type: "posture-reminder",
                scheduledFor: notificationTime.toISOString(),
              },
            },
            trigger: notificationTime as any,
          });
        }
      }

      console.log(
        `Scheduled ${notificationsPerDay * 7} notifications for the next 7 days`
      );
    } catch (error) {
      console.error("Error scheduling recurring reminders:", error);
    }
  }

  // Cancel all scheduled notifications
  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log("All notifications cancelled");
    } catch (error) {
      console.error("Error cancelling notifications:", error);
    }
  }

  // Get scheduled notifications count (for debugging)
  static async getScheduledNotificationsCount(): Promise<number> {
    try {
      const notifications =
        await Notifications.getAllScheduledNotificationsAsync();
      return notifications.length;
    } catch (error) {
      console.error("Error getting scheduled notifications:", error);
      return 0;
    }
  }

  // Test notification
  static async sendTestNotification(): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Posture Reminder Test 🧪",
          body: "This is how your posture reminders will look! Looking good? 👍",
          vibrate: [0, 250, 250, 250],
          sound: "../../assets/sound.wav",
          ...(Platform.OS === "android" && {
            channelId: "posture-reminders",
          }),
        },
        trigger: {
          seconds: 1,
        } as Notifications.NotificationTriggerInput,
      });

      console.log("Test notification scheduled");
    } catch (error) {
      console.error("Error sending test notification:", error);
    }
  }
}
