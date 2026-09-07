import { renderHook } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import { hydrateCategories, type Category } from '@/entities/category';
import { hydrateTransactions } from '@/entities/transaction';
import { getDatabase } from '@/shared/lib/db-bridge';
import { store } from '@/shared/lib/store';
import { createFakeDatabase, mockSelect, type FakeDatabase } from '@test-utils/fake-database';

import { useFrequentCategories } from './use-frequent-categories';

jest.mock('@/shared/lib/db-bridge');

function category(id: string, order: number): Category {
  return { id, name: id, icon: 'cash-outline', color: '#000', kind: 'expense', order, archivedAt: null };
}

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

describe('useFrequentCategories', () => {
  it('ranks same-kind categories by usage in the last 30 days, ignoring older transactions and other kinds', async () => {
    // Forces the non-seeding hydration path (a single `select`), independent of jest-expo's
    // default `__DEV__` value, so this test's fixtures are the only data hydrateCategories sees.
    (global as unknown as { __DEV__: boolean }).__DEV__ = false;

    const fakeDatabase: FakeDatabase = createFakeDatabase();
    (getDatabase as jest.Mock).mockReturnValue(fakeDatabase);

    mockSelect(fakeDatabase, [category('rare', 0), category('frequent', 1), category('unused', 2)]);
    await hydrateCategories();

    mockSelect(fakeDatabase, [
      { id: 't1', date: daysAgo(1), note: '', type: 'expense', accountId: 'a1', categoryId: 'frequent', amount: 10, fromAccountId: null, toAccountId: null, fromAmount: null, toAmount: null },
      { id: 't2', date: daysAgo(2), note: '', type: 'expense', accountId: 'a1', categoryId: 'frequent', amount: 10, fromAccountId: null, toAccountId: null, fromAmount: null, toAmount: null },
      { id: 't3', date: daysAgo(3), note: '', type: 'expense', accountId: 'a1', categoryId: 'rare', amount: 10, fromAccountId: null, toAccountId: null, fromAmount: null, toAmount: null },
      // Outside the 30-day window — must not count toward "frequent".
      { id: 't4', date: daysAgo(40), note: '', type: 'expense', accountId: 'a1', categoryId: 'rare', amount: 10, fromAccountId: null, toAccountId: null, fromAmount: null, toAmount: null },
      // Wrong kind — must not count even though the category id would match if kind were ignored.
      { id: 't5', date: daysAgo(1), note: '', type: 'income', accountId: 'a1', categoryId: 'rare', amount: 10, fromAccountId: null, toAccountId: null, fromAmount: null, toAmount: null },
    ]);
    await hydrateTransactions();

    const { result } = await renderHook(() => useFrequentCategories('expense'), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(result.current.map((category) => category.id)).toEqual(['frequent', 'rare', 'unused']);
  });
});
