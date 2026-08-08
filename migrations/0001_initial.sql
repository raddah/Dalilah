CREATE TABLE IF NOT EXISTS sites (
  id TEXT PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  city TEXT,
  category TEXT,
  description_ar TEXT,
  latitude REAL,
  longitude REAL,
  last_verified TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  site_id TEXT,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  source_type TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  authority TEXT,
  last_verified TEXT NOT NULL,
  FOREIGN KEY (site_id) REFERENCES sites(id)
);

CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  language TEXT NOT NULL DEFAULT 'ar',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  citations_json TEXT,
  confidence TEXT,
  request_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);

CREATE INDEX IF NOT EXISTS idx_sources_search ON sources(title, description_ar, description_en);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);
