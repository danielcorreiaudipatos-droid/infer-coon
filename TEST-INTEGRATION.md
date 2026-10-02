# ADS Inteligente - Integration Tests Guide

## Test Suite Overview

```
📋 Test Coverage:
├── Unit Tests (APIs, Integrations)
├── Integration Tests (Multi-platform sync)
├── Optimizer Tests (IA suggestions)
├── Webhook Tests (Event handlers)
├── Docker Tests (Container health)
└── API Tests (Endpoints)
```

## Running Tests

### 1. Install Test Dependencies
```bash
cd ads-backend
pip install -r requirements.txt
```

### 2. Run All Tests
```bash
pytest -v
```

### 3. Run Specific Test Suite
```bash
# Integration tests only
pytest tests/test_integrations.py -v

# API tests
pytest tests/test_api.py -v

# Optimizer tests
pytest tests/test_optimizer.py -v

# Webhook tests
pytest tests/test_webhooks.py -v

# Docker tests
pytest tests/test_docker.py -v
```

### 4. Run with Coverage
```bash
pytest --cov=. --cov-report=html
# Opens coverage report in htmlcov/index.html
```

### 5. Run Docker Integration Tests
```bash
# Start docker-compose first
docker-compose up -d

# Run Docker tests
pytest tests/test_docker.py -v

# Health check
curl http://localhost:8000/health
```

## Test Categories

### API Integrations (test_integrations.py)
✅ Google Ads API
- get_campaigns()
- get_campaign_performance()
- update_campaign_budget()
- pause_campaign()

✅ Meta Ads API
- get_campaigns()
- get_campaign_insights()
- update_campaign_budget()
- create_audience()

✅ LinkedIn Ads API
- get_campaigns()
- get_campaign_analytics()
- update_campaign_budget()
- pause_campaign()

✅ Coordinator (Multi-platform)
- get_campaigns_all_platforms()
- get_performance_all_platforms()
- update_budgets()
- pause_campaigns()

### IA Optimizer (test_optimizer.py)
✅ Gemini Analysis
- analyze_campaign() → 3 suggestions
- generate_copy() → 5 ad variations
- optimization_pipeline()

### Webhooks (test_webhooks.py)
✅ Event Handlers
- POST /webhooks/google
- POST /webhooks/meta
- POST /webhooks/linkedin
- Event processing & validation

### API Endpoints (test_api.py)
✅ Core Endpoints
- GET /health
- GET /campaigns
- GET /campaigns/{id}/performance
- GET /optimize/suggestions
- POST /campaigns/{id}/budget
- POST /campaigns/{id}/pause

✅ Auth Endpoints
- POST /auth/google
- POST /auth/meta
- POST /auth/linkedin

### Docker Health (test_docker.py)
✅ Container Checks
- Backend container health
- Frontend availability
- Database connectivity
- docker-compose validation

## Expected Test Results

```
Platform API Tests:
  Google Ads:     ✅ PASS
  Meta Ads:       ✅ PASS
  LinkedIn Ads:   ✅ PASS
  Coordinator:    ✅ PASS

IA Optimizer Tests:
  Campaign Analysis:  ✅ PASS
  Copy Generation:    ✅ PASS
  Optimization Flow:  ✅ PASS

Webhook Tests:
  Google Handler:     ✅ PASS
  Meta Handler:       ✅ PASS
  LinkedIn Handler:   ✅ PASS

API Endpoint Tests:
  Health Check:       ✅ PASS
  Campaign List:      ✅ PASS
  Performance:        ✅ PASS
  Suggestions:        ✅ PASS
  Budget Update:      ✅ PASS
  Campaign Pause:     ✅ PASS

Docker Tests:
  Backend Health:     ✅ PASS
  Frontend Health:    ✅ PASS
  DB Connectivity:    ✅ PASS
```

## CI/CD Integration

Tests run automatically on:
- Pull requests (GitHub Actions)
- Push to main branch
- Daily scheduled runs

## Coverage Goals

```
Target Coverage: 80%+
  - Integrations: 85%
  - Optimizer: 80%
  - Webhooks: 75%
  - API: 90%
```

## Debugging Failed Tests

### Common Issues

1. **Database Connection Error**
   ```bash
   # Check database is running
   docker-compose ps
   
   # Restart services
   docker-compose down && docker-compose up
   ```

2. **API Timeout**
   ```bash
   # Check backend is healthy
   curl http://localhost:8000/health
   ```

3. **Mock Issues**
   ```bash
   # Ensure unittest.mock is properly imported
   from unittest.mock import patch, MagicMock
   ```

4. **Import Errors**
   ```bash
   # Reinstall dependencies
   pip install -r requirements.txt --force-reinstall
   ```

## Next Steps

After passing all tests:
1. ✅ Code review (merge to main)
2. ✅ Deploy to staging
3. ✅ Load testing (simulated campaigns)
4. ✅ Beta user testing
5. ✅ Production deployment
