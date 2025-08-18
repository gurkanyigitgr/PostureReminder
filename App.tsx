// App.tsx
import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { WelcomeScreen } from "./src/screens/WelcomeScreen";
import { TimeSettingScreen } from "./src/screens/TimeSettingScreen";
import { MainScreen } from "./src/screens/MainScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";

import { NotificationService } from "./src/services/notificationService";
import { StorageService } from "./src/services/storageService";
import { Colors } from "./src/utils/colors";

type AppState = "loading" | "welcome" | "timeSettings" | "main" | "settings";

export default function App() {
  const [appState, setAppState] = useState<AppState>("loading");

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      // Initialize notification service first
      await NotificationService.initialize();

      const isFirst = await StorageService.isFirstLaunch();
      if (isFirst) {
        setAppState("welcome");
      } else {
        // Existing users: Check if we need to reschedule
        await NotificationService.checkAndRescheduleIfNeeded();
        setAppState("main");
      }
    } catch (error) {
      console.error("Error checking first launch:", error);
      setAppState("welcome");
    }
  };

  const handleWelcomeNext = (name: string) => {
    console.log("User name saved:", name);
    setAppState("timeSettings");
  };

  const handleTimeSettingsNext = async (startHour: number, endHour: number) => {
    await StorageService.saveNotificationHours(startHour, endHour);
    await StorageService.setFirstLaunchCompleted();

    // Schedule recurring reminders
    await NotificationService.scheduleRecurringReminders();

    console.log("Time settings saved:", startHour, endHour);
    setAppState("main");
  };
  const handleSettingsBack = () => {
    setAppState("main");
  };

  if (appState === "loading") {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.background,
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (appState === "welcome") {
    return (
      <>
        <StatusBar style="light" />
        <WelcomeScreen onNext={handleWelcomeNext} />
      </>
    );
  }

  if (appState === "timeSettings") {
    return (
      <>
        <StatusBar style="light" />
        <TimeSettingScreen onNext={handleTimeSettingsNext} />
      </>
    );
  }

  if (appState === "settings") {
    return (
      <>
        <StatusBar style="light" />
        <SettingsScreen onBack={handleSettingsBack} />
      </>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <MainScreen onSettings={() => setAppState("settings")} />
    </>
  );
}
