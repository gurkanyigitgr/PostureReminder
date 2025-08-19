// src/screens/SettingsScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ScrollView,
  Alert,
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
import { NotificationService } from "../services/notificationService";
import { Colors } from "../utils/colors";

const { width, height } = Dimensions.get("window");

interface Props {
  onBack: () => void;
}

export const SettingsScreen: React.FC<Props> = ({ onBack }) => {
  const [startHour, setStartHour] = useState(9);
  const [endHour, setEndHour] = useState(22);
  const [reminderInterval, setReminderInterval] = useState(30);
  const [isSaving, setIsSaving] = useState(false);

  // Animation values (same as other screens)
  const waveAnimation = useSharedValue(0);
  const fadeAnimation = useSharedValue(0);
  const slideAnimation = useSharedValue(50);

  useEffect(() => {
    loadSettings();

    // Start wave animation
    waveAnimation.value = withRepeat(
      withTiming(1, { duration: 3000 }),
      -1,
      true
    );

    // Fade in animation
    fadeAnimation.value = withDelay(300, withTiming(1, { duration: 1000 }));
    slideAnimation.value = withDelay(300, withTiming(0, { duration: 1000 }));
  }, []);

  const loadSettings = async () => {
    const hours = await StorageService.getNotificationHours();
    const interval = await StorageService.getNotificationInterval();

    setStartHour(hours.start);
    setEndHour(hours.end);
    setReminderInterval(interval);
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Önce ayarları kaydet
      await StorageService.saveNotificationHours(startHour, endHour);
      await StorageService.saveNotificationInterval(reminderInterval);

      // ÖNEMLİ: Notification schedule'ı yeniden başlat
      console.log("🔄 Rescheduling notifications with new settings...");
      await NotificationService.scheduleRecurringReminders();

      // Success feedback
      Alert.alert(
        "✅ Settings Saved!",
        `Your preferences have been updated:\n\n⏰ Active Hours: ${formatHour(
          startHour
        )} - ${formatHour(
          endHour
        )}\n🔔 Reminder: Every ${reminderInterval} minutes\n\nChanges will take effect immediately.`,
        [{ text: "Perfect!", onPress: onBack }]
      );
    } catch (error) {
      console.error("Error saving settings:", error);
      Alert.alert(
        "❌ Save Failed",
        "Could not save your settings. Please try again.",
        [{ text: "Retry" }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Animated styles
  const waveStyle = useAnimatedStyle(() => {
    const wave = interpolate(waveAnimation.value, [0, 1], [0, 10]);
    return {
      transform: [{ translateY: wave }],
    };
  });

  const fadeInStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnimation.value,
      transform: [{ translateY: slideAnimation.value }],
    };
  });

  // Time formatting
  const formatHour = (hour: number) => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  // Interval options
  const intervalOptions = [1, 5, 10, 15, 30, 45, 60, 90];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={Colors.gradient.background}
        style={styles.backgroundGradient}
      >
        {/* Floating elements */}
        <Animated.View style={[styles.floatingElement1, waveStyle]} />
        <Animated.View style={[styles.floatingElement2, waveStyle]} />
        <Animated.View style={[styles.floatingElement3, waveStyle]} />

        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Glassmorphism Container */}
            <Animated.View style={[styles.glassContainer, fadeInStyle]}>
              {/* Header */}
              <Animated.View style={[styles.header, waveStyle]}>
                <View style={styles.iconContainer}>
                  <Text style={styles.icon}>⚙️</Text>
                </View>
                <Text style={styles.title}>Settings</Text>
                <Text style={styles.subtitle}>
                  Customize your posture well preferences
                </Text>
              </Animated.View>

              {/* Notification Hours Section */}
              <Animated.View style={[styles.section, fadeInStyle]}>
                <Text style={styles.sectionTitle}>Notification Hours</Text>

                {/* Start Time Picker */}
                <View style={styles.pickerSection}>
                  <Text style={styles.pickerLabel}>Start Time</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.timePicker}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <TouchableOpacity
                        key={i}
                        style={[
                          styles.timeButton,
                          startHour === i && styles.timeButtonActive,
                        ]}
                        onPress={() => setStartHour(i)}
                      >
                        <Text
                          style={[
                            styles.timeButtonText,
                            startHour === i && styles.timeButtonTextActive,
                          ]}
                        >
                          {formatHour(i)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* End Time Picker */}
                <View style={styles.pickerSection}>
                  <Text style={styles.pickerLabel}>End Time</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.timePicker}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <TouchableOpacity
                        key={i}
                        style={[
                          styles.timeButton,
                          endHour === i && styles.timeButtonActive,
                          i <= startHour && styles.timeButtonDisabled,
                        ]}
                        onPress={() => i > startHour && setEndHour(i)}
                        disabled={i <= startHour}
                      >
                        <Text
                          style={[
                            styles.timeButtonText,
                            endHour === i && styles.timeButtonTextActive,
                            i <= startHour && styles.timeButtonTextDisabled,
                          ]}
                        >
                          {formatHour(i)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </Animated.View>

              {/* Reminder Frequency Section */}
              <Animated.View style={[styles.section, fadeInStyle]}>
                <Text style={styles.sectionTitle}>Reminder Frequency</Text>

                <View style={styles.intervalGrid}>
                  {intervalOptions.map((interval) => (
                    <TouchableOpacity
                      key={interval}
                      style={[
                        styles.intervalButton,
                        reminderInterval === interval &&
                          styles.intervalButtonActive,
                      ]}
                      onPress={() => setReminderInterval(interval)}
                    >
                      <Text
                        style={[
                          styles.intervalButtonText,
                          reminderInterval === interval &&
                            styles.intervalButtonTextActive,
                        ]}
                      >
                        {interval} min
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Animated.View>

              {/* Action Buttons */}
              <Animated.View style={[styles.buttonContainer, fadeInStyle]}>
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    isSaving && styles.saveButtonLoading,
                  ]}
                  onPress={handleSave}
                  activeOpacity={0.8}
                  disabled={isSaving}
                >
                  <LinearGradient
                    colors={
                      isSaving
                        ? [
                            "rgba(255, 255, 255, 0.15)",
                            "rgba(255, 255, 255, 0.05)",
                          ]
                        : [
                            "rgba(255, 255, 255, 0.3)",
                            "rgba(255, 255, 255, 0.1)",
                          ]
                    }
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.saveButtonText}>
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onBack}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  // Floating elements (same as other screens)
  floatingElement1: {
    position: "absolute",
    top: height * 0.35,
    right: width * 0.1,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    opacity: 0.8,
  },
  floatingElement2: {
    position: "absolute",
    top: height * 0.2,
    left: width * 0.1,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    opacity: 0.6,
  },
  floatingElement3: {
    position: "absolute",
    bottom: height * 0.25,
    right: width * 0.08,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    opacity: 0.7,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  // Glassmorphism container
  glassContainer: {
    backgroundColor: "rgba(49, 16, 147, 0.26)",
    borderRadius: 30,
    padding: 32,
    width: "100%",
    maxWidth: 380,
    shadowColor: "rgba(0, 0, 0, 0.3)",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.9,
    shadowRadius: 25,
    elevation: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    width: 80,
    height: 60,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  icon: {
    fontSize: 36,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 12,
    textShadowColor: "rgba(104, 32, 248, 0.53)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    lineHeight: 24,
    marginHorizontal: 10,
  },

  // Sections
  section: {
    marginBottom: 20,
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

  // Time Pickers (same as TimeSettingScreen)
  pickerSection: {
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 12,
  },
  timePicker: {
    paddingHorizontal: 8,
  },
  timeButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 4,
    minWidth: 70,
    alignItems: "center",
  },
  timeButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  timeButtonDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  timeButtonText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500",
  },
  timeButtonTextActive: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  timeButtonTextDisabled: {
    color: "rgba(255, 255, 255, 0.3)",
  },

  // Interval Selection
  intervalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  intervalButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minWidth: 80,
    alignItems: "center",
  },
  intervalButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  intervalButtonText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500",
  },
  intervalButtonTextActive: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  // Buttons
  buttonContainer: {
    gap: 12,
  },
  saveButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cancelButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.7)",
  },
  saveButtonLoading: {
    opacity: 0.7,
  },
});
