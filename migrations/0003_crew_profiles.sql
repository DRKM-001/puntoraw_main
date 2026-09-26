-- Living crew profiles (puntoraw.org/team/<slug>)
-- Run once:  npx wrangler d1 execute puntoraw-episodes --remote --file=migrations/0003_crew_profiles.sql

-- What the AI noticed about each person in each episode. Nothing is public until approved.
CREATE TABLE IF NOT EXISTS crew_observations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member TEXT NOT NULL,                    -- greg | rafa | rj
  season INTEGER,
  episode INTEGER,
  kind TEXT NOT NULL,                      -- postura | cambio | tema | frase | pregunta | fortaleza | reto
  text TEXT NOT NULL,                      -- public wording
  evidence TEXT,                           -- short supporting quote, only shown in /crew-admin
  confidence REAL,                         -- how sure the AI is about who said it (0–1)
  status TEXT NOT NULL DEFAULT 'pending',  -- pending | approved | hidden
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  reviewed_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_crew_obs_member ON crew_observations (member, status);

-- Profile versions written by Markus from the approved observations. Only one is "published" per member.
CREATE TABLE IF NOT EXISTS crew_profiles (
  member TEXT NOT NULL,
  version INTEGER NOT NULL,
  data TEXT NOT NULL,                      -- JSON (see ProfileData in lib/crew.ts)
  status TEXT NOT NULL DEFAULT 'draft',    -- draft | published | archived
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (member, version)
);

-- Personality test results (puntoraw.org/test), one row per time someone takes it
CREATE TABLE IF NOT EXISTS crew_baselines (
  member TEXT NOT NULL,
  taken_on TEXT NOT NULL,                  -- YYYY-MM-DD
  code TEXT NOT NULL,                      -- e.g. INTJ-T
  scores TEXT NOT NULL,                    -- JSON {"E":1,"O":5,"A":2,"C":5,"N":1} (N = stability)
  season INTEGER,
  episode INTEGER,
  PRIMARY KEY (member, taken_on)
);

-- Seed: results read on air in S2 E7 (already public in the episode write-up)
INSERT OR IGNORE INTO crew_baselines (member, taken_on, code, scores, season, episode) VALUES
  ('rj',   '2026-09-24', 'INTJ-T', '{"E":1,"O":5,"A":2,"C":5,"N":1}', 2, 7),
  ('rafa', '2026-09-24', 'INFJ-A', '{"E":2,"O":4,"A":4,"C":5,"N":4}', 2, 7),
  ('greg', '2026-09-24', 'INTP-A', '{"E":1,"O":5,"A":2,"C":2,"N":5}', 2, 7);
