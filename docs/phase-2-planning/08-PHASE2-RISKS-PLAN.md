# Phase 2 Risk Mitigation Plan

## Technical Risks

| # | Risk | Likelihood | Impact | Epic | Mitigation |
|---|------|-----------|--------|------|-----------|
| T1 | Payment gateway downtime (Razorpay/Stripe) | Low | Critical | E1 | Circuit breaker, idempotent APIs, retry with exponential backoff, manual fallback |
| T2 | Payment webhook delivery failure | Medium | High | E1 | Webhook signature verification, DLQ + manual reprocess, idempotency keys |
| T3 | Commission calculation errors | Medium | High | E2, E3 | Double-entry audit trail, reconciliation batch, automated alerts on mismatch >0.5% |
| T4 | Biometric device vendor SDK breaking changes | Medium | High | E8 | Adapter pattern (abstract interface), support 3+ vendors, fallback to QR/NFC |
| T5 | ML model accuracy <70% at launch | Medium | Medium | E7 | Human-in-loop validation, trainer override, offline fallback rules engine |
| T6 | Event bus overload (burst traffic) | Low | Medium | ALL | BullMQ rate limiting, queue priority (billing > training > engagement), DLQ overflow |
| T7 | Race conditions in membership expiry/renewal | Medium | High | E1 | Optimistic locking, Prisma transactions, scheduled cron with idempotent checks |

## Product Risks

| # | Risk | Likelihood | Impact | Epic | Mitigation |
|---|------|-----------|--------|------|-----------|
| P1 | Trainer off-platform deals (disintermediation) | High | Medium | E3 | Platform value: session logging, automatic reminders, client portfolio, analytics |
| P2 | Low supplement marketplace adoption | Medium | High | E2 | Pilot with 2-3 suppliers, zero-inventory model, trainer affiliate incentives |
| P3 | Nutritionist plan quality variance | Medium | Medium | E5 | Template library, AI-assisted generation, rating system, verified certifications |
| P4 | Equipment lead quality (low conversion) | Medium | Medium | E4 | Lead scoring model, gym verification, mandatory requirements capture |
| P5 | Field officer GPS fraud (fake visits) | Medium | Medium | E10 | Photo timestamp verification, random audit sampling, gym confirmation required |

## Infrastructure Risks

| # | Risk | Likelihood | Impact | Epic | Mitigation |
|---|------|-----------|--------|------|-----------|
| I1 | RDS connection pool exhaustion (19 new tables) | Medium | High | ALL | PgBouncer connection pooling, read replicas for analytics, query optimisation |
| I2 | Redis memory pressure (BullMQ + caching) | Medium | Medium | ALL | Redis cluster with maxmemory-policy, TTL enforcement, separate instances for queues vs cache |
| I3 | ECS task scale-out latency during peak | Low | Medium | ALL | Pre-warmed ECS tasks, HPA with predictive scaling, target tracking alarms |
| I4 | Database migration conflicts (19 additive migrations) | Low | Medium | ALL | Feature flags gate new tables, zero-downtime migrations, blue/green deploy |

## Security Risks

| # | Risk | Likelihood | Impact | Epic | Mitigation |
|---|------|-----------|--------|------|-----------|
| S1 | Payout API abuse (fraudulent payouts) | Low | Critical | E2, E3 | MFA on payout approval, velocity checks, admin approval for >₹50K payouts |
| S2 | Supplement company FSSAI fraud | Medium | High | E2 | Automated certificate validation, manual review queue, periodic re-verification |
| S3 | Biometric data leak (face/fingerprint) | Low | Critical | E8 | AES-256 encryption at rest, never store raw biometrics, on-device matching where possible |

## Marketplace Risks

| # | Risk | Likelihood | Impact | Epic | Mitigation |
|---|------|-----------|--------|------|-----------|
| M1 | Supplement company fails to fulfil orders | Low | High | E2 | SLA tracking, automated alerts, refund guarantee, backup supplier routing |
| M2 | Dispute resolution (return/refund) | Medium | Medium | E2 | Escrow hold until delivery confirmation, automated refund within 48h for verified claims |
| M3 | GST compliance multi-state (India) | High | Medium | E1, E2 | Tax engine integration (Avalara), HSN code mapping, audit trail, CA review |

## Revenue Risks

| # | Risk | Likelihood | Impact | Epic | Mitigation |
|---|------|-----------|--------|------|-----------|
| R1 | Payment failure rate >5% | Medium | High | E1 | Smart retry (3 attempts), dunning emails, payment method fallback suggestions |
| R2 | Churn rate >5% monthly | Medium | High | E7 | AI churn prediction, personalised offers, win-back campaigns, loyalty programme |
| R3 | Payout settlement delays affecting partner trust | Medium | Medium | E2, E3 | T+7 max SLA, automated payout batch, real-time payout status dashboard |

## Compliance Risks

| # | Risk | Likelihood | Impact | Epic | Mitigation |
|---|------|-----------|--------|------|-----------|
| C1 | DPDP India data residency violation | Medium | Critical | ALL | Indian datacenters only (ap-south-1), data classification policy, 72h breach notification |
| C2 | PCI-DSS non-compliance | Low | Critical | E1 | Never store raw card data, delegate to Razorpay/Stripe, annual compliance audit |

## Scalability Risks

| # | Risk | Likelihood | Impact | Epic | Mitigation |
|---|------|-----------|--------|------|-----------|
| X1 | 19 new tables degrade query performance | Medium | Medium | ALL | Index strategy review per migration, EXPLAIN ANALYZE gate, read replicas |
| X2 | Event throughput exceeds BullMQ capacity | Low | Medium | ALL | Kafka migration path documented, sharded queues per tenant if needed |

## Severity Matrix

```
Critical (immediate action)     : T1, S1, S3, C1, C2
High (dedicated sprint work)    : T2, T3, T4, P2, I1, S2, M1, M3, R1, R2, X1
Medium (monitor + address)      : T5, T6, T7, P1, P3, P4, P5, I2, I4, M2, R3, X2
Low (track in backlog)          : I3 (addressed in Phase 1 infra)
```

## Contingency Plans

| Trigger | Action | Owner | TTR |
|---------|--------|-------|-----|
| Payment gateway down >5min | Switch to secondary gateway (Razorpay ↔ Stripe) | Backend | <2min |
| Commission calc error >0.5% | Halt payout batch, manual reconciliation | Revenue Engine | <4h |
| Biometric device failure | Fallback to QR code + manual entry | Device SDK | <1min |
| ML model accuracy <70% | Fallback to rule-based recommendations | ML Engineer | <1 sprint |
| DB connection pool exhaustion | Scale RDS + enable PgBouncer | DevOps | <10min |
| Data breach detected | Isolate tenant, revoke keys, notify DPO | Security | <15min |

## Sprint-Level Risk Mapping

| Sprint | Epics | High-Risk Items | Risk Budget |
|--------|-------|-----------------|-------------|
| Sprint 4 | E1, E2 | T1, T2, T3, R1, M3, C2 | 5 story points buffer |
| Sprint 5 | E3, E4 | P1, T3, R1, X1, M3 | 5 story points buffer |
| Sprint 6 | E5, E6, E9 | P3, I1, M2, R2 | 3 story points buffer |
| Sprint 7 | E7, E8, E10 | T4, T5, S1, S3, C1 | 5 story points buffer |