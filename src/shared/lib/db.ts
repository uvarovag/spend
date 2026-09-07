import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';

import { accountsTable } from '@/entities/account';
import { categoriesTable } from '@/entities/category';
import { transactionsTable } from '@/entities/transaction';

import { registerDatabase } from './db-bridge';

export const schema = { accountsTable, categoriesTable, transactionsTable };

const expoDatabase = SQLite.openDatabaseSync('spend.db');

export const db = drizzle(expoDatabase, { schema });

registerDatabase(db);
