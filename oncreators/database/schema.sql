-- ============================================
-- ONCREATORS - Complete Database Schema
-- Premium Creator Marketplace
-- ============================================

-- ============================================
-- 1. USERS & AUTHENTICATION
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  profile_picture_url TEXT,
  bio TEXT,
  is_email_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- ============================================
-- 2. CREATORS
-- ============================================

CREATE TABLE creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creator_name VARCHAR(255) NOT NULL,
  description TEXT,
  profile_image_url TEXT,
  banner_image_url TEXT,
  website_url VARCHAR(500),
  twitter_handle VARCHAR(100),
  instagram_handle VARCHAR(100),
  is_verified BOOLEAN DEFAULT false,
  verification_badge_color VARCHAR(20),
  stripe_account_id VARCHAR(255),
  followers_count INT DEFAULT 0,
  total_content_count INT DEFAULT 0,
  total_earnings DECIMAL(15, 2) DEFAULT 0.00,
  avg_rating DECIMAL(3, 2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_creators_user_id ON creators(user_id);
CREATE INDEX idx_creators_is_verified ON creators(is_verified);

-- ============================================
-- 3. SUBSCRIPTIONS & PLANS
-- ============================================

CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10, 2) NOT NULL,
  features JSONB,
  trial_days INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  display_order INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO subscription_plans (name, price_monthly, features, trial_days, display_order) VALUES
  ('Freemium', 0.00, '{"streams": true, "basic_content": true, "community": true, "ads": true}', 0, 1),
  ('Creator Premium', 29.99, '{"streams": true, "premium_content": true, "signals": true, "private_community": true, "no_ads": true}', 7, 2),
  ('VIP Pro', 99.99, '{"streams": true, "all_content": true, "api_access": true, "custom_reports": true, "24_7_support": true}', 7, 3);

CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  stripe_subscription_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active', -- active, cancelled, past_due, unpaid
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  trial_end TIMESTAMP,
  cancelled_at TIMESTAMP,
  cancellation_reason TEXT,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_id ON user_subscriptions(stripe_subscription_id);

-- ============================================
-- 4. PAYMENTS & BILLING
-- ============================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id),
  stripe_payment_id VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  status VARCHAR(50) DEFAULT 'pending', -- pending, succeeded, failed
  payment_method VARCHAR(50), -- card, pix, paypal
  last_4_digits VARCHAR(4),
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  succeeded_at TIMESTAMP,
  failed_at TIMESTAMP,
  failure_reason TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_stripe_id ON payments(stripe_payment_id);

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  status VARCHAR(50) DEFAULT 'draft', -- draft, sent, paid, failed
  due_date DATE,
  paid_at TIMESTAMP,
  pdf_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- ============================================
-- 5. CREATOR CONTENT
-- ============================================

CREATE TABLE content_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url TEXT,
  is_active BOOLEAN DEFAULT true
);

INSERT INTO content_categories (name, description) VALUES
  ('Análises Trading', 'Análises técnicas e fundamentais'),
  ('Sinais', 'Sinais de compra e venda'),
  ('Cursos', 'Cursos educacionais'),
  ('Webinars', 'Transmissões ao vivo'),
  ('E-books', 'Livros digitais'),
  ('Templates', 'Modelos e ferramentas');

CREATE TABLE creator_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  category_id UUID REFERENCES content_categories(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content_type VARCHAR(50), -- video, pdf, live, course, template
  content_url TEXT,
  thumbnail_url TEXT,
  preview_url TEXT,
  duration_minutes INT,
  is_preview_available BOOLEAN DEFAULT true,
  requires_subscription BOOLEAN DEFAULT true,
  price_if_separate DECIMAL(10, 2),
  views_count INT DEFAULT 0,
  downloads_count INT DEFAULT 0,
  rating DECIMAL(3, 2),
  rating_count INT DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_content_creator_id ON creator_content(creator_id);
CREATE INDEX idx_content_is_published ON creator_content(is_published);
CREATE INDEX idx_content_category_id ON creator_content(category_id);

CREATE TABLE content_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES creator_content(id) ON DELETE CASCADE,
  accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  watched_percentage INT DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, content_id)
);

CREATE INDEX idx_access_user_id ON content_access(user_id);
CREATE INDEX idx_access_content_id ON content_access(content_id);

-- ============================================
-- 6. MARKETPLACE (COURSES, BUNDLES, PRODUCTS)
-- ============================================

CREATE TABLE marketplace_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  product_type VARCHAR(50), -- course, bundle, template, ebook
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  thumbnail_url TEXT,
  content_ids UUID[] DEFAULT '{}',
  total_sold INT DEFAULT 0,
  total_revenue DECIMAL(15, 2) DEFAULT 0.00,
  rating DECIMAL(3, 2),
  rating_count INT DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_creator_id ON marketplace_products(creator_id);
CREATE INDEX idx_products_is_published ON marketplace_products(is_published);

CREATE TABLE marketplace_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES marketplace_products(id),
  creator_id UUID NOT NULL REFERENCES creators(id),
  amount DECIMAL(10, 2) NOT NULL,
  creator_earnings DECIMAL(10, 2) NOT NULL,
  platform_fee DECIMAL(10, 2) NOT NULL,
  payment_id UUID REFERENCES payments(id),
  purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_purchases_user_id ON marketplace_purchases(user_id);
CREATE INDEX idx_purchases_creator_id ON marketplace_purchases(creator_id);

-- ============================================
-- 7. CREATOR EARNINGS & PAYOUTS
-- ============================================

CREATE TABLE creator_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  subscription_earnings DECIMAL(15, 2) DEFAULT 0.00,
  marketplace_earnings DECIMAL(15, 2) DEFAULT 0.00,
  affiliate_earnings DECIMAL(15, 2) DEFAULT 0.00,
  total_earnings DECIMAL(15, 2) DEFAULT 0.00,
  status VARCHAR(50) DEFAULT 'calculated', -- calculated, approved, paid
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(creator_id, period_start, period_end)
);

CREATE INDEX idx_earnings_creator_id ON creator_earnings(creator_id);

CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  earnings_id UUID REFERENCES creator_earnings(id),
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  payout_method VARCHAR(50), -- bank_transfer, stripe, pix
  bank_account_id VARCHAR(255),
  stripe_payout_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, paid, failed
  scheduled_date DATE,
  completed_date TIMESTAMP,
  failure_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payouts_creator_id ON payouts(creator_id);
CREATE INDEX idx_payouts_status ON payouts(status);

-- ============================================
-- 8. FOLLOWERS & RELATIONSHIPS
-- ============================================

CREATE TABLE creator_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_subscriber BOOLEAN DEFAULT false,
  UNIQUE(user_id, creator_id)
);

CREATE INDEX idx_followers_user_id ON creator_followers(user_id);
CREATE INDEX idx_followers_creator_id ON creator_followers(creator_id);

-- ============================================
-- 9. REVIEWS & RATINGS
-- ============================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES creators(id) ON DELETE CASCADE,
  content_id UUID REFERENCES creator_content(id) ON DELETE CASCADE,
  product_id UUID REFERENCES marketplace_products(id) ON DELETE CASCADE,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  helpful_count INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_creator_id ON reviews(creator_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);

-- ============================================
-- 10. AFFILIATE SYSTEM
-- ============================================

CREATE TABLE affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES marketplace_products(id),
  affiliate_code VARCHAR(50) UNIQUE NOT NULL,
  commission_percent DECIMAL(5, 2) DEFAULT 10.00,
  clicks INT DEFAULT 0,
  conversions INT DEFAULT 0,
  total_earned DECIMAL(15, 2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_affiliate_creator_id ON affiliate_links(creator_id);
CREATE INDEX idx_affiliate_product_id ON affiliate_links(product_id);

-- ============================================
-- 11. ANALYTICS & TRACKING
-- ============================================

CREATE TABLE creator_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  new_subscribers INT DEFAULT 0,
  cancelled_subscribers INT DEFAULT 0,
  total_views INT DEFAULT 0,
  total_downloads INT DEFAULT 0,
  revenue DECIMAL(15, 2) DEFAULT 0.00,
  avg_rating DECIMAL(3, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(creator_id, date)
);

CREATE INDEX idx_analytics_creator_id ON creator_analytics(creator_id);

CREATE TABLE user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  content_viewed INT DEFAULT 0,
  content_downloaded INT DEFAULT 0,
  spent_amount DECIMAL(15, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

CREATE INDEX idx_user_analytics_user_id ON user_analytics(user_id);

-- ============================================
-- 12. SUPPORT & ISSUES
-- ============================================

CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES creators(id),
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100),
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
  status VARCHAR(50) DEFAULT 'open', -- open, in_progress, resolved, closed
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_tickets_status ON support_tickets(status);

-- ============================================
-- 13. MARKETING & PROMOTIONS
-- ============================================

CREATE TABLE coupon_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20), -- percentage, fixed_amount
  discount_value DECIMAL(10, 2) NOT NULL,
  max_uses INT,
  current_uses INT DEFAULT 0,
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  applicable_plans UUID[],
  applicable_creators UUID[],
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_coupons_code ON coupon_codes(code);

-- ============================================
-- 14. SECURITY & COMPLIANCE
-- ============================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(100),
  resource_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at DESC);

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

CREATE VIEW creator_stats AS
SELECT
  c.id,
  c.creator_name,
  COUNT(DISTINCT cf.user_id) as followers,
  COUNT(DISTINCT cc.id) as total_content,
  COALESCE(SUM(cc.views_count), 0) as total_views,
  COALESCE(SUM(CASE WHEN cc.rating IS NOT NULL THEN cc.rating * cc.rating_count ELSE 0 END), 0) as total_rating_points,
  COALESCE(COUNT(DISTINCT CASE WHEN us.status = 'active' THEN us.user_id END), 0) as active_subscribers,
  COALESCE(SUM(p.amount), 0) as total_revenue
FROM creators c
LEFT JOIN creator_followers cf ON c.id = cf.creator_id
LEFT JOIN creator_content cc ON c.id = cc.creator_id
LEFT JOIN user_subscriptions us ON c.user_id = us.user_id
LEFT JOIN marketplace_purchases mp ON c.id = mp.creator_id
LEFT JOIN payments p ON p.id = mp.payment_id
GROUP BY c.id, c.creator_name;

CREATE VIEW user_subscription_status AS
SELECT
  u.id,
  u.email,
  us.id as subscription_id,
  sp.name as plan_name,
  sp.price_monthly,
  us.status,
  us.current_period_start,
  us.current_period_end,
  us.auto_renew
FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id AND us.status = 'active'
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id;

-- ============================================
-- INITIAL SEED DATA
-- ============================================

-- Admin user for testing
INSERT INTO users (email, username, password_hash, first_name, last_name, is_email_verified, is_active)
VALUES ('admin@oncreators.com', 'admin', 'hashed_password', 'Admin', 'User', true, true)
ON CONFLICT DO NOTHING;
