// src/screens/TimeSettingScreen.tsx
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

const { width, height } = Dimensions.get("window");

interface Props {
  onNext: (startHour: number, endHour: number) => void;
}

export const TimeSettingScreen: React.FC<Props> = ({ onNext }) => {
  const [startHour, setStartHour] = useState(9);
  const [endHour, setEndHour] = useState(22);

  // Animation values
  const waveAnimation = useSharedValue(0);
  const fadeAnimation = useSharedValue(0);
  const slideAnimation = useSharedValue(50);

  useEffect(() => {
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

  const handleNext = async () => {
    await StorageService.saveNotificationHours(startHour, endHour);
    await StorageService.setFirstLaunchCompleted();
    onNext(startHour, endHour);
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

  // Generate time range display
  const getActiveHours = () => {
    return endHour - startHour;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={Colors.gradient.background}
        style={styles.backgroundGradient}
      >
        {/* Animated Floating Elements - Same as WelcomeScreen */}
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
                  <Text style={styles.icon}>⏰</Text>
                </View>
                <Text style={styles.title}>Notification Hours</Text>
                <Text style={styles.subtitle}>
                  When would you like to receive posture reminders?
                </Text>
              </Animated.View>

              {/* Time Range Visual */}
              <Animated.View style={[styles.timeRangeContainer, fadeInStyle]}>
                <View style={styles.timeRangeHeader}>
                  <Text style={styles.rangeTitle}>Active Hours</Text>
                  <Text style={styles.rangeSubtitle}>
                    {getActiveHours()} hours of reminders
                  </Text>
                </View>

                <View style={styles.timeRange}>
                  <View style={styles.timePoint}>
                    <Text style={styles.timeLabel}>Start</Text>
                    <Text style={styles.timeValue}>
                      {formatHour(startHour)}
                    </Text>
                  </View>

                  <View style={styles.rangeLine}>
                    <View style={styles.rangeProgress} />
                  </View>

                  <View style={styles.timePoint}>
                    <Text style={styles.timeLabel}>End</Text>
                    <Text style={styles.timeValue}>{formatHour(endHour)}</Text>
                  </View>
                </View>
              </Animated.View>

              {/* Time Pickers */}
              <Animated.View style={[styles.pickersContainer, fadeInStyle]}>
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

              {/* Action Button */}
              <Animated.View style={fadeInStyle}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleNext}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[
                      "rgba(255, 255, 255, 0.3)",
                      "rgba(255, 255, 255, 0.1)",
                    ]}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonText}>Start My Journey 🚀</Text>
                  </LinearGradient>
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
  // Floating elements - Same as WelcomeScreen
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
  // Glassmorphism container - Same style as WelcomeScreen
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
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 24,
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
  // Time Range Visual
  timeRangeContainer: {
    marginBottom: 32,
  },
  timeRangeHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  rangeTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  rangeSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
  timeRange: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timePoint: {
    alignItems: "center",
  },
  timeLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  rangeLine: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    marginHorizontal: 16,
    overflow: "hidden",
  },
  rangeProgress: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
    width: "70%",
  },
  // Time Pickers
  pickersContainer: {
    marginBottom: 32,
  },
  pickerSection: {
    marginBottom: 24,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  timePicker: {
    paddingHorizontal: 8,
  },
  timeButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
    minWidth: 80,
    alignItems: "center",
  },
  timeButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  timeButtonDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  timeButtonText: {
    fontSize: 14,
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
  // Button - Same style as WelcomeScreen
  button: {
    borderRadius: 16,
    overflow: "hidden",
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
