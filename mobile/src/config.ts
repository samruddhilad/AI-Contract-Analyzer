import { Platform } from 'react-native';

/**
 * Computer's local LAN IPv4 address for physical phone testing.
 * Updated automatically from local network adapter (192.168.2.103).
 */
export const LAN_HOST_IP = process.env.EXPO_PUBLIC_HOST_IP || "192.168.2.103";

/**
 * Determines default API Base URL according to the current runtime platform:
 * - Environment variable: EXPO_PUBLIC_API_URL
 * - Web/Desktop browser: http://127.0.0.1:8000
 * - Android Emulator: http://10.0.2.2:8000
 * - iOS Simulator / Local: http://127.0.0.1:8000
 */
export function getDefaultApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === 'web') {
    return 'http://127.0.0.1:8000';
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }
  return 'http://127.0.0.1:8000';
}

export const API_BASE_URL = getDefaultApiBaseUrl();
