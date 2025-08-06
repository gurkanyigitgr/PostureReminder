// src/services/storageService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  USER_NAME: "user_name",
  NOTIFICATION_START: "notification_start_hour",
  NOTIFICATION_END: "notification_end_hour",
  NOTIFICATION_INTERVAL: "notification_interval_minutes",
  IS_FIRST_LAUNCH: "is_first_launch",
};

export class StorageService {
  // İlk kullanım kontrolü
  static async isFirstLaunch(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.IS_FIRST_LAUNCH);
      return value === null; // null ise ilk kullanım
    } catch (error) {
      console.error("Error checking first launch:", error);
      return true;
    }
  }

  // İlk kullanımı işaretle
  static async setFirstLaunchCompleted(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.IS_FIRST_LAUNCH, "false");
    } catch (error) {
      console.error("Error setting first launch:", error);
    }
  }

  // Kullanıcı adını kaydet
  static async saveUserName(name: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_NAME, name);
    } catch (error) {
      console.error("Error saving user name:", error);
    }
  }

  // Kullanıcı adını getir
  static async getUserName(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.USER_NAME);
    } catch (error) {
      console.error("Error getting user name:", error);
      return null;
    }
  }

  // Bildirim saatlerini kaydet
  static async saveNotificationHours(
    startHour: number,
    endHour: number
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.NOTIFICATION_START,
        startHour.toString()
      );
      await AsyncStorage.setItem(
        STORAGE_KEYS.NOTIFICATION_END,
        endHour.toString()
      );
    } catch (error) {
      console.error("Error saving notification hours:", error);
    }
  }

  // Bildirim saatlerini getir
  static async getNotificationHours(): Promise<{ start: number; end: number }> {
    try {
      const start = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_START);
      const end = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_END);

      return {
        start: start ? parseInt(start) : 9, // Varsayılan 09:00
        end: end ? parseInt(end) : 22, // Varsayılan 22:00
      };
    } catch (error) {
      console.error("Error getting notification hours:", error);
      return { start: 9, end: 22 };
    }
  }

  // Bildirim aralığını kaydet
  static async saveNotificationInterval(
    intervalMinutes: number
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.NOTIFICATION_INTERVAL,
        intervalMinutes.toString()
      );
    } catch (error) {
      console.error("Error saving notification interval:", error);
    }
  }

  // Bildirim aralığını getir
  static async getNotificationInterval(): Promise<number> {
    try {
      const interval = await AsyncStorage.getItem(
        STORAGE_KEYS.NOTIFICATION_INTERVAL
      );
      return interval ? parseInt(interval) : 30; // Varsayılan 30 dakika
    } catch (error) {
      console.error("Error getting notification interval:", error);
      return 30;
    }
  }
}
