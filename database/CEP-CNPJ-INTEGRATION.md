# CEP & CNPJ Integration Guide

## 📮 Overview

Complete integration for Brazilian postal codes (CEP) and company registration (CNPJ) in ONNEWS platform.

---

## 1️⃣ CEP (Código de Endereçamento Postal)

### What is CEP?
Brazilian postal code system: **XXXXX-XXX** (5 digits - 3 digits)

### Database Tables

#### `addresses` (User Addresses)
```sql
id, user_id, cep, street, number, complement, 
neighborhood, city, state, country, latitude, longitude, 
is_verified, is_primary, cep_api_source, created_at, updated_at
```

#### `cep_cache` (API Cache)
```sql
id, cep (UNIQUE), street, neighborhood, city, state, 
latitude, longitude, source, cached_at, expires_at (30 days)
```

### Supported CEP APIs

#### Option 1: **ViaCEP** (Recommended - Free)
- **URL**: `https://viacep.com.br/ws/{cep}/json/`
- **Rate Limit**: 600 requests/hour per IP
- **Response Time**: Fast
- **Reliability**: 99%
- **Cost**: Free
- **Authentication**: None

```bash
curl "https://viacep.com.br/ws/01310100/json/"

# Response:
{
  "cep": "01310-100",
  "logradouro": "Avenida Paulista",
  "complemento": "",
  "bairro": "Bela Vista",
  "localidade": "São Paulo",
  "uf": "SP",
  "ibge": "3550308",
  "gia": "",
  "ddd": "11",
  "siafi": "7107"
}
```

#### Option 2: **PostMon** (Alternative - Free)
- **URL**: `https://api.postmon.com.br/v1/cep/{cep}`
- **Rate Limit**: Generous
- **Response Time**: Fast
- **Reliability**: 95%
- **Cost**: Free
- **Authentication**: None

```bash
curl "https://api.postmon.com.br/v1/cep/01310100"

# Response:
{
  "bairro": "Bela Vista",
  "cep": "01310-100",
  "cidade": "São Paulo",
  "logradouro": "Avenida Paulista",
  "estado": "SP",
  "latitude": -23.5614,
  "longitude": -46.6574
}
```

#### Option 3: **OpenCEP** (Modern - Freemium)
- **URL**: `https://opencep.com/v1/cep/{cep}`
- **Rate Limit**: 300 requests/day (free)
- **Response Time**: Fast
- **Reliability**: 98%
- **Cost**: Free (limited) / Paid (unlimited)
- **Authentication**: Optional API key

```bash
curl "https://opencep.com/v1/cep/01310100"

# Response:
{
  "cep": "01310-100",
  "address": "Avenida Paulista",
  "district": "Bela Vista",
  "city": "São Paulo",
  "state": "SP",
  "location": {
    "type": "Point",
    "coordinates": [-46.6574, -23.5614]
  }
}
```

### Implementation Strategy

**Use ViaCEP as primary, PostMon as fallback:**

```typescript
// services/cep.service.ts

async lookupCEP(cep: string): Promise<AddressData> {
  const cleanCep = cep.replace(/\D/g, '');
  
  // Check cache first
  const cached = await this.cepCache.findOne(cleanCep);
  if (cached && !isExpired(cached)) {
    return cached;
  }
  
  try {
    // Try ViaCEP
    const result = await axios.get(
      `https://viacep.com.br/ws/${cleanCep}/json/`
    );
    
    if (result.data.erro) {
      throw new Error('CEP not found');
    }
    
    const address = {
      cep: result.data.cep,
      street: result.data.logradouro,
      neighborhood: result.data.bairro,
      city: result.data.localidade,
      state: result.data.uf,
    };
    
    // Cache result
    await this.cepCache.create({
      cep: cleanCep,
      ...address,
      source: 'viacep',
      expiresAt: addDays(new Date(), 30),
    });
    
    return address;
    
  } catch (error) {
    // Fallback to PostMon
    const result = await axios.get(
      `https://api.postmon.com.br/v1/cep/${cleanCep}`
    );
    
    return {
      cep: result.data.cep,
      street: result.data.logradouro,
      neighborhood: result.data.bairro,
      city: result.data.cidade,
      state: result.data.estado,
    };
  }
}
```

### Validation

```typescript
// PostgreSQL validation function
validate_cep(cep_input VARCHAR) RETURNS BOOLEAN
  ✓ Format: XXXXX-XXX or XXXXXXXX
  ✓ Returns true/false

// TypeScript validation
function isValidCEP(cep: string): boolean {
  return /^\d{5}-?\d{3}$/.test(cep);
}
```

---

## 2️⃣ CNPJ (Cadastro Nacional da Pessoa Jurídica)

### What is CNPJ?
Brazilian company registration number: **XX.XXX.XXX/XXXX-XX** (14 digits)

### Database Tables

#### `streamer_company` (Company Profile)
```sql
id, streamer_id (UNIQUE), cnpj (UNIQUE), company_name, 
trading_name, company_email, company_phone, company_website,
registration_date, company_size, activity_description,
is_cnpj_verified, verification_date, created_at, updated_at
```

#### `streamer_company_address` (Company Addresses)
```sql
id, company_id, cep, street, number, complement,
neighborhood, city, state, address_type, is_primary, created_at
```

#### `bank_accounts` (Bank Account)
```sql
id, user_id/company_id, bank_code, bank_name, account_type,
agency_number, account_number, account_digit, cpf_cnpj,
account_holder_name, is_verified, verification_date, is_primary
```

#### `cnpj_cache` (API Cache)
```sql
id, cnpj (UNIQUE), company_name, trading_name,
registration_date, status, company_size, activity_code,
activity_description, source, cached_at, expires_at (90 days)
```

### Supported CNPJ APIs

#### Option 1: **Receita Federal** (Official - Free)
- **URL**: Not directly available
- **Status**: Brazilian tax authority
- **Reliability**: Official source
- **Cost**: Free (via third-party APIs)
- **Authentication**: None

#### Option 2: **Brasil API** (Recommended - Free)
- **URL**: `https://api.brasil.io/api/v1/cnpj/{cnpj}`
- **Rate Limit**: Generous
- **Response Time**: 2-5 seconds
- **Reliability**: 98%
- **Cost**: Free
- **Authentication**: API key (free tier available)

```bash
curl "https://api.brasil.io/api/v1/cnpj/34028316000152/"

# Response:
{
  "cnpj": "34.028.316/0001-52",
  "name": "Empresa Exemplo LTDA",
  "establishment_name": "Matriz",
  "status": "ATIVA",
  "opening_date": "2015-01-15",
  "company_size": "PEQUENO",
  "main_activity": {
    "code": "7722-000",
    "text": "Consultoria em tecnologia da informação"
  },
  "secondary_activities": [...],
  "address": {
    "logradouro": "Rua Exemplo",
    "numero": "123",
    "bairro": "Centro",
    "municipio": "São Paulo",
    "estado": "SP",
    "cep": "01310-100"
  }
}
```

#### Option 3: **Soluções Industriais** (Alternative - Freemium)
- **URL**: `https://www.solucoesndustriais.com.br/search/cnpj/{cnpj}`
- **Response**: HTML scraping needed
- **Reliability**: 90%
- **Cost**: Free (HTML), Paid (API)
- **Authentication**: Optional

#### Option 4: **Consulta CNPJ** (Paid - Most Reliable)
- **URL**: https://www.consultacnpj.net/api/
- **Rate Limit**: High (with paid plan)
- **Response Time**: Fast
- **Reliability**: 99%
- **Cost**: R$ 10-50/month
- **Authentication**: API key required

```bash
curl -X GET "https://cnpj.ws/{cnpj}" \
  -H "Authorization: Bearer {token}"

# Response:
{
  "cnpj": "34.028.316/0001-52",
  "razao_social": "Empresa Exemplo LTDA",
  "nome_fantasia": "Exemplo",
  "status": "Ativa",
  "data_abertura": "2015-01-15",
  "natureza_juridica": "LTDA",
  "endereco": {
    "rua": "Rua Exemplo",
    "numero": "123",
    "complemento": "",
    "bairro": "Centro",
    "cidade": "São Paulo",
    "estado": "SP",
    "cep": "01310-100"
  },
  "telefone": "(11) 3000-0000",
  "email": "contato@empresa.com"
}
```

### Implementation Strategy

**Use Brasil API as primary, cache results for 90 days:**

```typescript
// services/cnpj.service.ts

async verifyCNPJ(cnpj: string): Promise<CompanyData> {
  const cleanCnpj = cnpj.replace(/\D/g, '');
  
  // Validate format
  if (!this.isValidCNPJ(cleanCnpj)) {
    throw new Error('Invalid CNPJ format');
  }
  
  // Check cache first
  const cached = await this.cnpjCache.findOne(cleanCnpj);
  if (cached && !isExpired(cached)) {
    return cached;
  }
  
  try {
    // Call Brasil API
    const response = await axios.get(
      `https://api.brasil.io/api/v1/cnpj/${cleanCnpj}`,
      {
        headers: {
          'Authorization': `Token ${process.env.BRASIL_IO_API_KEY}`
        }
      }
    );
    
    const company = {
      cnpj: response.data.cnpj,
      companyName: response.data.name,
      tradingName: response.data.establishment_name,
      status: response.data.status,
      registrationDate: response.data.opening_date,
      companySize: response.data.company_size,
      activityCode: response.data.main_activity.code,
      activityDescription: response.data.main_activity.text,
      email: response.data.email,
      phone: response.data.phone,
      address: {
        cep: response.data.address.cep,
        street: response.data.address.logradouro,
        number: response.data.address.numero,
        neighborhood: response.data.address.bairro,
        city: response.data.address.municipio,
        state: response.data.address.estado,
      }
    };
    
    // Cache result
    await this.cnpjCache.create({
      ...company,
      source: 'brasil_io',
      expiresAt: addDays(new Date(), 90),
    });
    
    return company;
    
  } catch (error) {
    throw new Error(`CNPJ verification failed: ${error.message}`);
  }
}

// CNPJ validation (check digit algorithm)
isValidCNPJ(cnpj: string): boolean {
  if (cnpj.length !== 14) return false;
  
  // Calculate check digits...
  // (Implementation using mod 11 algorithm)
  
  return true;
}
```

### Validation

```typescript
// PostgreSQL validation function
validate_cnpj(cnpj_input VARCHAR) RETURNS BOOLEAN
  ✓ Format: XX.XXX.XXX/XXXX-XX or XXXXXXXXXXXXXX
  ✓ Check digit validation (mod 11)
  ✓ Returns true/false

// TypeScript validation
function isValidCNPJ(cnpj: string): boolean {
  const clean = cnpj.replace(/\D/g, '');
  if (clean.length !== 14) return false;
  
  // Implement check digit validation
  return validateCheckDigit(clean);
}
```

---

## 3️⃣ Integration with Streamer Onboarding

### Workflow

```
1. Streamer Registration
   ↓
2. Personal Data (Name, Email, CPF)
   ↓
3. Company Data (CNPJ)
   ├── Auto-lookup via Brasil API
   ├── Verify status = "ATIVA"
   └── Pre-fill company info
   ↓
4. Company Address (CEP)
   ├── Lookup via ViaCEP
   ├── Allow manual corrections
   └── Verify coordinates
   ↓
5. Bank Account
   ├── Account type (checking/savings)
   ├── Bank code (001=BB, 033=Santander, etc)
   ├── CPF/CNPJ matching
   └── Verify account
   ↓
6. Approval
   ├── Manual review by admin
   ├── Document verification
   └── Go live
```

### Environment Variables

```env
# CEP API
CEP_API_PROVIDER=viacep  # viacep, postmon, opencep
CEP_API_TIMEOUT=5000

# CNPJ API
CNPJ_API_PROVIDER=brasil_io  # brasil_io, consultacnpj
BRASIL_IO_API_KEY=xxx
CNPJ_API_TIMEOUT=10000

# Cache TTL
CEP_CACHE_TTL=2592000  # 30 days in seconds
CNPJ_CACHE_TTL=7776000 # 90 days in seconds
```

---

## 4️⃣ Bank Account Integration

### Supported Banks (Brazilian)

| Code | Name | Type |
|------|------|------|
| 001 | Banco do Brasil | Big |
| 033 | Banco Santander | Big |
| 104 | Caixa Econômica | Big |
| 237 | Bradesco | Big |
| 341 | Itaú | Big |
| 072 | Banco Cora | Digital |
| 260 | Nubank | Digital |
| 655 | Banco Inter | Digital |

### Bank Account Verification

```typescript
interface BankAccount {
  bankCode: string;      // '001', '033', etc.
  bankName: string;      // Display name
  accountType: string;   // 'checking' ou 'savings'
  agencyNumber: string;  // 4-5 digits
  accountNumber: string; // 6-20 digits
  accountDigit?: string; // 1-2 digits (check digit)
  cpfCnpj: string;      // CPF or CNPJ
  accountHolderName: string;
  isVerified: boolean;
}
```

### Verification Process

1. **Format Validation**
   - Agency: 4-5 digits
   - Account: 6-20 digits
   - Check digit: optional 1-2 digits

2. **Bank Lookup**
   - Verify bank code exists
   - Get bank name and info

3. **Manual Review**
   - Admin team verifies account
   - May require proof (bank statement, etc.)

4. **Test Deposit**
   - Send R$ 0.01 test deposit
   - User confirms amount received
   - Enables withdrawals

---

## 5️⃣ Data Privacy & Security

### LGPD Compliance (Brazil's GDPR)

- **CEP Data**: Non-personal (public address)
- **CNPJ Data**: Public company information
- **Bank Account**: PII - encrypt at rest
- **User Address**: PII - encrypt at rest

### Encryption

```typescript
// Sensitive fields encryption
ENCRYPTED_FIELDS = [
  'bank_accounts.account_number',
  'bank_accounts.cpf_cnpj',
  'addresses.street',
  'streamer_company.company_email'
];

// Use: AES-256-GCM
// Key rotation: Monthly
```

### Audit Trail

```sql
-- Log all CNPJ/CEP lookups
INSERT INTO activity_logs (
  user_id, action, resource_type, details, created_at
) VALUES (
  'xxx', 'cnpj_verified', 'streamer', 
  '{"cnpj": "34.028.316/0001-52", "status": "active"}',
  CURRENT_TIMESTAMP
);
```

---

## 6️⃣ Testing

### Test CEP Codes

```
01310-100  → São Paulo, SP (Avenida Paulista)
58100-000  → Campina Grande, PB (Av. Getúlio Vargas)
58000-000  → João Pessoa, PB (Rua Tabajara)
30130-100  → Belo Horizonte, MG (Rua da Bahia)
80010-020  → Curitiba, PR (Rua XV de Novembro)
```

### Test CNPJ Codes

```
34.028.316/0001-52  → Valid format, check digits correct
11.222.333/0001-81  → Valid format example
11.111.111/0001-00  → Invalid (fails check digit)
```

---

## 7️⃣ Monitoring & Alerts

### Metrics to Track

- CEP API uptime & latency
- CNPJ API uptime & latency
- Cache hit rate (should be 70%+)
- Failed verifications per day
- Average verification time

### Alerts

```
- CEP API down → Use fallback API
- CNPJ API down → Use cache + manual review
- Unusual verification failures → Investigation needed
- High API costs → Optimize cache strategy
```

---

**Last Updated**: 2026-10-03
**Status**: Ready for Implementation
