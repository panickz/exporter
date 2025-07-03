import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core"

export const pdfExports = pgTable("pdf_exports", {
  id: serial("id").primaryKey(),
  status: text("status").notNull().default("pending"),
  sourceUrl: text("source_url").notNull(),
  downloadToken: text("download_token"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  expiresAt: timestamp("expires_at"),
})

export type PdfExport = typeof pdfExports.$inferSelect
export type NewPdfExport = typeof pdfExports.$inferInsert
