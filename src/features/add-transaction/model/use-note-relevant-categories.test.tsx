import { act, renderHook } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import { hydrateCategories, type Category } from '@/entities/category';
import { hydrateTransactions } from '@/entities/transaction';
import { getDatabase } from '@/shared/lib/db-bridge';
import { store } from '@/shared/lib/store';
import { createFakeDatabase, mockSelect, type FakeDatabase } from '@test-utils/fake-database';

import { scoreNoteMatch, scoreWordPair, tokenizeNote, useNoteRelevantCategories } from './use-note-relevant-categories';

jest.mock('@/shared/lib/db-bridge');

// A real, short wait past the hook's 300ms debounce — mixing this library's async act()-based
// render/rerender with Jest fake timers leaves the initial mount's effects unflushed.
function waitPastDebounce(): Promise<void> {
  return act(() => new Promise((resolve) => setTimeout(resolve, 350)));
}

// Forces the non-seeding hydration path (a single `select` per table), independent of
// jest-expo's default `__DEV__` value — see the equivalent note in use-frequent-categories.test.tsx.
beforeEach(() => {
  (global as unknown as { __DEV__: boolean }).__DEV__ = false;
});

function category(id: string, order: number): Category {
  return { id, name: id, icon: 'cash-outline', color: '#000', kind: 'expense', order, archivedAt: null };
}

function expenseTransaction(id: string, categoryId: string, note: string, date = new Date().toISOString()) {
  return {
    id,
    date,
    note,
    type: 'expense',
    accountId: 'a1',
    categoryId,
    amount: 10,
    fromAccountId: null,
    toAccountId: null,
    fromAmount: null,
    toAmount: null,
  };
}

describe('tokenizeNote', () => {
  it('lowercases, splits on non-letters, and drops words shorter than 3 letters', () => {
    expect(tokenizeNote('Кофе, на бегу!')).toEqual(['кофе', 'бегу']);
  });
});

describe('scoreWordPair', () => {
  it('scores the shared-letter count for a partial match', () => {
    expect(scoreWordPair('кофе', 'кофта')).toBe(3); // к, о, ф shared; е and т/а are not
  });

  it('doubles the score for an exact word match', () => {
    expect(scoreWordPair('кофе', 'кофе')).toBe(8); // 4 shared letters * exact-match bonus
  });

  it('scores zero for words sharing no letters', () => {
    expect(scoreWordPair('кофе', 'шланг')).toBe(0);
  });
});

describe('scoreNoteMatch', () => {
  it("sums each note word's best match against the historical words", () => {
    // "кофе" exact-matches "кофе" (8); "такси" only shares "к" with "кофе" (1) and nothing with "домой" (0).
    expect(scoreNoteMatch(['кофе', 'такси'], ['кофе', 'домой'])).toBe(9);
  });
});

describe('useNoteRelevantCategories', () => {
  it('is empty until the note has a real (3+ letter) word', async () => {
    const fakeDatabase: FakeDatabase = createFakeDatabase();
    (getDatabase as jest.Mock).mockReturnValue(fakeDatabase);
    mockSelect(fakeDatabase, [category('coffee', 0)]);
    await hydrateCategories();
    mockSelect(fakeDatabase, [expenseTransaction('t1', 'coffee', 'кофе капучино')]);
    await hydrateTransactions();

    const { result } = await renderHook(() => useNoteRelevantCategories('expense', 'на'), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(result.current).toEqual({ categories: [], autoSelectCategoryId: undefined });
  });

  it('ranks categories by note-text relevance against transaction history, debounced', async () => {
    const fakeDatabase: FakeDatabase = createFakeDatabase();
    (getDatabase as jest.Mock).mockReturnValue(fakeDatabase);

    mockSelect(fakeDatabase, [category('coffee', 0), category('other', 1), category('unused', 2)]);
    await hydrateCategories();

    mockSelect(fakeDatabase, [
      expenseTransaction('t1', 'coffee', 'кофе капучино'),
      // Shares no letters with "кофе" — must not show up as a match.
      expenseTransaction('t2', 'other', 'шланг для мытья'),
    ]);
    await hydrateTransactions();

    const { result, rerender } = await renderHook(({ note }: { note: string }) => useNoteRelevantCategories('expense', note), {
      initialProps: { note: '' },
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(result.current.categories).toEqual([]);

    await rerender({ note: 'кофе' });
    // Still reflects the pre-edit (empty) note until the debounce delay elapses.
    expect(result.current.categories).toEqual([]);

    await waitPastDebounce();

    expect(result.current.categories.map((c) => c.id)).toEqual(['coffee']);
    expect(result.current.autoSelectCategoryId).toBe('coffee');
  });

  it('caps the scan to the most recent transactions, ignoring older ones', async () => {
    function daysAgo(days: number): string {
      const date = new Date();
      date.setDate(date.getDate() - days);
      return date.toISOString();
    }

    const fakeDatabase: FakeDatabase = createFakeDatabase();
    (getDatabase as jest.Mock).mockReturnValue(fakeDatabase);

    mockSelect(fakeDatabase, [category('old', 0)]);
    await hydrateCategories();

    // 500 recent, note-less fillers occupy every slot within the cap...
    const fillers = Array.from({ length: 500 }, (_, index) => expenseTransaction(`filler-${index}`, 'old', '', daysAgo(index)));
    // ...pushing this one real match to the 501st-most-recent position, past the cap.
    const tooOld = expenseTransaction('too-old', 'old', 'кофе', daysAgo(10000));
    mockSelect(fakeDatabase, [...fillers, tooOld]);
    await hydrateTransactions();

    const { result } = await renderHook(() => useNoteRelevantCategories('expense', 'кофе'), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(result.current.categories).toEqual([]);
  });

  it('does not auto-select when the top two categories are tied', async () => {
    const fakeDatabase: FakeDatabase = createFakeDatabase();
    (getDatabase as jest.Mock).mockReturnValue(fakeDatabase);

    mockSelect(fakeDatabase, [category('a', 0), category('b', 1)]);
    await hydrateCategories();

    mockSelect(fakeDatabase, [
      expenseTransaction('t1', 'a', 'кофе'),
      expenseTransaction('t2', 'b', 'кофе'),
    ]);
    await hydrateTransactions();

    // A single render with a fixed initial prop needs no debounce wait — useDebouncedValue's
    // own initial state already equals the first-passed value (see its test file).
    const { result } = await renderHook(() => useNoteRelevantCategories('expense', 'кофе'), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(result.current.categories.map((c) => c.id).sort()).toEqual(['a', 'b']);
    expect(result.current.autoSelectCategoryId).toBeUndefined();
  });
});
