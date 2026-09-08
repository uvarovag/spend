import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, Text, View, type GestureResponderEvent } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Pie, PolarChart } from 'victory-native';

import { formatCurrency } from '@/shared/lib/format-currency';
import { systemColors } from '@/shared/lib/system-colors';

import type { CategorySpending } from '../model/use-home-summary';

interface ChartDatum extends Record<string, unknown> {
  name: string;
  amount: number;
  color: string;
}

interface CategorySpendingDonutProps {
  categorySpendings: CategorySpending[];
  currency: string;
  locale: string;
}

const chartSize = 220;
// Keeps the ring a few pixels inside the canvas edge on every side, so it can never be clipped by
// the canvas's own bounds (e.g. from sub-pixel layout rounding).
const chartPadding = 8;
const innerRadiusRatio = 0.72;
const collapsedLegendLimit = 3;

export function CategorySpendingDonut({ categorySpendings, currency, locale }: CategorySpendingDonutProps) {
  const { t } = useTranslation();
  const [isLegendExpanded, setLegendExpanded] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const total = useMemo(
    () => categorySpendings.reduce((sum, categorySpending) => sum + categorySpending.amount, 0),
    [categorySpendings]
  );
  const chartData: ChartDatum[] = useMemo(
    () =>
      categorySpendings.map((categorySpending) => ({
        name: categorySpending.name,
        amount: categorySpending.amount,
        color: categorySpending.color,
      })),
    [categorySpendings]
  );

  // Mirrors victory-native's own slice angle math (startAngle 0, full 360° sweep) so hit-testing lines up with what's drawn.
  const sliceAngleRanges = useMemo(
    () =>
      chartData.reduce<{ ranges: { startAngle: number; endAngle: number }[]; cursor: number }>(
        (accumulator, datum) => {
          const sweepAngle = total > 0 ? (datum.amount / total) * 360 : 0;
          const startAngle = accumulator.cursor;
          const endAngle = startAngle + sweepAngle;
          return { ranges: [...accumulator.ranges, { startAngle, endAngle }], cursor: endAngle };
        },
        { ranges: [], cursor: 0 }
      ).ranges,
    [chartData, total]
  );

  const selectedCategory = selectedIndex !== null ? categorySpendings[selectedIndex] : undefined;

  function handleChartPress(event: GestureResponderEvent) {
    const { locationX, locationY } = event.nativeEvent;
    const center = chartSize / 2;
    const chartRadius = center - chartPadding;
    const dx = locationX - center;
    const dy = locationY - center;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < chartRadius * innerRadiusRatio || distance > chartRadius) {
      setSelectedIndex(null);
      return;
    }

    let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (angle < 0) {
      angle += 360;
    }

    const tappedIndex = sliceAngleRanges.findIndex((range) => angle >= range.startAngle && angle < range.endAngle);
    if (tappedIndex === -1) {
      setSelectedIndex(null);
      return;
    }
    setSelectedIndex((currentIndex) => (currentIndex === tappedIndex ? null : tappedIndex));
  }

  return (
    <View className="items-center gap-3">
      <View style={{ width: chartSize, height: chartSize }}>
        <PolarChart data={chartData} labelKey="name" valueKey="amount" colorKey="color">
          <Pie.Chart innerRadius={`${innerRadiusRatio * 100}%`} size={chartSize - chartPadding * 2}>
            {() => <Pie.Slice />}
          </Pie.Chart>
        </PolarChart>

        <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
          {selectedCategory ? (
            <>
              <View className="flex-row items-center gap-1.5">
                <View className="h-2 w-2 rounded-full" style={{ backgroundColor: selectedCategory.color }} />
                <Text numberOfLines={1} className="max-w-32 text-sm text-neutral-500 dark:text-neutral-400">
                  {selectedCategory.name}
                </Text>
              </View>
              <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                {formatCurrency(selectedCategory.amount, currency, locale)}
              </Text>
            </>
          ) : (
            <>
              <Text className="text-sm text-neutral-500 dark:text-neutral-400">{t('home.categoryChartTotal')}</Text>
              <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                {formatCurrency(total, currency, locale)}
              </Text>
            </>
          )}
        </View>

        <Pressable onPress={handleChartPress} className="absolute inset-0" />
      </View>

      <View className="w-full gap-2 pt-1">
        {(isLegendExpanded ? categorySpendings : categorySpendings.slice(0, collapsedLegendLimit)).map(
          (categorySpending) => (
            <View key={categorySpending.categoryId} className="flex-row items-center gap-2">
              <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: categorySpending.color }} />
              <Text numberOfLines={1} className="flex-1 text-sm text-neutral-700 dark:text-neutral-300">
                {categorySpending.name}
              </Text>
              <Text className="text-sm text-neutral-500 dark:text-neutral-400">
                {formatCurrency(categorySpending.amount, currency, locale)}
              </Text>
            </View>
          )
        )}

        {categorySpendings.length > collapsedLegendLimit && (
          <Pressable
            onPress={() => setLegendExpanded((expanded) => !expanded)}
            className="flex-row items-center justify-center gap-1 pt-1 active:opacity-70"
          >
            <Text className="text-sm text-neutral-500 dark:text-neutral-400">
              {isLegendExpanded
                ? t('home.categoryChartCollapse')
                : `${t('home.categoryChartMore')} ${categorySpendings.length - collapsedLegendLimit}`}
            </Text>
            <Ionicons name={isLegendExpanded ? 'chevron-up' : 'chevron-down'} size={14} color={systemColors.gray} />
          </Pressable>
        )}
      </View>
    </View>
  );
}
