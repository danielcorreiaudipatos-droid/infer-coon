-- ============================================
-- ONNEWS Schema v2 - CEP & CNPJ Integration
-- Additions/modifications for address and company data
-- ============================================

-- ============================================
-- 1. ADDRESS TABLE (CEP Integration)
-- ============================================

CREATE TABLE onnews.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES onnews.users(id) ON DELETE CASCADE,
  cep VARCHAR(10) NOT NULL, -- Format: XXXXX-XXX
  street VARCHAR(255) NOT NULL,
  number VARCHAR(20) NOT NULL,
  complement VARCHAR(255),
  neighborhood VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  country VARCHAR(2) DEFAULT 'BR',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_verified BOOLEAN DEFAULT false,
  is_primary BOOLEAN DEFAULT true,
  cep_api_source VARCHAR(50), -- 'viacep', 'postmon', 'opencep'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. STREAMER COMPANY DATA (CNPJ Integration)
-- ============================================

CREATE TABLE onnews.streamer_company (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  streamer_id UUID NOT NULL UNIQUE REFERENCES onnews.streamers(id) ON DELETE CASCADE,
  cnpj VARCHAR(18) UNIQUE, -- Format: XX.XXX.XXX/XXXX-XX
  company_name VARCHAR(255),
  trading_name VARCHAR(255),
  company_email VARCHAR(255),
  company_phone VARCHAR(20),
  company_website VARCHAR(255),
  registration_date DATE,
  company_size VARCHAR(50), -- 'MEI', 'PJ', 'LTDA', 'SA'
  activity_description TEXT,
  is_cnpj_verified BOOLEAN DEFAULT false,
  verification_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE onnews.streamer_company_address (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES onnews.streamer_company(id) ON DELETE CASCADE,
  cep VARCHAR(10) NOT NULL,
  street VARCHAR(255) NOT NULL,
  number VARCHAR(20) NOT NULL,
  complement VARCHAR(255),
  neighborhood VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  country VARCHAR(2) DEFAULT 'BR',
  address_type VARCHAR(50) DEFAULT 'commercial', -- 'commercial', 'billing', 'warehouse'
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. BANK ACCOUNT (CEP/CNPJ related)
-- ============================================

CREATE TABLE onnews.bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES onnews.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES onnews.streamer_company(id) ON DELETE CASCADE,
  bank_code VARCHAR(5) NOT NULL, -- '001' (BB), '033' (Santander), etc
  bank_name VARCHAR(255),
  account_type VARCHAR(20), -- 'checking', 'savings'
  agency_number VARCHAR(10) NOT NULL,
  account_number VARCHAR(20) NOT NULL,
  account_digit VARCHAR(2),
  cpf_cnpj VARCHAR(18), -- CPF for individuals, CNPJ for companies
  account_holder_name VARCHAR(255) NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  verification_date TIMESTAMP,
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, bank_code, agency_number, account_number),
  UNIQUE(company_id, bank_code, agency_number, account_number)
);

-- ============================================
-- 4. CEP API CACHE (Performance optimization)
-- ============================================

CREATE TABLE onnews.cep_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cep VARCHAR(10) UNIQUE NOT NULL,
  street VARCHAR(255),
  neighborhood VARCHAR(100),
  city VARCHAR(100),
  state VARCHAR(2),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  source VARCHAR(50), -- 'viacep', 'postmon', 'opencep'
  cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days')
);

-- ============================================
-- 5. CNPJ VERIFICATION CACHE
-- ============================================

CREATE TABLE onnews.cnpj_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cnpj VARCHAR(18) UNIQUE NOT NULL,
  company_name VARCHAR(255),
  trading_name VARCHAR(255),
  registration_date DATE,
  status VARCHAR(50), -- 'active', 'inactive', 'cancelled'
  company_size VARCHAR(50),
  activity_code VARCHAR(10),
  activity_description TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  source VARCHAR(50), -- 'receita', 'api_brasil', 'manual'
  cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '90 days')
);

-- ============================================
-- 6. INDEXES FOR CEP & CNPJ
-- ============================================

CREATE INDEX idx_addresses_cep ON onnews.addresses(cep);
CREATE INDEX idx_addresses_user_id ON onnews.addresses(user_id);
CREATE INDEX idx_addresses_city_state ON onnews.addresses(city, state);
CREATE INDEX idx_addresses_location ON onnews.addresses(latitude, longitude);

CREATE INDEX idx_streamer_company_cnpj ON onnews.streamer_company(cnpj);
CREATE INDEX idx_streamer_company_streamer_id ON onnews.streamer_company(streamer_id);
CREATE INDEX idx_streamer_company_is_verified ON onnews.streamer_company(is_cnpj_verified);

CREATE INDEX idx_streamer_company_address_cep ON onnews.streamer_company_address(cep);
CREATE INDEX idx_streamer_company_address_company_id ON onnews.streamer_company_address(company_id);

CREATE INDEX idx_bank_accounts_user_id ON onnews.bank_accounts(user_id);
CREATE INDEX idx_bank_accounts_company_id ON onnews.bank_accounts(company_id);
CREATE INDEX idx_bank_accounts_cpf_cnpj ON onnews.bank_accounts(cpf_cnpj);

CREATE INDEX idx_cep_cache_cep ON onnews.cep_cache(cep);
CREATE INDEX idx_cep_cache_expires_at ON onnews.cep_cache(expires_at);

CREATE INDEX idx_cnpj_cache_cnpj ON onnews.cnpj_cache(cnpj);
CREATE INDEX idx_cnpj_cache_expires_at ON onnews.cnpj_cache(expires_at);

-- ============================================
-- 7. FUNCTIONS FOR CEP & CNPJ VALIDATION
-- ============================================

CREATE OR REPLACE FUNCTION validate_cep(cep_input VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
  -- CEP format: XXXXX-XXX (5 digits, hyphen, 3 digits)
  RETURN cep_input ~ '^\d{5}-\d{3}$' OR cep_input ~ '^\d{8}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION validate_cnpj(cnpj_input VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  cnpj_clean VARCHAR;
  sum INT := 0;
  remainder INT;
  pos INT;
  digit INT;
BEGIN
  -- Remove non-numeric characters
  cnpj_clean := regexp_replace(cnpj_input, '[^\d]', '', 'g');

  -- Must have exactly 14 digits
  IF length(cnpj_clean) != 14 THEN
    RETURN false;
  END IF;

  -- Calculate first check digit
  FOR pos IN 1..12 LOOP
    digit := substring(cnpj_clean, pos, 1)::INT;
    sum := sum + (digit * ((13 - pos) % 8 + 2));
  END LOOP;

  remainder := sum % 11;
  IF remainder < 2 THEN
    IF substring(cnpj_clean, 13, 1)::INT != 0 THEN
      RETURN false;
    END IF;
  ELSE
    IF substring(cnpj_clean, 13, 1)::INT != (11 - remainder) THEN
      RETURN false;
    END IF;
  END IF;

  -- Calculate second check digit
  sum := 0;
  FOR pos IN 1..13 LOOP
    digit := substring(cnpj_clean, pos, 1)::INT;
    sum := sum + (digit * ((14 - pos) % 8 + 2));
  END LOOP;

  remainder := sum % 11;
  IF remainder < 2 THEN
    RETURN substring(cnpj_clean, 14, 1)::INT = 0;
  ELSE
    RETURN substring(cnpj_clean, 14, 1)::INT = (11 - remainder);
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- 8. SEED DATA FOR CEP CACHE
-- ============================================

INSERT INTO onnews.cep_cache (cep, street, neighborhood, city, state, source) VALUES
  ('58100-000', 'Avenida Getúlio Vargas', 'Centro', 'Campina Grande', 'PB', 'viacep'),
  ('58000-000', 'Rua Tabajara', 'Centro', 'João Pessoa', 'PB', 'viacep'),
  ('01310-100', 'Avenida Paulista', 'Bela Vista', 'São Paulo', 'SP', 'viacep')
ON CONFLICT (cep) DO NOTHING;

-- ============================================
-- CONSTRAINTS FOR DATA INTEGRITY
-- ============================================

ALTER TABLE onnews.addresses
ADD CONSTRAINT check_valid_cep CHECK (validate_cep(cep));

ALTER TABLE onnews.addresses
ADD CONSTRAINT check_valid_state CHECK (state ~ '^[A-Z]{2}$');

ALTER TABLE onnews.bank_accounts
ADD CONSTRAINT check_valid_agency CHECK (agency_number ~ '^\d{4,5}$');

ALTER TABLE onnews.bank_accounts
ADD CONSTRAINT check_valid_account CHECK (account_number ~ '^\d{6,20}$');
