// A hand-rolled stand-in for the Drizzle `db` object (`shared/lib/db-bridge.ts`'s `getDatabase()`),
// used to unit-test entities' write-through mutations (business-logic-plan.md, Step 10) and their
// error handling (Step 14) without a real database. Each `mock*` helper queues exactly one call's
// worth of chained return values via `mockReturnValueOnce`/`mockImplementationOnce`, matching how
// many times a given entity function calls `select`/`insert`/`update`/`delete` — so call them in
// the same order the code under test is expected to call the real methods.
export interface FakeDatabase {
  select: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  transaction: jest.Mock;
}

export function createFakeDatabase(): FakeDatabase {
  const db = {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as FakeDatabase;
  db.transaction = jest.fn(async (callback: (tx: FakeDatabase) => Promise<void>) => callback(db));
  return db;
}

// Queues one `select().from(table)` call (optionally `.limit(n)` too) to resolve with `rows`.
export function mockSelect(db: FakeDatabase, rows: unknown[]): void {
  const awaitableRows = Promise.resolve(rows) as Promise<unknown[]> & { limit: jest.Mock };
  awaitableRows.limit = jest.fn(() => Promise.resolve(rows));
  db.select.mockReturnValueOnce({ from: jest.fn(() => awaitableRows) });
}

// Queues one `insert(table).values(...)` call to resolve (or reject with `error`, if given).
export function mockInsert(db: FakeDatabase, error?: Error): jest.Mock {
  const values = jest.fn(() => (error ? Promise.reject(error) : Promise.resolve()));
  db.insert.mockReturnValueOnce({ values });
  return values;
}

// Queues one `update(table).set(...).where(...)` call to resolve (or reject with `error`, if given).
export function mockUpdate(db: FakeDatabase, error?: Error): { set: jest.Mock; where: jest.Mock } {
  const where = jest.fn(() => (error ? Promise.reject(error) : Promise.resolve()));
  const set = jest.fn(() => ({ where }));
  db.update.mockReturnValueOnce({ set });
  return { set, where };
}

// Queues one `delete(table).where(...)` call to resolve (or reject with `error`, if given).
export function mockDelete(db: FakeDatabase, error?: Error): { where: jest.Mock } {
  const where = jest.fn(() => (error ? Promise.reject(error) : Promise.resolve()));
  db.delete.mockReturnValueOnce({ where });
  return { where };
}
