// Same pattern as `store-bridge.ts`, and for the same reason: entities' mutation functions
// (createAccount, updateAccount, …) need to read the Drizzle `db` instance for write-through
// persistence without importing `./db` directly, or the `db.ts` -> `entities/*/index.ts` ->
// entity-file -> `db.ts` cycle would be a real circular `require()` at runtime. `db.ts` calls
// `registerDatabase` once, after opening the database, so this bridge is live before any entity
// file needs it.
import type { db as Db } from './db';

type Database = typeof Db;

let databaseBridge: Database | null = null;

export function registerDatabase(database: Database): void {
  databaseBridge = database;
}

export function getDatabase(): Database {
  if (!databaseBridge) {
    throw new Error('Database is not registered yet — shared/lib/db.ts must be imported before accessing it.');
  }
  return databaseBridge;
}
