# ONNEWS Deployment Guide

## 📋 Deployment Architecture

```
┌─────────────────────────────────────────┐
│         CloudFlare CDN                   │
│     (Static Assets + API Caching)        │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────┴───────────────────────┐
│         Load Balancer (AWS ALB)          │
│         (SSL/TLS Termination)            │
└─────────────────┬───────────────────────┘
                  │
      ┌───────────┼───────────┐
      │           │           │
  ┌───▼───┐   ┌───▼───┐   ┌──▼────┐
  │ Pod 1  │   │ Pod 2  │   │ Pod 3 │
  │ API    │   │ API    │   │ API   │
  └───┬───┘   └───┬───┘   └──┬─────┘
      │           │          │
      └───────────┼──────────┘
                  │
          ┌───────▼────────┐
          │  RDS Aurora    │
          │ (PostgreSQL)   │
          └────────────────┘
          
      ┌────────────────────┐
      │  Redis Cache       │
      │  (Session + Data)  │
      └────────────────────┘
```

## 🌐 Staging Environment

```bash
# Deploy to Staging
./deploy/scripts/deploy-staging.sh

# Test APIs
curl https://staging-api.onnews.com/docs

# Check metrics
open https://staging-metrics.onnews.com
```

## 🏭 Production Environment

```bash
# Deploy to Production
./deploy/scripts/deploy-prod.sh

# Verify deployment
./deploy/scripts/verify-prod.sh

# Monitor
open https://monitoring.onnews.com
```

## 📊 Infrastructure as Code

- `terraform/` - AWS infrastructure
- `k8s/` - Kubernetes manifests
- `scripts/` - Deployment scripts
- `monitoring/` - Prometheus + Grafana

## ✅ Pre-deployment Checklist

- [ ] All tests passing
- [ ] Code reviewed
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] SSL certificates valid
- [ ] Backups configured
- [ ] Monitoring alerts set
- [ ] Disaster recovery plan ready
