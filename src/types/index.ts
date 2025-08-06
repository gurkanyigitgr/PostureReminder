// src/types/index.ts
export interface UserSettings {
  name: string;
  notificationStartHour: number;
  notificationEndHour: number;
  isFirstLaunch: boolean;
}

export interface TimeRange {
  start: number;
  end: number;
}
