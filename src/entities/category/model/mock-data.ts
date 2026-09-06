import { detectDeviceLanguage } from '@/shared/lib/detect-device-language';
import { systemColors } from '@/shared/lib/system-colors';

import type { Category } from './types';

const expenseNames = {
  ru: ['Еда', 'Транспорт', 'Покупки', 'Жильё', 'Развлечения', 'Здоровье', 'Подписки', 'Прочее'],
  en: ['Food', 'Transport', 'Shopping', 'Housing', 'Entertainment', 'Health', 'Subscriptions', 'Other'],
};

const expenseIcons = [
  'fast-food-outline',
  'car-outline',
  'bag-outline',
  'home-outline',
  'game-controller-outline',
  'medkit-outline',
  'wifi-outline',
  'ellipsis-horizontal-outline',
];

const expenseColors = [
  systemColors.orange,
  systemColors.blue,
  systemColors.purple,
  systemColors.green,
  systemColors.pink,
  systemColors.yellow,
  systemColors.cyan,
  systemColors.gray,
];

const incomeNames = {
  ru: ['Зарплата', 'Фриланс', 'Подарки', 'Инвестиции', 'Кэшбэк', 'Аренда', 'Прочее'],
  en: ['Salary', 'Freelance', 'Gifts', 'Investments', 'Cashback', 'Rental', 'Other'],
};

const incomeIcons = [
  'cash-outline',
  'laptop-outline',
  'gift-outline',
  'trending-up-outline',
  'wallet-outline',
  'key-outline',
  'ellipsis-horizontal-outline',
];

const incomeColors = [
  systemColors.green,
  systemColors.teal,
  systemColors.pink,
  systemColors.indigo,
  systemColors.yellow,
  systemColors.purple,
  systemColors.gray,
];

function buildDefaultCategories(): Category[] {
  const language = detectDeviceLanguage();

  const expense: Category[] = expenseNames[language].map((name, index) => ({
    id: `category-expense-${index}`,
    name,
    icon: expenseIcons[index],
    color: expenseColors[index],
    kind: 'expense',
    order: index,
    archivedAt: null,
  }));

  const income: Category[] = incomeNames[language].map((name, index) => ({
    id: `category-income-${index}`,
    name,
    icon: incomeIcons[index],
    color: incomeColors[index],
    kind: 'income',
    order: index,
    archivedAt: null,
  }));

  return [...expense, ...income];
}

export const mockCategories: Category[] = buildDefaultCategories();
