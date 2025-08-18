// src/services/notificationService.ts
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { StorageService } from "./storageService";

// BASİT VE ÇALIŞAN NOTIFICATION HANDLER
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    try {
      // Eğer test bildirimi ise direkt göster
      if (notification.request.content.data?.type === "test") {
        console.log("🧪 Test notification - showing");
        return {
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        };
      }

      // Normal reminder için saat kontrolü
      const { start, end } = await StorageService.getNotificationHours();
      const currentHour = new Date().getHours();
      
      if (currentHour >= start && currentHour < end) {
        console.log(`✅ Notification approved - hour ${currentHour} is within ${start}-${end}`);
        return {
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        };
      } else {
        console.log(`❌ Notification blocked - hour ${currentHour} is outside ${start}-${end}`);
        return {
          shouldPlaySound: false,
          shouldSetBadge: false,
          shouldShowBanner: false,
          shouldShowList: false,
        };
      }
    } catch (error) {
      console.error("Error in notification handler:", error);
      return {
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: false,
        shouldShowList: false,
      };
    }
  },
});

export class NotificationService {
  private static isInitialized = false;

  // Initialize notification service
  static async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) return true;

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn("Notification permission denied");
        return false;
      }

      this.isInitialized = true;
      console.log("✅ Notification service initialized");
      return true;
    } catch (error) {
      console.error("❌ Error initializing notification service:", error);
      return false;
    }
  }

  // Request notification permissions
  static async requestPermissions(): Promise<boolean> {
    let hasPermission = false;

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        hasPermission = status === "granted";
      } else {
        hasPermission = true;
      }
    } else {
      console.warn("⚠️ Must use physical device for Push Notifications");
      hasPermission = true; // Simulator için
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

  // Get random message
  static getRandomReminderMessage(userName: string): string {
    const messages = [
      `Hey ${userName}! Time to check your posture 🧘‍♀️`,
      `${userName}, let's straighten that back! 💪`,
      `Posture check, ${userName}! Shoulders back, head up ✨`,
      `${userName}, your spine will thank you! Stand tall 🌟`,
      `Quick reminder ${userName}: How's your posture? 🤔`,
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  }

  // EXPO DOCS'A GÖRE DOĞRU RECURRING SCHEDULE
  static async scheduleRecurringReminders(): Promise<void> {
    try {
      // Önce tümünü iptal et
      await this.cancelAllNotifications();

      const userName = (await StorageService.getUserName()) || "there";
      const intervalMinutes = await StorageService.getNotificationInterval();

      console.log(`📅 Starting recurring notifications every ${intervalMinutes} minutes`);

      // EXPO DOCS'TAKİ GİBİ - SchedulableTriggerInputTypes.TIME_INTERVAL kullan
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Posture Reminder 🧘‍♀️",
          body: this.getRandomReminderMessage(userName),
          vibrate: [0, 250, 250, 250],
          sound: "../../assets/sound.wav",
          ...(Platform.OS === "android" && {
            channelId: "posture-reminders",
          }),
          data: {
            type: "posture-reminder",
            userName: userName,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: intervalMinutes * 60,
          repeats: true,
        },
      });

      console.log(`✅ Recurring notification scheduled for every ${intervalMinutes} minutes`);
      
      // Recurring notifications getAllScheduledNotificationsAsync'de görünmeyebilir
      // Bu normal bir davranış
      const count = await this.getScheduledNotificationsCount();
      console.log(`📊 Visible scheduled notifications: ${count} (recurring notifications may not be visible)`);
      
    } catch (error) {
      console.error("❌ Error scheduling notifications:", error);
    }
  }

  // Cancel all notifications
  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log("🗑️ All notifications cancelled");
    } catch (error) {
      console.error("❌ Error cancelling notifications:", error);
    }
  }

  // Send test notification
  static async sendTestNotification(): Promise<void> {
    try {
      const userName = (await StorageService.getUserName()) || "there";
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Posture Reminder Test 🧪",
          body: `Hi ${userName}! This is a test notification! 👍`,
          vibrate: [0, 250, 250, 250],
          sound: "../../assets/sound.wav",
          ...(Platform.OS === "android" && {
            channelId: "posture-reminders",
          }),
          data: {
            type: "test",
          },
        },
        trigger: {
          seconds: 1,
        } as Notifications.NotificationTriggerInput,
      });

      console.log("🧪 Test notification sent");
    } catch (error) {
      console.error("❌ Error sending test notification:", error);
    }
  }

  // Get scheduled count
  static async getScheduledNotificationsCount(): Promise<number> {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      return notifications.length;
    } catch (error) {
      console.error("❌ Error getting notifications count:", error);
      return 0;
    }
  }

  // Debug notifications
  static async debugScheduledNotifications(): Promise<void> {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log(`📋 Debug: ${notifications.length} scheduled notifications`);
      
      notifications.forEach((notification, index) => {
        const trigger = notification.trigger as any;
        console.log(`${index + 1}. ${notification.content.title}`);
        console.log(`   Trigger: ${JSON.stringify(trigger)}`);
      });
    } catch (error) {
      console.error("❌ Error debugging notifications:", error);
    }
  }

  // Check and schedule - recurring notifications her zaman schedule et
  static async checkAndRescheduleIfNeeded(): Promise<void> {
    try {
      console.log(`🔍 Initializing recurring notifications...`);
      
      // Recurring notifications için her zaman yeniden schedule et
      // Çünkü getAllScheduledNotificationsAsync recurring'leri görmeyebilir
      await this.scheduleRecurringReminders();
      
    } catch (error) {
      console.error("❌ Error checking notifications:", error);
    }
  }

  // Send immediate reminder
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
          data: {
            type: "manual-reminder",
          },
        },
        trigger: null, // Send immediately
      });

      console.log("📤 Immediate reminder sent");
    } catch (error) {
      console.error("❌ Error sending immediate reminder:", error);
    }
  }
}