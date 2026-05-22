import 'react-native-gesture-handler';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TamaguiProvider } from 'tamagui';

import { AuthProvider, useAuth } from '@/auth/AuthContext';
import config from '../../tamagui.config';

// Mantém a splash visível até o estado de auth resolver (evita flicker da tela errada).
SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { status } = useAuth();

  useEffect(() => {
    if (status !== 'loading') {
      SplashScreen.hideAsync();
    }
  }, [status]);

  if (status === 'loading') return null;

  const authed = status === 'authed';

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={authed}>
        <Stack.Screen name="(drawer)" />
        <Stack.Screen
          name="visita/nova"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
      </Stack.Protected>

      <Stack.Protected guard={!authed}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TamaguiProvider config={config} defaultTheme="light">
        <StatusBar style="dark" />
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </TamaguiProvider>
    </GestureHandlerRootView>
  );
}
