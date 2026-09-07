import '@/shared/i18n/i18n';
// Side-effect only: applies a persisted theme preference to nativewind's in-memory `colorScheme`
// before first render (see `use-theme-preference.ts`).
import '@/features/change-theme';
import '@/global.css';

import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';

import { hydrateAccounts } from '@/entities/account';
import { hydrateCategories } from '@/entities/category';
import { hydrateTransactions } from '@/entities/transaction';
import { db } from '@/shared/lib/db';
import { store } from '@/shared/lib/store';
import { useColorScheme } from '@/shared/lib/use-color-scheme';
import { ErrorBanner } from '@/shared/ui/error-banner';

import migrations from '../../drizzle/migrations';

SplashScreen.preventAutoHideAsync();

// Runs once at startup, before the real UI renders: applies pending Drizzle migrations, then reads
// every table into Redux (business-logic-plan.md, Steps 7-9). Entities are hydrated in sequence,
// not in parallel, because the __DEV__ seed (Step 8) inserts transactions that reference account
// and category ids that must already exist. This composition isn't extracted into its own file
// because every file directly under `src/app/` is scanned by Expo Router as a route candidate —
// a non-route helper living there would print a "missing default export" warning.
function useAppHydration(): boolean {
  const { success: migrationsApplied, error: migrationError } = useMigrations(db, migrations);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (!migrationsApplied) {
      return;
    }
    let isCancelled = false;

    async function hydrate() {
      await hydrateAccounts();
      await hydrateCategories();
      await hydrateTransactions();
      if (!isCancelled) {
        setIsHydrated(true);
      }
    }

    hydrate().catch((error: unknown) => {
      console.error('Failed to hydrate app state from database:', error);
      if (!isCancelled) {
        setIsHydrated(true);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [migrationsApplied]);

  if (migrationError) {
    console.error('Database migration failed:', migrationError);
  }

  return isHydrated || !!migrationError;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isHydrated = useAppHydration();

  useEffect(() => {
    if (isHydrated) {
      SplashScreen.hideAsync();
    }
  }, [isHydrated]);

  if (!isHydrated) {
    return null;
  }

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
            <Stack.Screen name="add-transaction" options={{ presentation: 'modal' }} />
            <Stack.Screen name="transaction-detail" options={{ presentation: 'modal' }} />
            <Stack.Screen name="pick-category" />
            <Stack.Screen name="pick-account" />
            <Stack.Screen name="pick-date" />
            <Stack.Screen name="account-form" options={{ presentation: 'modal' }} />
            <Stack.Screen name="category-form" options={{ presentation: 'modal' }} />
            <Stack.Screen name="feed-filters" options={{ presentation: 'modal' }} />
          </Stack>
          <ErrorBanner />
        </ThemeProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}
