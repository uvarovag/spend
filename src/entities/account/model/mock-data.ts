import { systemColors } from '@/shared/lib/system-colors';

import type { Account } from './types';

export const mockAccounts: Account[] = [
  {
    id: 'account-card-rub',
    name: 'Карта',
    type: 'card',
    currency: 'RUB',
    initialBalance: 45000,
    color: systemColors.blue,
    archivedAt: null,
  },
  {
    id: 'account-cash-usd',
    name: 'Наличные',
    type: 'cash',
    currency: 'USD',
    initialBalance: 200,
    color: systemColors.green,
    archivedAt: null,
  },
];
