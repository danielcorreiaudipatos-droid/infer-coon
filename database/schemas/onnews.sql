-- ============================================
-- ONNEWS PostgreSQL Schema
-- Complete database structure for TV streaming platform
-- ============================================

-- ============================================
-- 1. USERS & AUTHENTICATION
-- ============================================

CREATE SCHEMA IF NOT EXISTS onnews;

CREATE TABLE onnews.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE,
  cpf VARCHAR(14) UNIQUE,
  state VARCHAR(2),
  city VARCHAR(100),
  profile_picture_url TEXT,
  bio TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE onnews.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES onnews.users(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL UNIQUE,
  refresh_token VARCHAR(500),
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. WALLET & TRANSACTIONS
-- ============================================

CREATE TABLE onnews.wallet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES onnews.users(id) ON DELETE CASCADE,
  balance DECIMAL(15, 2) DEFAULT 0.00,
  total_earned DECIMAL(15, 2) DEFAULT 0.00,
  total_withdrawn DECIMAL(15, 2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'BRL',
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE onnews.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES onnews.users(id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL REFERENCES onnews.wallet(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'watch_earning', 'trading_earning', 'withdrawal', 'purchase', 'refund'
  amount DECIMAL(15, 2) NOT NULL,
  description TEXT,
  reference_id UUID, -- Links to watching_session, trading_prediction, etc.
  status VARCHAR(20) DEFAULT 'completed', -- 'pending', 'completed', 'failed', 'reversed'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE onnews.withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES onnews.users(id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL REFERENCES onnews.wallet(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  bank_account_id UUID,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. TV STREAMING
-- ============================================

CREATE TABLE onnews.streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  category VARCHAR(50), -- 'finance', 'news', 'trading', 'tutorial'
  rtmp_url VARCHAR(500),
  hls_url VARCHAR(500),
  is_live BOOLEAN DEFAULT false,
  reward_per_minute DECIMAL(10, 4) DEFAULT 0.01,
  viewer_count INT DEFAULT 0,
  scheduled_start TIMESTAMP,
  scheduled_end TIMESTAMP,
  actual_start TIMESTAMP,
  actual_end TIMESTAMP,
  duration_minutes INT,
  total_earnings_distributed DECIMAL(15, 2) DEFAULT 0.00,
  total_viewers INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE onnews.watching_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES onnews.users(id) ON DELETE CASCADE,
  stream_id UUID NOT NULL REFERENCES onnews.streams(id) ON DELETE CASCADE,
  start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP,
  duration_minutes DECIMAL(10, 2),
  earnings DECIMAL(15, 2) DEFAULT 0.00,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. REAL-TIME QUOTATIONS
-- ============================================

CREATE TABLE onnews.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol VARCHAR(50) NOT NULL,
  name VARCHAR(255),
  price DECIMAL(15, 4) NOT NULL,
  previous_close DECIMAL(15, 4),
  change_amount DECIMAL(15, 4),
  change_percent DECIMAL(10, 4),
  high_day DECIMAL(15, 4),
  low_day DECIMAL(15, 4),
  volume BIGINT,
  market_cap DECIMAL(20, 2),
  source VARCHAR(50), -- 'brapi', 'alpha_vantage', 'coingecko'
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(symbol)
);

CREATE TABLE onnews.quote_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES onnews.quotes(id) ON DELETE CASCADE,
  symbol VARCHAR(50) NOT NULL,
  price DECIMAL(15, 4) NOT NULL,
  change_percent DECIMAL(10, 4),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. TRADING SIMULATOR
-- ============================================

CREATE TABLE onnews.trading_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES onnews.users(id) ON DELETE CASCADE,
  initial_balance DECIMAL(15, 2) DEFAULT 10000.00, -- R$ 10.000 inicial simulado
  current_balance DECIMAL(15, 2) DEFAULT 10000.00,
  total_profit_loss DECIMAL(15, 2) DEFAULT 0.00,
  profit_loss_percent DECIMAL(10, 4) DEFAULT 0.00,
  total_trades INT DEFAULT 0,
  winning_trades INT DEFAULT 0,
  losing_trades INT DEFAULT 0,
  accuracy_percent DECIMAL(10, 4) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE onnews.trading_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES onnews.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES onnews.trading_accounts(id) ON DELETE CASCADE,
  symbol VARCHAR(50) NOT NULL,
  prediction VARCHAR(10), -- 'up', 'down'
  entry_price DECIMAL(15, 4) NOT NULL,
  quantity INT NOT NULL,
  stake_amount DECIMAL(15, 2) NOT NULL,
  expected_earning DECIMAL(15, 2), -- R$ 0.50 por acerto
  is_correct BOOLEAN,
  exit_price DECIMAL(15, 4),
  profit_loss DECIMAL(15, 2) DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'open', -- 'open', 'closed', 'expired'
  time_frame VARCHAR(50), -- '1m', '5m', '15m', '1h', '1d'
  result_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  closed_at TIMESTAMP
);

-- ============================================
-- 6. STREAMER MANAGEMENT
-- ============================================

CREATE TABLE onnews.streamers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES onnews.users(id) ON DELETE CASCADE,
  streamer_name VARCHAR(255) NOT NULL,
  bio TEXT,
  profile_image_url TEXT,
  banner_image_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  verification_date TIMESTAMP,
  followers_count INT DEFAULT 0,
  total_streams INT DEFAULT 0,
  total_viewers INT DEFAULT 0,
  total_earnings DECIMAL(15, 2) DEFAULT 0.00,
  stream_key VARCHAR(255) UNIQUE,
  is_active BOOLEAN DEFAULT true,
  suspended_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE onnews.streamer_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES onnews.users(id) ON DELETE CASCADE,
  streamer_id UUID NOT NULL REFERENCES onnews.streamers(id) ON DELETE CASCADE,
  followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, streamer_id)
);

-- ============================================
-- 7. ACHIEVEMENTS & GAMIFICATION
-- ============================================

CREATE TABLE onnews.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon_url TEXT,
  requirement_type VARCHAR(50), -- 'watch_hours', 'earnings', 'trades', 'followers'
  requirement_value INT,
  reward_amount DECIMAL(15, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE onnews.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES onnews.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES onnews.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, achievement_id)
);

-- ============================================
-- 8. LEADERBOARDS
-- ============================================

CREATE TABLE onnews.leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES onnews.users(id) ON DELETE CASCADE,
  username VARCHAR(100),
  rank INT,
  total_earnings DECIMAL(15, 2),
  watch_hours DECIMAL(10, 2),
  trading_accuracy DECIMAL(10, 4),
  period VARCHAR(20), -- 'daily', 'weekly', 'monthly', 'all_time'
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 9. ANALYTICS & LOGS
-- ============================================

CREATE TABLE onnews.user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES onnews.users(id) ON DELETE CASCADE,
  total_watch_time_minutes DECIMAL(10, 2) DEFAULT 0,
  total_earnings DECIMAL(15, 2) DEFAULT 0.00,
  average_session_duration DECIMAL(10, 2),
  favorite_category VARCHAR(50),
  last_activity TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE onnews.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES onnews.users(id) ON DELETE SET NULL,
  action VARCHAR(100),
  resource_type VARCHAR(50), -- 'stream', 'wallet', 'trading', 'account'
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 10. NOTIFICATIONS
-- ============================================

CREATE TABLE onnews.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES onnews.users(id) ON DELETE CASCADE,
  type VARCHAR(50), -- 'earning', 'stream_live', 'achievement', 'trading', 'system'
  title VARCHAR(255) NOT NULL,
  message TEXT,
  action_url TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Users & Sessions
CREATE INDEX idx_users_email ON onnews.users(email);
CREATE INDEX idx_users_username ON onnews.users(username);
CREATE INDEX idx_sessions_user_id ON onnews.sessions(user_id);
CREATE INDEX idx_sessions_token ON onnews.sessions(token);

-- Wallet & Transactions
CREATE INDEX idx_wallet_user_id ON onnews.wallet(user_id);
CREATE INDEX idx_transactions_user_id ON onnews.transactions(user_id);
CREATE INDEX idx_transactions_type ON onnews.transactions(type);
CREATE INDEX idx_transactions_created_at ON onnews.transactions(created_at DESC);
CREATE INDEX idx_withdrawal_user_id ON onnews.withdrawal_requests(user_id);
CREATE INDEX idx_withdrawal_status ON onnews.withdrawal_requests(status);

-- Streams
CREATE INDEX idx_streams_is_live ON onnews.streams(is_live);
CREATE INDEX idx_streams_category ON onnews.streams(category);
CREATE INDEX idx_streams_created_at ON onnews.streams(created_at DESC);

-- Watching Sessions
CREATE INDEX idx_watching_sessions_user_id ON onnews.watching_sessions(user_id);
CREATE INDEX idx_watching_sessions_stream_id ON onnews.watching_sessions(stream_id);
CREATE INDEX idx_watching_sessions_created_at ON onnews.watching_sessions(created_at DESC);
CREATE INDEX idx_watching_sessions_is_completed ON onnews.watching_sessions(is_completed);

-- Quotes
CREATE INDEX idx_quotes_symbol ON onnews.quotes(symbol);
CREATE INDEX idx_quotes_updated_at ON onnews.quotes(last_updated DESC);
CREATE INDEX idx_quote_history_symbol ON onnews.quote_history(symbol);
CREATE INDEX idx_quote_history_recorded_at ON onnews.quote_history(recorded_at DESC);

-- Trading
CREATE INDEX idx_trading_accounts_user_id ON onnews.trading_accounts(user_id);
CREATE INDEX idx_trading_predictions_user_id ON onnews.trading_predictions(user_id);
CREATE INDEX idx_trading_predictions_account_id ON onnews.trading_predictions(account_id);
CREATE INDEX idx_trading_predictions_status ON onnews.trading_predictions(status);
CREATE INDEX idx_trading_predictions_symbol ON onnews.trading_predictions(symbol);

-- Streamers
CREATE INDEX idx_streamers_user_id ON onnews.streamers(user_id);
CREATE INDEX idx_streamers_is_active ON onnews.streamers(is_active);
CREATE INDEX idx_streamer_followers_user_id ON onnews.streamer_followers(user_id);
CREATE INDEX idx_streamer_followers_streamer_id ON onnews.streamer_followers(streamer_id);

-- Achievements
CREATE INDEX idx_user_achievements_user_id ON onnews.user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON onnews.user_achievements(achievement_id);

-- Leaderboard
CREATE INDEX idx_leaderboard_entries_period ON onnews.leaderboard_entries(period);
CREATE INDEX idx_leaderboard_entries_rank ON onnews.leaderboard_entries(rank);

-- Analytics
CREATE INDEX idx_user_analytics_user_id ON onnews.user_analytics(user_id);
CREATE INDEX idx_activity_logs_user_id ON onnews.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON onnews.activity_logs(created_at DESC);

-- Notifications
CREATE INDEX idx_notifications_user_id ON onnews.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON onnews.notifications(is_read);

-- ============================================
-- SEED DATA (Initial Setup)
-- ============================================

-- Initial Quotes
INSERT INTO onnews.quotes (symbol, name, price, change_percent) VALUES
  ('IBOV', 'IBOVESPA Index', 131250.50, 0.85),
  ('USDBRL', 'USD/BRL', 4.95, -0.12),
  ('BTC', 'Bitcoin', 67500.00, 2.30),
  ('PETR4', 'Petrobras PN', 27.50, 1.25),
  ('VALE3', 'Vale ON', 58.30, 0.50),
  ('ITUB4', 'Itaú PN', 36.80, -0.30)
ON CONFLICT (symbol) DO UPDATE SET
  price = EXCLUDED.price,
  change_percent = EXCLUDED.change_percent,
  last_updated = CURRENT_TIMESTAMP;

-- Initial Achievements
INSERT INTO onnews.achievements (code, name, description, requirement_type, requirement_value, reward_amount) VALUES
  ('first_watch', 'Primeiro Passo', 'Assista seu primeiro stream', 'watch_hours', 1, 5.00),
  ('hour_marathoner', 'Maratonista', 'Assista 10 horas de conteúdo', 'watch_hours', 10, 20.00),
  ('trader_starter', 'Trader Iniciante', 'Faça sua primeira previsão de trading', 'trades', 1, 2.00),
  ('accuracy_master', 'Mestre da Precisão', 'Alcance 80% de acurácia em trading', 'accuracy', 80, 50.00),
  ('first_withdrawal', 'Saque de Ouro', 'Faça seu primeiro saque', 'earnings', 50, 0.00),
  ('top_10_earner', 'Top 10', 'Entre no top 10 de ganhos', 'earnings', 1000, 100.00);
