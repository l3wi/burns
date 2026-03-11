import { Database } from "bun:sqlite"

import { DATABASE_PATH } from "@/config/paths"

export const db = new Database(DATABASE_PATH, { create: true })

db.exec(`
  CREATE TABLE IF NOT EXISTS workspaces (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    path TEXT NOT NULL UNIQUE,
    branch TEXT,
    repo_url TEXT,
    default_agent TEXT,
    health_status TEXT NOT NULL,
    source_type TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`)
