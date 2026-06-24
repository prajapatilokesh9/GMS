# Phase 0 Foundation — Technical Dependencies & Infrastructure Requirements
## Third-Party Services, Infrastructure & DevOps

**Reference:** FITCORE PRO BLUEPRINT — Technology Stack, Infrastructure & Operations
**Version:** 1.0 | **Date:** June 2026

---

## 1. EXTERNAL SERVICE DEPENDENCIES (Complete)

### 1.1 Payments & Financial

| Service | Purpose | Plan Level | Monthly Cost (Est.) | Phase Required | API Docs |
|---------|---------|-----------|-------------------|---------------|----------|
| **Razorpay** | India payments (UPI, cards, wallets, EMI) | Standard (2%) | Variable (2% per txn) | Phase 1 | https://razorpay.com/docs/api/ |
| **Stripe** | International payments (Visa, MC, ACH) | Standard (2.9% + $0.30) | Variable | Phase 2 | https://stripe.com/docs/api |
| **Avalara** (future) | Tax calculation engine (GST) | Enterprise | $500/mo | Phase 4 | https://developer.avalara.com/ |

### 1.2 Communication & Notifications

| Service | Purpose | Plan Level | Monthly Cost (Est.) | Phase Required | API Docs |
|---------|---------|-----------|-------------------|---------------|----------|
| **Twilio** | SMS (OTP, transactional, alerts) | Pay-as-you-go | ₹0.35/SMS → ~₹10K/mo at scale | Phase 1 | https://www.twilio.com/docs/sms |
| **SendGrid / AWS SES** | Email (welcome, invoice, reminders, marketing) | Free (100/day) → Essentials ($19.95/mo) | $0-20/mo | Phase 1 | https://docs.sendgrid.com/ |
| **Firebase Cloud Messaging** | Push notifications (iOS + Android) | Free (Spark plan) | $0 (up to 1M sends/mo) | Phase 1 | https://firebase.google.com/docs/cloud-messaging |
| **Gupshup / WhatsApp Business API** | WhatsApp messaging (high-delivery templates) | Conversation-based | ₹0.50-1.00/conversation | Phase 2 | https://docs.gupshup.io/ |

### 1.3 Authentication

| Service | Purpose | Plan Level | Monthly Cost (Est.) | Phase Required | API Docs |
|---------|---------|-----------|-------------------|---------------|----------|
| **Google OAuth 2.0** | Google login | Free | $0 | Phase 1 | https://developers.google.com/identity/protocols/oauth2 |
| **Apple Sign In** | Apple login | Free | $0 (requires Apple Developer $99/yr) | Phase 1 | https://developer.apple.com/sign-in-with-apple/ |

### 1.4 Maps & Location

| Service | Purpose | Plan Level | Monthly Cost (Est.) | Phase Required | API Docs |
|---------|---------|-----------|-------------------|---------------|----------|
| **Google Maps Platform** | Maps, Places API, Geocoding, Directions | Pay-as-you-go | $200/mo free credit → ~$50-300/mo | Phase 1 | https://developers.google.com/maps |
| **OpenStreetMap** (fallback) | Alternative mapping | Free | $0 | Phase 1 | https://wiki.openstreetmap.org/ |

### 1.5 Video & Communication

| Service | Purpose | Plan Level | Monthly Cost (Est.) | Phase Required | API Docs |
|---------|---------|-----------|-------------------|---------------|----------|
| **Agora.io** | Video consultations (low latency) | Pay-as-you-go | $0-200/mo (10K mins free) | Phase 3 | https://docs.agora.io/en/ |
| **Jitsi** | Self-hosted open-source video | Free (self-hosted) | Infrastructure cost only | Phase 2 | https://jitsi.github.io/handbook/ |

### 1.6 Wellness & Health

| Service | Purpose | Plan Level | Monthly Cost (Est.) | Phase Required | API Docs |
|---------|---------|-----------|-------------------|---------------|----------|
| **Apple HealthKit** | Sync workouts, steps, vitals from iPhone | Free | $0 | Phase 3 | https://developer.apple.com/healthkit/ |
| **Google Fit REST API** | Sync data from Android | Free | $0 (quota: 50K req/day) | Phase 3 | https://developers.google.com/fit/rest |

### 1.7 Biometric Devices

| Device Vendor | Integration Type | Phase Required | Documentation |
|--------------|-----------------|---------------|---------------|
| **Suprema (BioStar 2)** | REST API + SDK | Phase 2 | https://www.supremainc.com/en/support/technical-document |
| **ZKTeco (ZKAccess)** | Push protocol + SDK | Phase 2 | https://www.zkteco.com/en/service/download |
| **HikVision** | ISAPI + SDK | Phase 2 | https://www.hikvision.com/en/support/ |

### 1.8 SEO & Marketing

| Service | Purpose | Plan Level | Monthly Cost (Est.) | Phase Required | API Docs |
|---------|---------|-----------|-------------------|---------------|----------|
| **Google My Business API** | Sync gym hours, photos, offers | Free | $0 | Phase 2 | https://developers.google.com/my-business |
| **Google Analytics 4** | Web + app analytics | Free | $0 | Phase 1 | https://developers.google.com/analytics |
| **Google Search Console** | SEO monitoring | Free | $0 | Phase 1 | https://developers.google.com/webmaster-tools |
| **Schema.org** | Structured data markup | Free | $0 | Phase 1 | https://schema.org/SportsActivityLocation |

### 1.9 Monitoring & Error Tracking

| Service | Purpose | Plan Level | Monthly Cost (Est.) | Phase Required | API Docs |
|---------|---------|-----------|-------------------|---------------|----------|
| **Sentry** | Error tracking (backend + frontend) | Team ($26/mo) | $26-100/mo | Phase 1 | https://docs.sentry.io/ |
| **Prometheus + Grafana** | Infrastructure metrics & dashboards | Self-hosted (OSS) | Infrastructure cost | Phase 2 | https://prometheus.io/docs/ |
| **Datadog** (future) | APM, logs, infrastructure monitoring | Pro ($15/host/mo) | $150-500/mo | Phase 4 | https://docs.datadoghq.com/ |

### 1.10 Development & CI/CD

| Service | Purpose | Plan Level | Monthly Cost (Est.) | Phase Required | API Docs |
|---------|---------|-----------|-------------------|---------------|----------|
| **GitHub** | Source control, issues, PRs | Free (unlimited repos) | $0 | Phase 1 | https://docs.github.com/ |
| **GitHub Actions** | CI/CD pipelines | Free (2000 min/mo) → Team ($4/user/mo) | $0-24/mo | Phase 1 | https://docs.github.com/en/actions |
| **Snyk** | Dependency vulnerability scanning | Free (200 tests/mo) → Team ($25/mo) | $0-25/mo | Phase 1 | https://docs.snyk.io/ |
| **Docker** | Containerisation | Free (Docker Desktop) | $0 | Phase 1 | https://docs.docker.com/ |

### 1.11 Cloud Infrastructure

| Service | Purpose | Pricing Model | Monthly Cost (Est.) | Phase Required |
|---------|---------|---------------|-------------------|---------------|
| **AWS EKS** | Kubernetes cluster (managed) | Per cluster ($73/mo) + node costs | $150-500/mo (dev) | Phase 2 |
| **AWS RDS (PostgreSQL)** | Managed database | Pay-per-instance | $50-200/mo (db.t3.medium) | Phase 1 |
| **AWS ElastiCache (Redis)** | Cache + message queue | Pay-per-node | $30-100/mo (cache.t3.small) | Phase 1 |
| **AWS S3** | File storage (images, backups) | Pay-per-GB | $5-50/mo | Phase 1 |
| **CloudFlare** | CDN, DNS, DDoS protection, WAF | Pro ($20/mo) | $20-200/mo | Phase 1 |
| **Vercel** (optional) | Next.js hosting | Pro ($20/mo) | $20/mo | Phase 1 |

---

## 2. INFRASTRUCTURE ARCHITECTURE (Phase 1 — MVP)

```
                               ┌──────────────┐
                               │  CloudFlare   │
                               │  CDN + DNS    │
                               └──────┬───────┘
                                      │
                         ┌────────────┴────────────┐
                         │   AWS ALB (Load Balancer)│
                         └────────────┬────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
        ┌─────┴─────┐          ┌──────┴──────┐        ┌──────┴──────┐
        │  Backend   │          │    Web      │        │   Assets    │
        │  (ECS Fargate)       │  (Vercel/   │        │   (S3 +     │
        │  API: 1 container    │   ECS)      │        │   CloudFront)│
        │  min, 3 max          │             │        │             │
        └─────┬─────┘          └─────────────┘        └─────────────┘
              │
    ┌─────────┼────────────┐
    │         │            │
┌───┴───┐ ┌───┴───┐   ┌───┴────┐
│ RDS   │ │Redis  │   │ S3     │
│ PG16  │ │Cache  │   │ Media  │
└───────┘ └───────┘   └────────┘
```

### Phase 1 Infrastructure Specs

| Component | Spec | Cost/Month |
|-----------|------|-----------|
| **RDS PostgreSQL** | db.t3.medium (2 vCPU, 4GB RAM), 50GB gp3, Multi-AZ disabled (dev) | ~$60 |
| **ElastiCache Redis** | cache.t3.micro (1 vCPU, 0.5GB RAM), single node | ~$15 |
| **ECS Fargate (Backend)** | 0.25 vCPU, 0.5GB RAM × 2 tasks (min), auto-scale to 4 | ~$40 |
| **S3 Standard** | 50GB storage + request costs | ~$5 |
| **CloudFlare Pro** | CDN + WAF + DNS | $20 |
| **Sentry Team** | Error tracking | $26 |
| **Vercel Pro** (if used) | Frontend hosting | $20 |
| **Total Estimated** | | **~$186/mo** |

### Phase 4 Target Infrastructure

| Component | Spec | Cost/Month |
|-----------|------|-----------|
| **RDS PostgreSQL** | db.r6g.large (2 vCPU, 16GB RAM), 200GB gp3, Multi-AZ, read replica | ~$400 |
| **ElastiCache Redis (Cluster)** | cache.r6g.large × 3 nodes | ~$300 |
| **EKS Cluster** | 3 × t3.medium worker nodes + cluster fee | ~$250 |
| **ClickHouse (Self-hosted on EC2)** | m6i.large (2 vCPU, 8GB RAM), 100GB EBS | ~$90 |
| **Elasticsearch** | t3.medium (2 vCPU, 4GB RAM), 100GB EBS | ~$70 |
| **S3 + CloudFront** | 500GB storage + CDN | ~$30 |
| **CloudFlare Business** | CDN + WAF + DDoS + Bot Management | $200 |
| **Datadog Pro** | 10 hosts × $15 | $150 |
| **Total Estimated** | | **~$1,490/mo** |

---

## 3. SOFTWARE DEPENDENCIES (npm/pip)

### Backend (Node.js/NestJS) — Key Packages

```json
{
  "@nestjs/core": "^10.x",
  "@nestjs/axios": "^3.x",
  "@nestjs/config": "^3.x",
  "@nestjs/jwt": "^10.x",
  "@nestjs/passport": "^10.x",
  "@nestjs/schedule": "^4.x",
  "@nestjs/throttler": "^5.x",
  "@prisma/client": "^5.x",
  "passport": "^0.7.x",
  "passport-jwt": "^4.x",
  "passport-google-oauth20": "^2.x",
  "passport-apple": "^2.x",
  "bcryptjs": "^2.4.x",
  "zod": "^3.x",
  "rxjs": "^7.x",
  "socket.io": "^4.x",
  "ioredis": "^5.x",
  "bullmq": "^5.x",
  "razorpay": "^2.x",
  "stripe": "^14.x",
  "twilio": "^4.x",
  "@sendgrid/mail": "^7.x",
  "firebase-admin": "^11.x",
  "@googlemaps/google-maps-services-js": "^3.x",
  "agora-access-token": "^2.x",
  "helmet": "^7.x",
  "compression": "^1.7.x",
  "pino": "^8.x",
  "swagger-ui-express": "^5.x",
  "@nestjs/swagger": "^7.x",
  "csv-stringify": "^6.x",
  "exceljs": "^4.x",
  "luxon": "^3.x"
}
```

### AI/ML (Python/FastAPI) — Key Packages

```txt
fastapi==0.104.*
uvicorn[standard]==0.24.*
pydantic==2.*
numpy==1.26.*
pandas==2.1.*
scikit-learn==1.3.*
xgboost==2.0.*
lightgbm==4.*
torch==2.1.*
transformers==4.35.*
optuna==3.*
mlflow==2.8.*
joblib==1.3.*
redis==5.*
httpx==0.25.*
python-dotenv==1.*
```

### Frontend (Web — Next.js) — Key Packages

```json
{
  "next": "^14.x",
  "react": "^18.x",
  "react-dom": "^18.x",
  "@tanstack/react-query": "^5.x",
  "zustand": "^4.x",
  "axios": "^1.x",
  "react-hook-form": "^7.x",
  "zod": "^3.x",
  "@hookform/resolvers": "^3.x",
  "tailwindcss": "^3.x",
  "recharts": "^2.x",
  "react-leaflet": "^4.x",
  "leaflet": "^1.x",
  "framer-motion": "^10.x",
  "react-hot-toast": "^2.x",
  "date-fns": "^3.x",
  "next-intl": "^3.x",
  "@headlessui/react": "^1.x",
  "socket.io-client": "^4.x",
  "agora-rtc-sdk-ng": "^4.x",
  "zod": "^3.x"
}
```

### Mobile (React Native / Expo) — Key Packages

```json
{
  "expo": "~50.x",
  "expo-router": "^3.x",
  "react-native": "~0.73.x",
  "@tanstack/react-query": "^5.x",
  "zustand": "^4.x",
  "axios": "^1.x",
  "react-hook-form": "^7.x",
  "@react-native-google-signin/google-signin": "^11.x",
  "@invertase/react-native-apple-authentication": "^2.x",
  "react-native-maps": "^1.x",
  "expo-location": "^16.x",
  "react-native-chart-kit": "^6.x",
  "react-native-reanimated": "^3.x",
  "react-native-gesture-handler": "^2.x",
  "react-native-qrcode-svg": "^6.x",
  "expo-camera": "^14.x",
  "expo-secure-store": "^12.x",
  "react-native-health": "^1.x",
  "react-native-google-fit": "^0.x",
  "socket.io-client": "^4.x",
  "expo-notifications": "^0.x",
  "@react-native-firebase/app": "^19.x",
  "@react-native-firebase/messaging": "^19.x"
}
```

---

## 4. DEVELOPMENT TOOL REQUIREMENTS

### Local Development

| Tool | Version | Purpose | Install Guide |
|------|---------|---------|---------------|
| **Node.js** | 20 LTS | Runtime | https://nodejs.org/ |
| **npm** | 10+ | Package manager | Bundled with Node |
| **PostgreSQL** | 16 | Database (local Docker) | Docker image: postgres:16 |
| **Redis** | 7 | Cache (local Docker) | Docker image: redis:7-alpine |
| **Docker Desktop** | Latest | Container runtime | https://www.docker.com/products/docker-desktop/ |
| **VSCode** | Latest | IDE | https://code.visualstudio.com/ |
| **Postman** | Latest | API testing | https://www.postman.com/ |
| **Expo Go** | Latest | Mobile dev on device | App Store / Play Store |
| **Git** | 2.40+ | Version control | https://git-scm.com/ |
| **Python** | 3.11+ | ML service | https://www.python.org/ |
| **Terraform** | 1.6+ | IaC (Phase 2+) | https://developer.hashicorp.com/terraform |
| **kubectl** | 1.28+ | K8s CLI (Phase 2+) | https://kubernetes.io/docs/tasks/tools/ |

### VSCode Extensions (Recommended)

| Extension | Purpose |
|-----------|---------|
| ESLint | Linting |
| Prettier | Formatting |
| Prisma | Schema syntax + auto-complete |
| Tailwind CSS IntelliSense | Tailwind class autocomplete |
| Thunder Client | API testing (lightweight Postman) |
| Docker | Docker management |
| GitLens | Git history visualisation |
| Error Lens | Inline error display |
| Import Cost | Show import size |

---

## 5. SECURITY REQUIREMENTS

### Secrets Management

```yaml
# Local development: .env.local (gitignored)
# Staging/production: AWS Secrets Manager

Secrets to protect:
  - DATABASE_URL (contains credentials)
  - JWT_PRIVATE_KEY (RS256 private key)
  - RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET
  - STRIPE_SECRET_KEY
  - TWILIO_ACCOUNT_SID + AUTH_TOKEN
  - SENDGRID_API_KEY
  - FIREBASE_PRIVATE_KEY
  - GOOGLE_MAPS_API_KEY
  - AWS_ACCESS_KEY_ID + SECRET_ACCESS_KEY
```

### Environment Access Levels

| Environment | Purpose | Who Can Deploy | Data | Monitoring |
|------------|---------|---------------|------|------------|
| **dev** | Local development | All devs | Synthetic seed data | Console logs |
| **staging** | Integration testing, QA | DevOps + Backend lead | Anonymised copy of staging DB | Sentry + Grafana |
| **production** | Live users | DevOps lead (with approval) | Real customer data | Sentry + Grafana + PagerDuty |

---

## 6. NETWORK & SECURITY CONFIGURATION

### Firewall Rules

| Source | Destination | Port | Protocol | Purpose |
|--------|-------------|------|----------|---------|
| Internet | ALB | 443 | HTTPS | Public API + web traffic |
| ALB | Backend ECS | 3000 | HTTP | Internal routing |
| Backend ECS | RDS | 5432 | TCP | Database connection |
| Backend ECS | ElastiCache | 6379 | TCP | Redis connection |
| Backend ECS | Internet | 443 | HTTPS | Outbound to Razorpay, Twilio, etc. |
| DevOps IP | RDS | 5432 | TCP | Direct DB access (bastion) |

### SSL/TLS

| Certificate | Provider | Renewal | Scope |
|------------|----------|---------|-------|
| `*.fitcore.app` | CloudFlare (or AWS ACM) | Auto (90 days) | All subdomains |
| `api.fitcore.app` | CloudFlare (or AWS ACM) | Auto | API Gateway |
| Mobile app pinning | CA-signed | Annual | iOS/Android cert pinning |

---

## 7. BACKUP & DISASTER RECOVERY

| Component | Backup Frequency | Retention | RPO | RTO | Method |
|-----------|-----------------|-----------|-----|-----|--------|
| **PostgreSQL** | Daily (automated) | 30 days | 24h | 4h | RDS automated snapshots |
| **User files (S3)** | Continuous | 90 days | 0h | 1h | S3 versioning + cross-region replication |
| **Redis** | Not persisted | - | - | 1h | Rebuild from DB + lazy loading |
| **AI models** | On retrain | 5 versions | - | 2h | S3 model storage |
| **GitHub** | Continuous | Forever | - | - | Git history |

---

## 8. COMPLIANCE & DATA RESIDENCY

| Requirement | Implementation | Phase |
|-------------|---------------|-------|
| **India DPDP Act 2023** | Consent mechanism, purpose limitation, 72h breach notification, data retention policy | Phase 1 (consent) + Phase 4 (full) |
| **GDPR (EU users)** | Data export, right to erasure, DPA signed, privacy policy | Phase 3 |
| **PCI-DSS** | No raw card storage (delegate to Razorpay/Stripe), tokenisation | Phase 1 |
| **Data residency** | AWS ap-south-1 (Mumbai) for India; EU/US regions for Phase 5 | Phase 1 |
| **SOC 2** | Audit logging, access controls, change management | Phase 4 |

---

## 9. MONITORING & ALERTING (Phase 1)

| Alert | Condition | Channel | Responder |
|-------|-----------|---------|-----------|
| API error rate >5% | 5xx responses >5% in 5min | Slack + Email | Backend lead |
| Payment failure spike | >10% payment failures in 1h | Slack + SMS | DevOps + Payments |
| DB CPU >80% | RDS CPU >80% for 5min | Slack | DevOps |
| DB connections >100 | Too many connections | Slack | DevOps |
| Queue backlog >1000 | Unprocessed jobs | Slack | Backend lead |
| Sentry critical error | `fatal` level exception | Slack + Email | Backend lead |
| SSL certificate expiring | <30 days | Slack | DevOps |
| Disk space >85% | RDS storage | Slack | DevOps |

---

## 10. CI/CD PIPELINE DESIGN

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  PR      │    │  Push    │    │  Merge   │    │  Tag     │    │  Manual  │
│  Created │───►│  to main │───►│  to main │───►│  v*.*.*  │───►│  Deploy  │
└────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │               │               │               │
     ▼               ▼               ▼               ▼               ▼
┌─────────┐   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ lint    │   │ test     │    │ build    │    │ deploy   │    │ deploy   │
│ build   │   │ build    │    │ deploy   │    │ staging  │    │ production│
│ test    │   │ deploy   │    │ staging  │    │ e2e      │    │ canary   │
│ preview │   │ staging  │    │ e2e      │    │ tag      │    │ full     │
└─────────┘   └──────────┘    └──────────┘    └──────────┘    └──────────┘
 Environment: Environment:   Environment:    Environment:    Environment:
  Preview     Staging        Staging         Staging         Production
```

| Step | Tools | Time |
|------|-------|------|
| Lint | ESLint + Prettier | 30s |
| Type Check | TypeScript `tsc --noEmit` | 60s |
| Unit Tests | Jest | 2min |
| Build | Turborepo + Docker | 3min |
| Integration Tests | Jest + Supertest | 5min |
| Deploy Staging | ArgoCD / ECS | 3min |
| E2E Tests | Playwright / Detox | 10min |
| Deploy Production | Canary (10%) → Full | 5min |
| **Total CI** | | **~7min** |
| **Total CD (staging)** | | **~10min** |
| **Total CD (production)** | | **~15min** |

---

*End of Document — Infrastructure Dependencies v1.0*
