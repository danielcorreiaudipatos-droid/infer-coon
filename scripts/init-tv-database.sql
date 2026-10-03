-- Initialize TV Module Database
-- Run this script to set up the TV module tables and initial data

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

-- Quotes Table (Financial Data)
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol VARCHAR(50) UNIQUE NOT NULL,
  price DECIMAL(15, 2),
  change_percent DECIMAL(10, 4),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_watching_sessions_user_id ON watching_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_watching_sessions_stream_id ON watching_sessions(stream_id);
CREATE INDEX IF NOT EXISTS idx_tv_streams_is_live ON tv_streams(is_live);
CREATE INDEX IF NOT EXISTS idx_quotes_symbol ON quotes(symbol);

-- Insert Initial TV Streams
INSERT INTO tv_streams (title, description, url, reward_per_min, is_live) VALUES
  (
    'Análise de Mercado IBOVESPA',
    'Acompanhamento ao vivo do índice IBOVESPA com análise em tempo real de ações brasileiras',
    'rtmp://stream.ongame.com/live/ibov',
    0.02,
    true
  ),
  (
    'Notícias Financeiras',
    'Últimas notícias sobre economia, mercado e moedas',
    'rtmp://stream.ongame.com/live/news',
    0.01,
    false
  ),
  (
    'Trading ao Vivo',
    'Simulador de trading com dinheiro fictício. Ganhe R$ 0.50 por previsão correta',
    'rtmp://stream.ongame.com/live/trading',
    0.015,
    true
  );

-- Insert Initial Quotes
INSERT INTO quotes (symbol, price, change_percent) VALUES
  ('IBOV', 131250.50, 0.85),
  ('USDBRL', 4.95, -0.12),
  ('BTC', 67500.00, 2.30)
ON CONFLICT (symbol) DO UPDATE SET
  price = EXCLUDED.price,
  change_percent = EXCLUDED.change_percent,
  updated_at = CURRENT_TIMESTAMP;
