import { renderHook } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import { hydrateAccounts, type Account } from '@/entities/account';
import { hydrateTransactions } from '@/entities/transaction';
import { getDatabase } from '@/shared/lib/db-bridge';
import { store } from '@/shared/lib/store';
import { createFakeDatabase, mockSelect, type FakeDatabase } from '@test-utils/fake-database';

import { useFrequentAccountId } from './use-frequent-account-id';

jest.mock('@/shared/lib/db-bridge');

function account(id: string): Account {
  return { id, name: id, type: 'card', currency: 'RUB', initialBalance: 0, color: '#000', archivedAt: null };
}

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

describe('useFrequentAccountId', () => {
  it('picks the account used most often in the given role over the last 7 days', async () => {
    // Forces the non-seeding hydration path (a single `select`), independent of jest-expo's
    // default `__DEV__` value — see the equivalent note in use-frequent-categories.test.tsx.
    (global as unknown as { __DEV__: boolean }).__DEV__ = false;

    const fakeDatabase: FakeDatabase = createFakeDatabase();
    (getDatabase as jest.Mock).mockReturnValue(fakeDatabase);

    mockSelect(fakeDatabase, [account('rare'), account('frequent'), account('unused')]);
    await hydrateAccounts();

    mockSelect(fakeDatabase, [
      { id: 't1', date: daysAgo(1), note: '', type: 'expense', accountId: 'frequent', categoryId: 'c1', amount: 10, fromAccountId: null, toAccountId: null, fromAmount: null, toAmount: null },
      { id: 't2', date: daysAgo(2), note: '', type: 'expense', accountId: 'frequent', categoryId: 'c1', amount: 10, fromAccountId: null, toAccountId: null, fromAmount: null, toAmount: null },
      { id: 't3', date: daysAgo(3), note: '', type: 'expense', accountId: 'rare', categoryId: 'c1', amount: 10, fromAccountId: null, toAccountId: null, fromAmount: null, toAmount: null },
      // Outside the 7-day window — must not count.
      { id: 't4', date: daysAgo(10), note: '', type: 'expense', accountId: 'rare', categoryId: 'c1', amount: 10, fromAccountId: null, toAccountId: null, fromAmount: null, toAmount: null },
      // Credit-role usage — must not count toward the debit-role pick below.
      { id: 't5', date: daysAgo(1), note: '', type: 'income', accountId: 'rare', categoryId: 'c1', amount: 10, fromAccountId: null, toAccountId: null, fromAmount: null, toAmount: null },
    ]);
    await hydrateTransactions();

    const { result } = await renderHook(() => useFrequentAccountId('debit'), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(result.current).toBe('frequent');
  });
});
