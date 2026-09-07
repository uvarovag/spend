import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import type { CategoryKind } from './types';

export const categoriesTable = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon').notNull(),
  color: text('color').notNull(),
  kind: text('kind').notNull().$type<CategoryKind>(),
  order: integer('order').notNull(),
  archivedAt: text('archivedAt'),
});
