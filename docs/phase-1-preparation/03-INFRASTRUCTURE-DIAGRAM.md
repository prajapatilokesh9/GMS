# Phase 1 — Infrastructure Architecture Diagram

**Reference:** FITCORE PRO BLUEPRINT — Infrastructure & Operations  
**Scope:** Phase 1 only — Monorepo, CI/CD, Docker, PostgreSQL, Redis, AWS (minimal)  
**Estimated monthly cost:** ~$186/mo

---

## 1. LOCAL DEVELOPMENT ARCHITECTURE

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        LOCAL DEVELOPMENT (Docker Desktop)                 │
│                                                                          │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐  │
│  │  Backend    │    │   Web      │    │  Mobile    │    │   AI/ML    │  │
│  │  NestJS     │    │  Next.js   │    │  Expo Go   │    │  FastAPI   │  │
│  │  :3000      │    │  :3001     │    │  Device    │    │  :8000     │  │
│  └──────┬─────┘    └─────┬──────┘    └────────────┘    └──────┬──────┘  │
│         │                │                                      │        │
│         └────────────────┼──────────────────────────────────────┘        │
│                          │                                              │
│                         ┌▼──────────────┐                               │
│                         │  Docker       │                               │
│                         │  Compose      │                               │
│                         │  Network      │                               │
│                         └──────┬───────┘                               │
│                          │              │                               │
│                         ┌▼─────┐     ┌──▼────┐                         │
│                         │ PG16 │     │Redis 7│                         │
│                         │:5432 │     │:6379  │                         │
│                         └──────┘     └───────┘                         │
│                                                                          │
│  Volumes:                                                                 │
│  ├── pgdata (persistent PostgreSQL)                                      │
│  └── redis-data (persistent Redis)                                       │
└──────────────────────────────────────────────────────────────────────────┘
```

## 2. STAGING ARCHITECTURE

```
                              ┌──────────────┐
                              │  CloudFlare   │
                              │  CDN + DNS    │
                              │  *.fitcore.app│
                              └──────┬───────┘
                                     │
                              ┌──────┴───────┐
                              │  AWS ALB     │
                              │  HTTPS 443   │
                              │  SSL Term    │
                              └──────┬───────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
         ┌────┴────┐          ┌─────┴─────┐          ┌─────┴─────┐
         │ ECS     │          │ ECS       │          │ CloudFront │
         │ Fargate │          │ Fargate   │          │ + S3       │
         │ Backend │          │ Web       │          │ Assets     │
         │ 1-2 cnt │          │ 1 cnt     │          │            │
         └────┬────┘          └───────────┘          └───────────┘
              │
    ┌─────────┼────────────┐
    │         │            │
┌───┴───┐ ┌───┴───┐   ┌───┴────┐
│ RDS   │ │Redis  │   │ S3     │
│ PG16  │ │Cache  │   │ Media  │
│ 20GB  │ │512MB  │   │ 50GB   │
│ Multi-│ │Single │   │        │
│ AZ: No│ │       │   │        │
└───────┘ └───────┘   └────────┘
```

## 3. AWS RESOURCE MAP (Phase 1 Staging)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           AWS ap-south-1 (Mumbai)                        │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  VPC: 10.0.0.0/16                                               │   │
│  │                                                                  │   │
│  │  ┌─────────────────────┐    ┌─────────────────────┐             │   │
│  │  │  Public Subnet 1    │    │  Public Subnet 2    │             │   │
│  │  │  10.0.1.0/24 (1a)   │    │  10.0.2.0/24 (1b)   │             │   │
│  │  │                     │    │                     │             │   │
│  │  │  ┌───────────────┐  │    │  ┌───────────────┐  │             │   │
│  │  │  │  ALB          │  │    │  │  ALB          │  │             │   │
│  │  │  │  (Cross-zone) │  │    │  │  (Cross-zone) │  │             │   │
│  │  │  └───────────────┘  │    │  └───────────────┘  │             │   │
│  │  │                     │    │                     │             │   │
│  │  │  ┌───────────────┐  │    │  ┌───────────────┐  │             │   │
│  │  │  │  ECS Fargate  │  │    │  │  ECS Fargate  │  │             │   │
│  │  │  │  Backend:3000 │  │    │  │  Backend:3000 │  │             │   │
│  │  │  │  Web:3001     │  │    │  │  Web:3001     │  │             │   │
│  │  │  └───────────────┘  │    │  └───────────────┘  │             │   │
│  │  └─────────────────────┘    └─────────────────────┘             │   │
│  │                                                                  │   │
│  │  ┌─────────────────────┐    ┌─────────────────────┐             │   │
│  │  │  Private Subnet 1   │    │  Private Subnet 2   │             │   │
│  │  │  10.0.3.0/24 (1a)   │    │  10.0.4.0/24 (1b)   │             │   │
│  │  │                     │    │                     │             │   │
│  │  │  ┌───────────────┐  │    │  ┌───────────────┐  │             │   │
│  │  │  │  RDS PostgreSQL│  │    │  │  RDS PostgreSQL│  │             │   │
│  │  │  │  db.t3.medium  │  │    │  │  (standby)    │  │             │   │
│  │  │  │  (primary)     │  │    │  │  (Phase 3+)   │  │             │   │
│  │  │  └───────────────┘  │    │  └───────────────┘  │             │   │
│  │  │                     │    │                     │             │   │
│  │  │  ┌───────────────┐  │    │                     │             │   │
│  │  │  │  ElastiCache  │  │    │                     │             │   │
│  │  │  │  Redis 7      │  │    │                     │             │   │
│  │  │  │  cache.t3.micro│  │    │                     │             │   │
│  │  │  └───────────────┘  │    │                     │             │   │
│  │  └─────────────────────┘    └─────────────────────┘             │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Supporting Services                                              │   │
│  │                                                                  │   │
│  │  ┌─────────────────────────────┐  ┌─────────────────────────┐   │   │
│  │  │  ECR (Container Registry)  │  │  S3 (Assets + Backups)  │   │   │
│  │  │  - fitcore/backend         │  │  - media/               │   │   │
│  │  │  - fitcore/web             │  │  - backups/             │   │   │
│  │  └─────────────────────────────┘  └─────────────────────────┘   │   │
│  │                                                                  │   │
│  │  ┌─────────────────────────────┐  ┌─────────────────────────┐   │   │
│  │  │  CloudWatch Logs            │  │  AWS Secrets Manager    │   │   │
│  │  │  - /ecs/backend            │  │  - DATABASE_URL         │   │   │
│  │  │  - /ecs/web                │  │  - JWT_PRIVATE_KEY      │   │   │
│  │  └─────────────────────────────┘  │  - RAZORPAY_KEY        │   │   │
│  │                                   └─────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## 4. AWS RESOURCE SPECIFICATIONS (Phase 1)

| Resource | Spec | Cost/Month | Notes |
|----------|------|-----------|-------|
| **VPC** | 2 public + 2 private subnets, NAT Gateway (1) | ~$32 | Single NAT to save cost; HA in Phase 2 |
| **ALB** | 1 Application Load Balancer, idle timeout 60s | ~$22 | Handles HTTP/HTTPS traffic |
| **ECS Fargate (Backend)** | 0.25 vCPU, 0.5GB RAM × 2 tasks, auto-scale (1-4) | ~$35 | Min 2 for HA; auto-scales up |
| **ECS Fargate (Web)** | 0.25 vCPU, 0.5GB RAM × 1 task (non-critical) | ~$12 | Single task; HA in Phase 2 |
| **RDS PostgreSQL** | db.t3.medium (2 vCPU, 4GB RAM), 20GB gp3, single-AZ | ~$50 | Multi-AZ in Phase 2 |
| **ElastiCache Redis** | cache.t3.micro (1 vCPU, 0.5GB RAM), single node | ~$15 | Cluster mode in Phase 3 |
| **S3 Standard** | 50GB (assets + logs + backups) | ~$5 | Lifecycle policy for old logs |
| **ECR** | 2 repos, minimal storage | ~$1 | Image scan on push |
| **CloudWatch Logs** | 5GB ingest/month | ~$5 | Keep 30 days, then S3 |
| **Secrets Manager** | 5 secrets | ~$2 | JWT key, DB URL, API keys |
| **CloudFront** | CDN for S3 assets (optional) | ~$7 | Only if needed for media |
| **NAT Gateway** | 1 × hourly + data | ~$32 | Required for private subnets |
| **Total** | | **~$186/mo** | |

## 5. CI/CD PIPELINE ARCHITECTURE

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  PR      │    │  Push    │    │  Merge   │    │  Tag     │
│  Created │───►│  to main │───►│  to main │───►│  v*.*.*  │
└────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │               │               │
     ▼               ▼               ▼               ▼
┌─────────┐   ┌──────────┐    ┌──────────┐    ┌──────────┐
│  ci.yml │   │  ci.yml  │    │cd-staging│    │cd-staging│
│         │   │          │    │   .yml   │    │   + tag  │
├─────────┤   ├──────────┤    ├──────────┤    ├──────────┤
│ lint    │   │ lint     │    │ lint     │    │ lint     │
│ type    │   │ type     │    │ type     │    │ type     │
│ test    │   │ test     │    │ test     │    │ test     │
│ build   │   │ build    │    │ build    │    │ build    │
└─────────┘   │ deploy   │    │ deploy   │    │ deploy   │
              │ staging  │    │ staging  │    │ staging  │
              └──────────┘    │ e2e      │    │ e2e      │
                              └──────────┘    │ deploy   │
                                              │ production│
                                              └──────────┘
```

## 6. NETWORK SECURITY

```
Security Group Rules (Phase 1):

┌─────────────────────────────────────────────────────────────────────────┐
│ ALB Security Group                                                      │
├─────────────────────────────────────────────────────────────────────────┤
│ Inbound: 443 (HTTPS) from 0.0.0.0/0                                     │
│ Inbound: 80 (HTTP) from 0.0.0.0/0 → redirect to 443                    │
│ Outbound: 3000 → Backend ECS SG                                         │
│ Outbound: 3001 → Web ECS SG                                             │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ Backend ECS Security Group                                              │
├─────────────────────────────────────────────────────────────────────────┤
│ Inbound: 3000 from ALB SG                                               │
│ Outbound: 5432 → RDS SG                                                │
│ Outbound: 6379 → Redis SG                                              │
│ Outbound: 443 → 0.0.0.0/0 (external API calls: Razorpay, Twilio)       │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ RDS Security Group                                                      │
├─────────────────────────────────────────────────────────────────────────┤
│ Inbound: 5432 from Backend ECS SG                                       │
│ Inbound: 5432 from DevOps bastion IP (restricted)                       │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ Redis Security Group                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│ Inbound: 6379 from Backend ECS SG                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

## 7. DOCKER COMPOSE (Local Development)

```yaml
# docker-compose.yml — Phase 1
version: '3.8'

services:
  postgres:
    image: postgis/postgis:16-3.4
    container_name: fitcore-postgres
    environment:
      POSTGRES_USER: fitcore
      POSTGRES_PASSWORD: fitcore_dev
      POSTGRES_DB: fitcore_dev
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U fitcore"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: fitcore-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
  redis-data:
```

## 8. ENVIRONMENT VARIABLES MAP (Phase 1)

| Variable | Source | Used By | Phase 1 Value |
|----------|--------|---------|--------------|
| `NODE_ENV` | env | All | `development` / `staging` / `production` |
| `PORT` | env | Backend | `3000` |
| `DATABASE_URL` | Secret | Backend | `postgres://fitcore:fitcore_dev@localhost:5432/fitcore_dev` |
| `DATABASE_POOL_SIZE` | env | Backend | `10` |
| `REDIS_URL` | env | Backend | `redis://localhost:6379/0` |
| `JWT_SECRET` | Secret | Backend | Dev-only random; staging/prod in Secrets Manager |
| `JWT_EXPIRY` | env | Backend | `24h` |
| `REFRESH_TOKEN_EXPIRY` | env | Backend | `30d` |
| `RAZORPAY_KEY` | Secret | Backend | Test key (stubbed in Phase 1) |
| `RAZORPAY_SECRET` | Secret | Backend | Test secret (stubbed in Phase 1) |
| `TWILIO_ACCOUNT_SID` | Secret | Backend | Stubbed |
| `TWILIO_AUTH_TOKEN` | Secret | Backend | Stubbed |
| `GOOGLE_OAUTH_CLIENT_ID` | Secret | Backend | Dev Google OAuth app |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Secret | Backend | Dev Google OAuth app |
| `APP_URL` | env | Backend | `http://localhost:3000` |
| `WEB_URL` | env | Web | `http://localhost:3001` |

---

*End of Phase 1 Infrastructure Architecture*
