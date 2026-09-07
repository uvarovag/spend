import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { addDays, isSameDay } from '@/shared/lib/format-date';
import { pickDate } from '@/shared/lib/picked-date-store';
import { systemColors } from '@/shared/lib/system-colors';
import { ModalHeader } from '@/shared/ui/modal-header';

// A fixed Monday-Sunday reference week — any week works, since weekday short names ("Mon", "Tue",
// ...) don't depend on which calendar week is currently displayed.
const weekdayReferenceDates = Array.from({ length: 7 }, (_, index) => new Date(2024, 0, 1 + index));

function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

// Keeps the time-of-day already on `date` (this screen only ever edits the calendar day) and swaps
// in the year/month/day of `day`.
function withDay(date: Date, day: Date): Date {
  const next = new Date(date);
  next.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
  return next;
}

// One grid, Monday-first, padded with the leading/trailing days of neighboring months so every
// row is a full week — exactly as many rows as the month needs (5 or 6), no more.
function getCalendarWeeks(monthAnchor: Date): Date[][] {
  const year = monthAnchor.getFullYear();
  const month = monthAnchor.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);
  const mondayFirstWeekday = (date: Date) => (date.getDay() + 6) % 7;

  const gridStart = addDays(firstOfMonth, -mondayFirstWeekday(firstOfMonth));
  const gridEnd = addDays(lastOfMonth, 6 - mondayFirstWeekday(lastOfMonth));

  const weeks: Date[][] = [];
  let cursor = gridStart;
  while (cursor <= gridEnd) {
    const week: Date[] = [];
    for (let day = 0; day < 7; day++) {
      week.push(cursor);
      cursor = addDays(cursor, 1);
    }
    weeks.push(week);
  }
  return weeks;
}

function DateChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 items-center rounded-full py-2.5 active:opacity-70 ${active ? 'bg-[#007AFF]' : 'bg-neutral-100 dark:bg-neutral-900'}`}
    >
      <Text className={`text-sm font-medium ${active ? 'text-white' : 'text-neutral-700 dark:text-neutral-300'}`}>{label}</Text>
    </Pressable>
  );
}

function CalendarDayCell({
  day,
  inCurrentMonth,
  selected,
  onPress,
}: {
  day: Date;
  inCurrentMonth: boolean;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="flex-1 items-center py-1">
      <View className={`h-10 w-10 items-center justify-center rounded-full ${selected ? 'bg-[#007AFF]' : ''}`}>
        <Text
          className={
            selected
              ? 'text-base font-semibold text-white'
              : inCurrentMonth
                ? 'text-base text-neutral-900 dark:text-neutral-50'
                : 'text-base text-neutral-300 dark:text-neutral-700'
          }
        >
          {day.getDate()}
        </Text>
      </View>
    </Pressable>
  );
}

export function PickDateScreen() {
  const { t, i18n } = useTranslation();
  const { date: dateParam } = useLocalSearchParams<{ date?: string }>();
  const selectedDate = dateParam ? new Date(dateParam) : new Date();
  const [monthAnchor, setMonthAnchor] = useState(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  const today = new Date();
  const yesterday = addDays(today, -1);

  function selectDay(day: Date) {
    pickDate(withDay(selectedDate, day));
    router.back();
  }

  const weeks = getCalendarWeeks(monthAnchor);
  const monthLabel = new Intl.DateTimeFormat(i18n.language, { month: 'long', year: 'numeric' }).format(monthAnchor);
  const weekdayFormatter = new Intl.DateTimeFormat(i18n.language, { weekday: 'short' });
  const weekdayLabels = weekdayReferenceDates.map((day) => weekdayFormatter.format(day));

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-white dark:bg-black">
      <ModalHeader title={t('common.date')} onClose={() => router.back()} closeLabel={t('common.back')} />
      <View className="gap-4 px-4 pt-2">
        <View className="flex-row gap-2">
          <DateChip label={t('common.today')} active={isSameDay(selectedDate, today)} onPress={() => selectDay(today)} />
          <DateChip label={t('common.yesterday')} active={isSameDay(selectedDate, yesterday)} onPress={() => selectDay(yesterday)} />
        </View>

        <View className="flex-row items-center justify-between px-2">
          <Pressable onPress={() => setMonthAnchor((anchor) => addMonths(anchor, -1))} hitSlop={8} className="p-1">
            <Ionicons name="chevron-back" size={20} color={systemColors.gray} />
          </Pressable>
          <Text className="text-base font-medium capitalize text-neutral-900 dark:text-neutral-50">{monthLabel}</Text>
          <Pressable onPress={() => setMonthAnchor((anchor) => addMonths(anchor, 1))} hitSlop={8} className="p-1">
            <Ionicons name="chevron-forward" size={20} color={systemColors.gray} />
          </Pressable>
        </View>

        <View className="flex-row">
          {weekdayLabels.map((weekday, index) => (
            <Text key={index} className="flex-1 text-center text-xs text-neutral-400 dark:text-neutral-500">
              {weekday}
            </Text>
          ))}
        </View>

        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} className="flex-row">
            {week.map((day) => (
              <CalendarDayCell
                key={day.toISOString()}
                day={day}
                inCurrentMonth={day.getMonth() === monthAnchor.getMonth()}
                selected={isSameDay(day, selectedDate)}
                onPress={() => selectDay(day)}
              />
            ))}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}
