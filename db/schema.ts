import {integer,sqliteTable,text,index} from 'drizzle-orm/sqlite-core';
export const records=sqliteTable('records',{id:text('id').primaryKey(),date:text('date').notNull(),count:integer('count').notNull(),meso:integer('meso').notNull(),pieces:integer('pieces').notNull(),price:integer('price').notNull(),createdAt:integer('created_at').notNull().default(0)},t=>[index('idx_records_date').on(t.date),index('idx_records_created_at').on(t.createdAt)]);
export const settings=sqliteTable('settings',{id:integer('id').primaryKey(),price:integer('price').notNull()});
