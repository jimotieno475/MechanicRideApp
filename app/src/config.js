// src/config.js
import { Platform } from "react-native";

// Replace this with your computer's local IP
const LOCAL_IP = "192.168.100.3";

export const API_URL =
  Platform.OS === "android"
    ? `http://${LOCAL_IP}:5000` // Android device/emulator
    : Platform.OS === "ios"
    ? `http://${LOCAL_IP}:5000` // iOS device/simulator
    : "http://localhost:5000";  // Web / development

export const WS_URL = "http://192.168.100.22:5000";

