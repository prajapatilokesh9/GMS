# Phase 2 Event Expansion Plan

## Event Categories

| Category | Event Types | Priority |
|----------|-------------|----------|
| **Billing** | membership.created, membership.renewed, membership.expired, payment.completed, payment.failed, invoice.generated | P0 |
| **Marketplace** | supplement.order.placed, supplement.order.shipped, supplement.order.delivered, supplement.commission.calculated | P0 |
| **Training** | pt.session.booked, pt.session.completed, pt.session.cancelled, trainer.commission.paid | P0 |
| **Equipment** | equipment.purchased, equipment.installed, amc.expiring, amc.renewed, maintenance.requested, maintenance.completed | P1 |
| **Nutrition** | diet.plan.created, consultation.booked, food.logged, adherence.alert | P1 |
| **Maintenance** | job.created, job.assigned, job.started, job.completed, technician.rated | P1 |
| **Engagement** | workout.logged, metric.recorded, streak.achieved, badge.earned, loyalty.points.earned | P1 |
| **Growth** | referral.created, offer.generated, offer.clicked, churn.risk.detected, churn.prevented | P1 |
| **Staff** | visit.logged, nps.submitted, commission.calculated, payout.processed | P2 |

## Producers

| Service | Events Produced | Queue |
|---------|-----------------|-------|
| Membership Service | membership.*, payment.*, invoice.* | billing.queue |
| Payment Service | payment.completed, payment.failed, refund.processed | billing.queue |
| Supplement Service | supplement.order.*, supplement.commission.* | marketplace.queue |
| PT Service | pt.session.*, trainer.commission.* | training.queue |
| Equipment Service | equipment.*, amc.*, maintenance.* | equipment.queue |
| Nutrition Service | diet.plan.*, consultation.*, food.*, adherence.* | nutrition.queue |
| Maintenance Service | job.*, technician.* | maintenance.queue |
| AI/ML Engine | churn.risk.detected, churn.prevented, offer.generated, recommendation.* | ai.queue |
| Loyalty Service | streak.*, badge.*, loyalty.points.*, referral.* | engagement.queue |
| Staff Service | visit.logged, nps.*, commission.* | staff.queue |

## Consumers

| Consumer | Events Consumed | Action |
|----------|-----------------|--------|
| Notification Service | ALL (fan-out) | Send SMS/Email/Push/WhatsApp/In-app |
| Revenue Engine | payment.*, supplement.order.*, pt.session.*, maintenance.job.completed | Calculate commission splits |
| Analytics Service | ALL | Ingest to ClickHouse for dashboards |
| AI/ML Engine | workout.logged, metric.recorded, food.logged, payment.*, membership.* | Feature store updates |
| Search Service | gym.*, trainer.*, supplement.*, equipment.* | Update Elasticsearch indices |
| Commission Service | supplement.order.delivered, pt.session.completed, maintenance.job.completed | Queue payouts |
| Loyalty Service | payment.completed, workout.logged, referral.created | Award points/badges |
| Staff Service | nps.submitted, visit.logged | Update area dashboards |

## Retry Strategy

```typescript
// BullMQ retry configuration per queue
const retryConfig = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000,      // 1s, 2s, 4s
    maxDelay: 30000   // cap at 30s
  },
  removeOnFail: false // move to DLQ instead
};

// Priority jobs (payment, churn) get higher priority
const priorityConfig = {
  billing: 10,      // highest
  training: 8,
  marketplace: 7,
  engagement: 5,
  staff: 3
};
```

## DLQ Strategy

```typescript
// Dead Letter Queue per category
const dlqConfig = {
  'billing.dlq': { retention: 30, alert: true, reprocess: 'manual' },
  'marketplace.dlq': { retention: 14, alert: true, reprocess: 'auto-after-fix' },
  'training.dlq': { retention: 14, alert: false, reprocess: 'manual' },
  'equipment.dlq': { retention: 30, alert: true, reprocess: 'manual' },
  'ai.dlq': { retention: 7, alert: false, reprocess: 'auto-retry' },
  'engagement.dlq': { retention: 7, alert: false, reprocess: 'drop' },
  'staff.dlq': { retention: 30, alert: true, reprocess: 'manual' }
};

// Admin API for DLQ management
GET    /admin/events/:queue/dlq          # List failed jobs
POST   /admin/events/:queue/dlq/:id/requeue  # Re-queue job
DELETE /admin/events/:queue/dlq/:id      # Drop job
GET    /admin/events/:queue/dlq/stats    # Failure rate, common errors
```

## Event Flow Example: Membership Renewal

```
1. Membership Service → membership.renewed (billing.queue)
   ├── Notification Service → welcome back SMS/Email
   ├── Revenue Engine → commission split for gym
   ├── Analytics → MRR increment, cohort update
   ├── Loyalty → bonus points for renewal
   └── AI → churn risk = 0%, update model

2. Payment Service → payment.completed (billing.queue)
   ├── Revenue Engine → queue payout
   ├── Analytics → payment success metrics
   └── Loyalty → points for payment amount
```

## Idempotency

All consumers implement idempotency keys:
```typescript
const idempotencyKey = `${eventType}:${entityId}:${timestamp.toISOString().split('T')[0]}`;
// Process once per day per entity per event type
```

## Monitoring

- Queue depth per category (CloudWatch metric)
- Processing latency p50/p95/p99
- Failure rate per queue (alert >1%)
- DLQ depth (alert >0 for billing, >10 for others)
- Replay lag (time from failure to reprocess)