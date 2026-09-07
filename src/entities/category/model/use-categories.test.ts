import { eq } from 'drizzle-orm';

// Side-effect only: registers the real Redux store with `store-bridge.ts` (see the equivalent
// import in `entities/account/model/use-accounts.test.ts` for why).
import '@/shared/lib/store';
import { getDatabase } from '@/shared/lib/db-bridge';
import { notifyWriteFailure } from '@/shared/lib/error-notifications';
import { createFakeDatabase, mockInsert, mockSelect, mockUpdate, type FakeDatabase } from '@test-utils/fake-database';

import { categoriesTable } from './schema';
import {
  archiveCategory,
  createCategory,
  getCategory,
  hydrateCategories,
  reorderCategories,
  updateCategory,
  type NewCategory,
} from './use-categories';

jest.mock('@/shared/lib/db-bridge');
jest.mock('@/shared/lib/error-notifications');

const newExpenseCategory: NewCategory = { name: 'Groceries', icon: 'cart-outline', color: '#34C759', kind: 'expense' };

let fakeDatabase: FakeDatabase;

beforeEach(() => {
  fakeDatabase = createFakeDatabase();
  (getDatabase as jest.Mock).mockReturnValue(fakeDatabase);
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

async function createTestCategory(): Promise<string> {
  const values = mockInsert(fakeDatabase);
  await createCategory(newExpenseCategory);
  return values.mock.calls[0][0].id;
}

describe('createCategory', () => {
  it('assigns the next order within the same kind and writes it through', async () => {
    const values = mockInsert(fakeDatabase);

    await createCategory(newExpenseCategory);

    expect(fakeDatabase.insert).toHaveBeenCalledWith(categoriesTable);
    const insertedCategory = values.mock.calls[0][0];
    expect(insertedCategory).toEqual(expect.objectContaining({ ...newExpenseCategory, archivedAt: null }));
    expect(typeof insertedCategory.order).toBe('number');
  });

  it('logs and notifies, without throwing, when the SQLite write fails', async () => {
    mockInsert(fakeDatabase, new Error('disk full'));

    await expect(createCategory(newExpenseCategory)).resolves.toBeUndefined();

    expect(console.error).toHaveBeenCalled();
    expect(notifyWriteFailure).toHaveBeenCalled();
  });
});

describe('updateCategory', () => {
  it('merges a cosmetic change into Redux and writes it through', async () => {
    const categoryId = await createTestCategory();
    const { where } = mockUpdate(fakeDatabase);

    await updateCategory(categoryId, { name: 'Renamed' });

    expect(getCategory(categoryId)?.name).toBe('Renamed');
    expect(where).toHaveBeenCalledWith(eq(categoriesTable.id, categoryId));
  });

  it('logs and notifies, without throwing, when the SQLite write fails', async () => {
    const categoryId = await createTestCategory();
    mockUpdate(fakeDatabase, new Error('disk full'));

    await expect(updateCategory(categoryId, { name: 'Renamed' })).resolves.toBeUndefined();

    expect(console.error).toHaveBeenCalled();
    expect(notifyWriteFailure).toHaveBeenCalled();
  });

  it("does not accept `kind` in its changes type — data-constraints.md's rule, checked by tsc, not at runtime", () => {
    // Never called — see the equivalent guard in `entities/account/model/use-accounts.test.ts`.
    function typeOnlyRegressionGuard() {
      // @ts-expect-error `kind` is deliberately excluded from updateCategory's changes type: it
      // drives `useCategories(kind)` filtering, `useFrequentCategories`, and the Home aggregates,
      // so changing it after creation would desync sums already computed under the old kind.
      updateCategory('any-id', { kind: 'income' });
    }
    expect(typeOnlyRegressionGuard).toBeDefined();
  });
});

describe('archiveCategory', () => {
  it('sets archivedAt in Redux and writes it through', async () => {
    const categoryId = await createTestCategory();
    mockUpdate(fakeDatabase);

    await archiveCategory(categoryId);

    expect(getCategory(categoryId)?.archivedAt).not.toBeNull();
  });
});

describe('reorderCategories', () => {
  it('reassigns order only within the given kind and writes every changed row through in one transaction', async () => {
    const values1 = mockInsert(fakeDatabase);
    await createCategory(newExpenseCategory);
    const firstId = values1.mock.calls[0][0].id;
    const values2 = mockInsert(fakeDatabase);
    await createCategory(newExpenseCategory);
    const secondId = values2.mock.calls[0][0].id;

    await reorderCategories('expense', [secondId, firstId]);

    expect(getCategory(secondId)?.order).toBe(0);
    expect(getCategory(firstId)?.order).toBe(1);
    expect(fakeDatabase.transaction).toHaveBeenCalled();
  });
});

describe('hydrateCategories', () => {
  function setDevMode(value: boolean): void {
    (global as unknown as { __DEV__: boolean }).__DEV__ = value;
  }
  const originalDev = __DEV__;

  afterEach(() => {
    setDevMode(originalDev);
  });

  it('seeds mock categories when __DEV__ and the table is empty, then hydrates Redux from it', async () => {
    setDevMode(true);
    mockSelect(fakeDatabase, []);
    const values = mockInsert(fakeDatabase);
    const seededRow = { ...newExpenseCategory, id: 'category-seed', order: 0, archivedAt: null };
    mockSelect(fakeDatabase, [seededRow]);

    await hydrateCategories();

    expect(values).toHaveBeenCalled();
    expect(getCategory('category-seed')).toEqual(seededRow);
  });
});
