// src/screens/MainScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedStyle,
  interpolate,
  withDelay,
} from "react-native-reanimated";
import { StorageService } from "../services/storageService";
import { Colors } from "../utils/colors";
import { NotificationService } from "../services/notificationService";

const { width, height } = Dimensions.get("window");

interface Props {
  onSettings: () => void;
}

export const MainScreen: React.FC<Props> = ({ onSettings }) => {
  const [userName, setUserName] = useState("");
  const [notificationHours, setNotificationHours] = useState({
    start: 9,
    end: 22,
  });
  const [reminderInterval, setReminderInterval] = useState(30);

  // Animation values
  const waveAnimation = useSharedValue(0);
  const fadeAnimation = useSharedValue(0);

  useEffect(() => {
    loadUserData();

    // Start subtle animation
    waveAnimation.value = withRepeat(
      withTiming(1, { duration: 4000 }),
      -1,
      true
    );

    // Fade in animation
    fadeAnimation.value = withDelay(200, withTiming(1, { duration: 800 }));
  }, []);

  const loadUserData = async () => {
    const name = await StorageService.getUserName();
    const hours = await StorageService.getNotificationHours();
    const interval = await StorageService.getNotificationInterval();

    setUserName(name || "User");
    setNotificationHours(hours);
    setReminderInterval(interval);
  };

  // Format time for display
  const formatHour = (hour: number) => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  // Actions
  const handlePostureCheck = () => {
    Alert.alert(
      "🧘‍♀️ Posture Check Time!",
      `Hi ${userName}! Let's improve your posture:\n\n✓ Straighten your back\n✓ Relax your shoulders\n✓ Lift your chin slightly\n✓ Take a deep breath\n\nFeeling better? Great job! 💪`,
      [{ text: "Done!", style: "default" }]
    );
  };

  const handleSettings = () => {
    onSettings();
  };

  // Get current status
  const getCurrentStatus = () => {
    const now = new Date();
    const currentHour = now.getHours();

    if (
      currentHour >= notificationHours.start &&
      currentHour < notificationHours.end
    ) {
      return { text: "Active Now", color: "#10B981", isActive: true };
    } else {
      return { text: "Quiet Hours", color: "#F59E0B", isActive: false };
    }
  };

  const currentStatus = getCurrentStatus();

  // Animated styles
  const waveStyle = useAnimatedStyle(() => {
    const wave = interpolate(waveAnimation.value, [0, 1], [0, 5]);
    return {
      transform: [{ translateY: wave }],
    };
  });

  const fadeInStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnimation.value,
    };
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={Colors.gradient.background}
        style={styles.backgroundGradient}
      >
        {/* Subtle floating elements */}
        <Animated.View style={[styles.floatingElement1, waveStyle]} />
        <Animated.View style={[styles.floatingElement2, waveStyle]} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <Animated.View style={[styles.headerSection, fadeInStyle]}>
            <View style={styles.welcomeCard}>
              <Animated.View style={waveStyle}>
                <Text style={styles.greeting}>Hello, {userName}! 👋</Text>
              </Animated.View>
              <Text style={styles.status}>
                Reminders active {formatHour(notificationHours.start)} -{" "}
                {formatHour(notificationHours.end)}
              </Text>
              <View style={styles.statusIndicator}>
                <View
                  style={[
                    styles.activeIndicator,
                    { backgroundColor: currentStatus.color },
                  ]}
                />
                <Text
                  style={[styles.activeText, { color: currentStatus.color }]}
                >
                  {currentStatus.text}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Stats Cards */}
          <Animated.View style={[styles.statsSection, fadeInStyle]}>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {notificationHours.end - notificationHours.start}h
                </Text>
                <Text style={styles.statLabel}>Active Hours</Text>
                <Text style={styles.statEmoji}>⏰</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{reminderInterval}min</Text>
                <Text style={styles.statLabel}>Reminder Interval</Text>
                <Text style={styles.statEmoji}>🔔</Text>
              </View>
            </View>
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View style={[styles.actionsSection, fadeInStyle]}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handlePostureCheck}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[
                  "rgba(255, 255, 255, 0.25)",
                  "rgba(255, 255, 255, 0.15)",
                ]}
                style={styles.actionButtonGradient}
              >
                <Text style={styles.actionButtonEmoji}>🧘‍♀️</Text>
                <View style={styles.actionButtonText}>
                  <Text style={styles.actionButtonTitle}>Posture Check</Text>
                  <Text style={styles.actionButtonSubtitle}>
                    Quick posture guide
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleSettings}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[
                  "rgba(255, 255, 255, 0.25)",
                  "rgba(255, 255, 255, 0.15)",
                ]}
                style={styles.actionButtonGradient}
              >
                <Text style={styles.actionButtonEmoji}>⚙️</Text>
                <View style={styles.actionButtonText}>
                  <Text style={styles.actionButtonTitle}>Settings</Text>
                  <Text style={styles.actionButtonSubtitle}>
                    Customize your experience
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Footer Tip */}
          <Animated.View style={[styles.footerSection, fadeInStyle]}>
            <View style={styles.tipCard}>
              <Text style={styles.tipEmoji}>💡</Text>
              <Text style={styles.tipText}>
                Good posture improves energy, reduces pain, and boosts
                confidence!
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  // Subtle floating elements
  floatingElement1: {
    position: "absolute",
    top: height * 0.15,
    right: width * 0.85,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    opacity: 0.6,
  },
  floatingElement2: {
    position: "absolute",
    bottom: height * 0.3,
    left: width * 0.85,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    opacity: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Header Section
  headerSection: {
    marginBottom: 24,
  },
  welcomeCard: {
    backgroundColor: "rgba(49, 16, 147, 0.26)",
    borderRadius: 24,
    padding: 24,
    shadowColor: "rgba(0, 0, 0, 0.3)",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    textShadowColor: "rgba(104, 32, 248, 0.53)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  status: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.85)",
    marginBottom: 16,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  activeText: {
    fontSize: 14,
    fontWeight: "600",
  },

  // Stats Section
  statsSection: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(49, 16, 147, 0.26)",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "rgba(0, 0, 0, 0.2)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginBottom: 8,
  },
  statEmoji: {
    fontSize: 20,
  },

  // Actions Section
  actionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 16,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  actionButton: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  actionButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  actionButtonEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  actionButtonText: {
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  actionButtonSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },

  // Footer Section
  footerSection: {
    marginBottom: 20,
  },
  tipCard: {
    backgroundColor: "rgba(49, 16, 147, 0.15)",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  tipEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 20,
  },
});
