-- Episodes table for .RAW Sessions
CREATE TABLE IF NOT EXISTS episodes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  speaker TEXT NOT NULL DEFAULT 'Punto Raw',
  season INTEGER NOT NULL,
  season_episode INTEGER NOT NULL,
  episode_number INTEGER NOT NULL,
  date TEXT NOT NULL DEFAULT (date('now')),
  duration TEXT,
  summary TEXT,
  topics TEXT, -- JSON array stored as text
  quote TEXT,
  spotify_id TEXT,
  audio_url TEXT,
  transcript TEXT,
  status TEXT NOT NULL DEFAULT 'published', -- draft | published | archived
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(season, season_episode)
);

-- Index for listing episodes by season
CREATE INDEX IF NOT EXISTS idx_episodes_season ON episodes(season, season_episode);
CREATE INDEX IF NOT EXISTS idx_episodes_status ON episodes(status);
