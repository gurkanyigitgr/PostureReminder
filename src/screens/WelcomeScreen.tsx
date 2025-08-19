// src/screens/WelcomeScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
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
  withSequence,
  withDelay,
} from "react-native-reanimated";
import { StorageService } from "../services/storageService";
import { Colors } from "../utils/colors";

const { width, height } = Dimensions.get("window");

interface Props {
  onNext: (name: string) => void;
}

export const WelcomeScreen: React.FC<Props> = ({ onNext }) => {
  const [name, setName] = useState("");

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
    if (name.trim().length < 2) {
      Alert.alert(
        "Invalid Name",
        "Please enter at least 2 characters for your name."
      );
      return;
    }

    await StorageService.saveUserName(name.trim());
    onNext(name.trim());
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

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={Colors.gradient.background}
        style={styles.backgroundGradient}
      >
        {/* Animated Floating Elements */}
        <Animated.View style={[styles.floatingElement1, waveStyle]} />
        <Animated.View style={[styles.floatingElement2, waveStyle]} />
        <Animated.View style={[styles.floatingElement3, waveStyle]} />

        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* Glassmorphism Container */}
          <Animated.View style={[styles.glassContainer, fadeInStyle]}>
            {/* Icon with pulse animation */}
            <Animated.View style={[styles.iconContainer, waveStyle]}>
              <Text style={styles.icon}>🧘‍♀️</Text>
            </Animated.View>

            {/* Animated Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.welcomeText}>Welcome to</Text>
              <Animated.View style={waveStyle}>
                <Text style={styles.appName}>Posture Good</Text>
              </Animated.View>
            </View>

            {/* Subtitle */}
            <Animated.View style={fadeInStyle}>
              <Text style={styles.subtitle}>
                Get gentle reminders throughout the day to maintain perfect
                posture and improve your health ✨
              </Text>
            </Animated.View>

            {/* Input Section */}
            <Animated.View style={[styles.inputSection, fadeInStyle]}>
              <Text style={styles.inputLabel}>What should we call you?</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleNext}
                />
              </View>
            </Animated.View>

            {/* Animated Button */}
            <Animated.View style={fadeInStyle}>
              <TouchableOpacity
                style={[
                  styles.button,
                  name.length < 2 && styles.buttonDisabled,
                ]}
                onPress={handleNext}
                disabled={name.length < 2}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    name.length >= 2
                      ? ["rgba(255, 255, 255, 0.3)", "rgba(255, 255, 255, 0.1)"]
                      : [
                          "rgba(255, 255, 255, 0.1)",
                          "rgba(255, 255, 255, 0.05)",
                        ]
                  }
                  style={styles.buttonGradient}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      name.length < 2 && styles.buttonTextDisabled,
                    ]}
                  >
                    Let's Begin
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  // Glassmorphism container
  glassContainer: {
    backgroundColor: "rgba(49, 16, 147, 0.26)",
    borderRadius: 30,
    padding: 40,
    width: "100%",
    maxWidth: 380,
    shadowColor: "rgba(0, 0, 0, 0.3)",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.9,
    shadowRadius: 25,
    elevation: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 30,
  },
  icon: {
    fontSize: 36,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 0,
    fontWeight: "500",
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    textShadowColor: "rgba(104, 32, 248, 0.53)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
    marginHorizontal: 10,
  },
  inputSection: {
    width: "100%",
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  inputContainer: {
    borderRadius: 16,
    overflow: "hidden",
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 16,
    color: "#FFFFFF",
  },
  button: {
    borderRadius: 16,
    overflow: "hidden",
  },
  buttonDisabled: {
    opacity: 0.5,
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
  buttonTextDisabled: {
    color: "rgba(255, 255, 255, 0.78)",
  },
});
