import '@/shared/i18n/i18n';
import '@/global.css';

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColorScheme } from '@/shared/lib/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="add-transaction" options={{ presentation: 'modal' }} />
          <Stack.Screen name="transaction-detail" options={{ presentation: 'modal' }} />
          <Stack.Screen name="pick-category" />
          <Stack.Screen name="pick-account" />
          <Stack.Screen name="account-form" options={{ presentation: 'modal' }} />
          <Stack.Screen name="category-form" options={{ presentation: 'modal' }} />
          <Stack.Screen name="feed-filters" options={{ presentation: 'modal' }} />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
