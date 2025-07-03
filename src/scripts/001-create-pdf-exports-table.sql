CREATE TABLE IF NOT EXISTS pdf_exports (
  id SERIAL PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'pending',
  source_url TEXT NOT NULL,
  download_token TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP,
  expires_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pdf_exports_token ON pdf_exports(download_token);
CREATE INDEX IF NOT EXISTS idx_pdf_exports_status ON pdf_exports(status);
CREATE INDEX IF NOT EXISTS idx_pdf_exports_created_at ON pdf_exports(created_at DESC);
