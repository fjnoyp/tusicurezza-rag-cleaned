
// Partial work to integrate drizzle ORM with supabase
// See guide: https://supabase.com/docs/guides/database/connecting-to-postgres#connecting-with-drizzle

import { pgTable, serial, text, varchar, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";

// Define the PdfChatContext table
export const pdfChatContexts = pgTable('pdf_chat_contexts', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  chatWithPdfSourceId: integer('chat_with_pdf_source_id').notNull(),
  // TODO: add a string array here pdfFileNames: new PgArray('pdf_file_names').default([]),
});

// Define the PdfChatThread table
export const pdfChatThreads = pgTable('pdf_chat_threads', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  customerId: integer('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  pdfChatContextId: integer('pdf_chat_context_id').notNull().references(() => pdfChatContexts.id, { onDelete: 'cascade' }),
});

// Define the PdfChatMessage table
export const pdfChatMessages = pgTable('pdf_chat_messages', {
  id: serial('id').primaryKey(),
  pdfChatThreadId: integer('pdf_chat_thread_id').notNull().references(() => pdfChatThreads.id, { onDelete: 'cascade' }),
  messageText: text('message_text').notNull(),
  isUserMessage: boolean('is_user_message').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the Customer table
export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  address: text('address'),
  phoneNumber: varchar('phone_number', { length: 20 }),
  email: varchar('email', { length: 255 }).notNull(),
});

// Define the Charge table
export const charges = pgTable('charges', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  pdfChatThreadId: integer('pdf_chat_thread_id').notNull().references(() => pdfChatThreads.id, { onDelete: 'cascade' }),
  chargeDate: timestamp('charge_date').notNull(),
  durationInMinutes: integer('duration_in_minutes').notNull(),
  rate: decimal('rate', { precision: 10, scale: 2 }).notNull(),
});