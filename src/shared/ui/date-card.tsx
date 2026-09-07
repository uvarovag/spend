import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { addDays, formatDate, isSameDay } from '@/shared/lib/format-date';
import { clearPickedDate, usePickedDate } from '@/shared/lib/picked-date-store';
import { systemColors } from '@/shared/lib/system-colors';

interface DateCardProps {
  date: Date;
  onDateChange: (date: Date) => void;
  locale: string;
}

// Same shape and interaction as `AccountCard`/`entities/account/ui/account-card.tsx` — a row that
// opens a picker pushed on top of the current modal (`pick-date`, mirroring `pick-account`), not
// an inline expanding control. Self-contained (unlike AccountCard, which leaves navigation to the
// caller): every caller wants the exact same behavior here, there's no per-caller role to
// parameterize the way AccountCard's `caption`/`requestId` do for "from"/"to" accounts.
export function DateCard({ date, onDateChange, locale }: DateCardProps) {
  const { t } = useTranslation();
  const pickedDate = usePickedDate();

  // Reacts only to a new pick from the pick-date screen, not to every re-render.
  useEffect(() => {
    if (pickedDate) {
      clearPickedDate();
      onDateChange(new Date(pickedDate));
    }
  }, [pickedDate]);

  const today = new Date();
  const yesterday = addDays(today, -1);
  const label = isSameDay(date, today) ? t('common.today') : isSameDay(date, yesterday) ? t('common.yesterday') : formatDate(date, locale);

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/pick-date', params: { date: date.toISOString() } })}
      className="flex-row items-center gap-3 rounded-2xl bg-neutral-100 px-4 py-3 active:opacity-70 dark:bg-neutral-900"
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-[#007AFF]">
        <Ionicons name="calendar-outline" size={18} color={systemColors.white} />
      </View>
      <View className="flex-1">
        <Text className="text-base text-neutral-900 dark:text-neutral-50" numberOfLines={1}>
          {label}
        </Text>
        <Text className="text-xs text-neutral-400 dark:text-neutral-500" numberOfLines={1}>
          {t('common.date')}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={systemColors.gray} />
    </Pressable>
  );
}
