-- TV Streams Table
CREATE TABLE IF NOT EXISTS tv_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  url VARCHAR(500),
  reward_per_min DECIMAL(10, 4) DEFAULT 0.01,
  is_live BOOLEAN DEFAULT false,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Watching Sessions Table
CREATE TABLE IF NOT EXISTS watching_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  stream_id UUID NOT NULL REFERENCES tv_streams(id),
  start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP,
  earnings DECIMAL(10, 2) DEFAULT 0
);

-- Quotes Table
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol VARCHAR(50) UNIQUE NOT NULL,
  price DECIMAL(15, 2),
  change_percent DECIMAL(10, 4),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_watching_sessions_user_id ON watching_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_tv_streams_is_live ON tv_streams(is_live);
