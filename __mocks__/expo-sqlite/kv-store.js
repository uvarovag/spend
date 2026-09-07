// Manual Jest mock for `expo-sqlite/kv-store` (see https://jestjs.io/docs/manual-mocks) — an
// in-memory stand-in for the real SQLite-backed key-value store, since `shared/lib/create-value-store.ts`
// and `shared/i18n/i18n.ts` read/write it as soon as their module loads, and the real native
// module isn't available under Jest.
const values = new Map();

class FakeSQLiteStorage {
  getItemSync(key) {
    return values.has(key) ? values.get(key) : null;
  }

  setItemSync(key, value) {
    values.set(key, typeof value === 'function' ? value(this.getItemSync(key)) : value);
  }

  removeItemSync(key) {
    return values.delete(key);
  }

  clearSync() {
    values.clear();
    return true;
  }

  getItem(key) {
    return Promise.resolve(this.getItemSync(key));
  }

  setItem(key, value) {
    this.setItemSync(key, value);
    return Promise.resolve();
  }
}

const Storage = new FakeSQLiteStorage();

module.exports = { Storage, AsyncStorage: Storage, default: Storage, SQLiteStorage: FakeSQLiteStorage };
