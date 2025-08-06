// src/utils/colors.ts
export const Colors = {
  // Modern Primary Colors
  primary: "#6366F1", // Indigo-500
  primaryLight: "#818CF8", // Indigo-400
  primaryDark: "#4F46E5", // Indigo-600

  // Sophisticated Gradients
  gradient: {
    primary: ["#667eea", "#764ba2"] as const,
    background: ["#6366F1", "#8B5CF6", "#9763f1ff"] as const, // Indigo to Purple to Pink
    card: ["#F8FAFC", "#F1F5F9"] as const, // Subtle light gradient
    button: ["#6366F1", "#8B5CF6"] as const, // Button gradient
  },

  // Neutral System
  white: "#FFFFFF",
  background: "#F8FAFC", // Slate-50
  surface: "#FFFFFF",
  surfaceSecondary: "#F1F5F9", // Slate-100

  // Text Hierarchy
  text: {
    primary: "#0F172A", // Slate-900
    secondary: "#475569", // Slate-600
    tertiary: "#94A3B8", // Slate-400
    white: "#FFFFFF",
    placeholder: "#CBD5E1", // Slate-300
  },

  // Status Colors
  success: "#10B981", // Emerald-500
  warning: "#F59E0B", // Amber-500
  error: "#EF4444", // Red-500

  // UI Elements
  border: "#E2E8F0", // Slate-200
  shadow: "#0F172A", // Slate-900 for shadows
  overlay: "rgba(15, 23, 42, 0.4)", // Slate-900 with opacity
};
