// Manual Jest mock for the `expo-sqlite` package (see https://jestjs.io/docs/manual-mocks).
// The real native module isn't available under Jest, and nothing in the test suite needs an
// actual SQLite connection through this entry point: `shared/lib/db.ts` (which does) is never
// imported by a test — tests exercise entity mutations against a mocked `db-bridge` instead, and
// the real Drizzle schema round-trip runs against `better-sqlite3` (see `db-schema.test.ts`).
module.exports = {
  openDatabaseSync: jest.fn(() => ({})),
  openDatabaseAsync: jest.fn(async () => ({})),
};
