import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { clearErrorNotification, useErrorNotification } from '@/shared/lib/error-notifications';
import { systemColors } from '@/shared/lib/system-colors';

import { GlassSurface } from './glass-surface';

const autoDismissDelayInMs = 4000;

// A non-blocking, auto-dismissing banner for background write failures (business-logic-plan.md,
// Step 14) — never a blocking alert, since the optimistic Redux update already went through and
// nothing needs the user's confirmation to proceed.
export function ErrorBanner() {
  const notification = useErrorNotification();

  useEffect(() => {
    if (!notification) {
      return;
    }
    const timeout = setTimeout(clearErrorNotification, autoDismissDelayInMs);
    return () => clearTimeout(timeout);
  }, [notification]);

  if (!notification) {
    return null;
  }

  return (
    <SafeAreaView
      edges={['top']}
      pointerEvents="box-none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
    >
      <View className="px-4 pt-2">
        <GlassSurface tintColor={systemColors.red} style={{ borderRadius: 16, overflow: 'hidden' }}>
          <Pressable onPress={clearErrorNotification} className="px-4 py-3 active:opacity-70">
            <Text className="text-sm font-medium text-white">{notification.message}</Text>
          </Pressable>
        </GlassSurface>
      </View>
    </SafeAreaView>
  );
}
