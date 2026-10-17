import { applyDetectedLanguage } from '@/i18n';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '@/constants';
import { AuthProvider } from '@/features/auth/AuthProvider';

export default function RootLayout() {
  // Registering the icon font here lets the static web build inline it, so icons pre-render exactly as the browser draws them.
  useFonts(Ionicons.font);
  useEffect(() => { void applyDetectedLanguage(); }, []);
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ contentStyle: { backgroundColor: colors.background }, headerShown: false }} />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
