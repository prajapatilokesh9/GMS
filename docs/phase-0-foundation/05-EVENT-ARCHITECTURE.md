# Phase 0 Foundation — Event-Driven Architecture Mapping
## Module Communication & Event Contracts

**Reference:** FITCORE PRO BLUEPRINT — Module Wiring Diagram, Data Flow Examples
**Version:** 1.0 | **Date:** June 2026

---

## 1. EVENT BUS ARCHITECTURE

```
                          ┌─────────────────┐
                          │   EVENT BUS      │
                          │  (BullMQ / Redis)│
                          │                  │
                          │  ┌──────────┐    │
                          │  │  Topic A  │    │
                          │  │  Topic B  │    │
                          │  │  Topic C  │    │
                          │  └──────────┘    │
                          └────────┬─────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
         Producer A          Producer B          Producer C
              │                    │                    │
    ┌─────────┴─────────┐  ┌──────┴──────┐  ┌─────────┴─────────┐
    │  Service S03      │  │  Service S04│  │  Service S13      │
    │  Gym Service      │  │  Membership │  │  Payment Service  │
    └───────────────────┘  └─────────────┘  └───────────────────┘

    Consumers (subscribe to topics):
    ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
    │ S15      │  │ S17      │  │ S19/S21  │  │ External │
    │ Notify   │  │ Analytics│  │ AI Engine│  │ Webhooks │
    └──────────┘  └──────────┘  └──────────┘  └──────────┘
```

---

## 2. EVENT CATALOG (Complete)

### 2.1 Auth & User Events

| Event Name | Producer | Payload | Consumers | Trigger |
|-----------|----------|---------|-----------|---------|
| `user.registered` | S01 Auth | `{ user_id, tenant_id, email, roles[] }` | S15 Notifications, S17 Analytics | After successful registration |
| `user.logged_in` | S01 Auth | `{ user_id, tenant_id, ip, timestamp }` | S17 Analytics | After successful login |
| `user.logged_out` | S01 Auth | `{ user_id, session_id }` | - | On logout |
| `user.profile_updated` | S02 Users | `{ user_id, changed_fields[] }` | S16 Search | On profile update |
| `user.deletion_requested` | S02 Users | `{ user_id, scheduled_for }` | S15 Notifications, S17 Analytics | GDPR deletion request |
| `user.role_changed` | S02 Users | `{ user_id, old_roles[], new_roles[] }` | S17 Analytics | Admin role update |

### 2.2 Gym Events

| Event Name | Producer | Payload | Consumers | Trigger |
|-----------|----------|---------|-----------|---------|
| `gym.created` | S03 Gyms | `{ gym_id, tenant_id, owner_id, name, city }` | S16 Search, S17 Analytics, S15 Notifications | Gym profile created |
| `gym.updated` | S03 Gyms | `{ gym_id, changed_fields[] }` | S16 Search | Gym profile updated |
| `gym.subscription_changed` | S03 Gyms | `{ gym_id, old_plan, new_plan, effective_date }` | S04 Membership, S17 Analytics | Plan upgrade/downgrade |
| `gym.status_changed` | S03 Gyms | `{ gym_id, old_status, new_status }` | S04 Membership, S15 Notifications | Active/suspended/cancelled |
| `gym.biometric_device_added` | S03 Gyms | `{ gym_id, device_id, device_type }` | S12 Biometrics | Biometric device registered |

### 2.3 Membership Events

| Event Name | Producer | Payload | Consumers | Trigger |
|-----------|----------|---------|-----------|---------|
| `membership.created` | S04 Membership | `{ membership_id, gym_id, customer_id, plan_id, price, start_date, end_date }` | S13 Payment, S15 Notifications, S17 Analytics, S06 Trainer | New membership purchased |
| `membership.renewed` | S04 Membership | `{ membership_id, renewal_date, price_paid }` | S15 Notifications, S17 Analytics, S14 Revenue | Successful auto-renewal |
| `membership.expired` | S04 Membership | `{ membership_id, customer_id, gym_id, end_date }` | S15 Notifications, S17 Analytics, S19 AI (churn) | Membership expiry |
| `membership.paused` | S04 Membership | `{ membership_id, paused_until }` | S15 Notifications | Member pause |
| `membership.resumed` | S04 Membership | `{ membership_id }` | S15 Notifications | Member resume |
| `membership.cancelled` | S04 Membership | `{ membership_id, reason }` | S15 Notifications, S17 Analytics, S19 AI | Cancellation |
| `membership.wallet_topped_up` | S04 Membership | `{ membership_id, amount, new_balance }` | S13 Payment | PAYG wallet topup |
| `membership.at_risk_detected` | S19 AI | `{ membership_id, customer_id, gym_id, churn_probability }` | S15 Notifications, S21 AI Offers | AI churn detection |

### 2.4 Booking & PT Session Events

| Event Name | Producer | Payload | Consumers | Trigger |
|-----------|----------|---------|-----------|---------|
| `pt_session.booked` | S05 Booking | `{ session_id, trainer_id, customer_id, gym_id, scheduled_at, duration }` | S15 Notifications, S17 Analytics, S13 Payment | PT session booked |
| `pt_session.completed` | S05 Booking | `{ session_id, trainer_id, customer_id, duration_minutes, exercises[] }` | S06 Trainer, S17 Analytics, S14 Revenue | Session completed |
| `pt_session.cancelled` | S05 Booking | `{ session_id, cancelled_by, reason }` | S15 Notifications | Session cancelled |
| `pt_session.no_show` | S05 Booking | `{ session_id, customer_id }` | S15 Notifications, S17 Analytics | Trainer marked no-show |
| `pt_session.reminder_24h` | Cron/Scheduler | `{ session_id, trainer_id, customer_id, scheduled_at }` | S15 Notifications | 24h before session |
| `pt_session.reminder_1h` | Cron/Scheduler | `{ session_id, customer_id, scheduled_at }` | S15 Notifications | 1h before session |
| `class.booked` | S05 Booking | `{ class_id, gym_id, customer_id, date }` | S15 Notifications | Class booking |
| `class.waitlist_spot_opened` | S05 Booking | `{ class_id, customer_id }` | S15 Notifications | Spot available |

### 2.5 Payment Events

| Event Name | Producer | Payload | Consumers | Trigger |
|-----------|----------|---------|-----------|---------|
| `payment.created` | S13 Payment | `{ payment_id, entity_type, entity_id, amount, gateway }` | S17 Analytics | Payment intent created |
| `payment.completed` | S13 Payment | `{ payment_id, entity_type, entity_id, amount, gateway_txn_id }` | S04/S05/S07/S09, S14 Revenue, S15 Notifications, S17 Analytics | Payment successful |
| `payment.failed` | S13 Payment | `{ payment_id, entity_type, entity_id, reason }` | S15 Notifications, S04 (retry) | Payment failure |
| `payment.refunded` | S13 Payment | `{ payment_id, amount, reason }` | S14 Revenue, S15 Notifications | Refund processed |
| `payment.disputed` | S13 Payment | `{ payment_id, amount, dispute_reason }` | S15 Notifications, S22 Staff | Payment dispute |

### 2.6 Supplement Order Events

| Event Name | Producer | Payload | Consumers | Trigger |
|-----------|----------|---------|-----------|---------|
| `supplement_order.created` | S07 Supplements | `{ order_id, customer_id, gym_id, items[], total_amount }` | S13 Payment, S15 Notifications, S17 Analytics | Order placed |
| `supplement_order.confirmed` | S07 Supplements | `{ order_id, company_id, items[] }` | S18 Integration (ERP webhook), S15 Notifications | Payment confirmed |
| `supplement_order.shipped` | S07 Supplements | `{ order_id, tracking_number, tracking_url }` | S15 Notifications | Order shipped |
| `supplement_order.delivered` | S07 Supplements | `{ order_id, delivered_at }` | S14 Revenue, S15 Notifications, S17 Analytics | Delivery confirmed |
| `supplement_order.returned` | S07 Supplements | `{ order_id, reason }` | S14 Revenue, S15 Notifications | Return processed |
| `supplement.recommended` | S07 Supplements | `{ supplement_id, trainer_id, customer_id }` | S17 Analytics, S06 Trainer | Trainer recommends product |

### 2.7 Equipment & Maintenance Events

| Event Name | Producer | Payload | Consumers | Trigger |
|-----------|----------|---------|-----------|---------|
| `equipment.created` | S08 Equipment | `{ equipment_id, gym_id, manufacturer_id, type, purchase_date }` | S17 Analytics | Equipment added |
| `equipment.warranty_expiring` | Cron | `{ equipment_id, gym_id, manufacturer_id, expiry_date }` | S15 Notifications | 30 days before warranty end |
| `equipment.amc_expiring` | Cron | `{ equipment_id, gym_id, expiry_date }` | S15 Notifications | 30 days before AMC end |
| `equipment.anomaly_detected` | S08 Equipment | `{ equipment_id, gym_id, anomaly_type, severity }` | S15 Notifications, S09 Maintenance | IoT anomaly alert |
| `maintenance_job.created` | S09 Maintenance | `{ job_id, equipment_id, gym_id, urgency }` | S15 Notifications (technicians) | Job request created |
| `maintenance_job.assigned` | S09 Maintenance | `{ job_id, technician_id, scheduled_at }` | S15 Notifications | Technician assigned |
| `maintenance_job.completed` | S09 Maintenance | `{ job_id, technician_id, total_cost, hours }` | S14 Revenue, S15 Notifications, S17 Analytics | Job completed |
| `maintenance_job.rated` | S09 Maintenance | `{ job_id, technician_id, rating, review }` | S09 Maintenance (profile update) | Gym rates technician |

### 2.8 Workout & Nutrition Events

| Event Name | Producer | Payload | Consumers | Trigger |
|-----------|----------|---------|-----------|---------|
| `workout.logged` | S11 Workouts | `{ workout_id, customer_id, gym_id, type, duration, exercises[] }` | S17 Analytics, S19 AI | Workout completed |
| `body_metric.recorded` | S12 Biometrics | `{ metric_id, user_id, weight, body_fat, recorded_at }` | S17 Analytics, S19 AI | New measurement |
| `diet_plan.created` | S10 Nutrition | `{ plan_id, nutritionist_id, customer_id }` | S15 Notifications | Plan assigned |
| `diet_plan.adherence_updated` | S10 Nutrition | `{ plan_id, customer_id, adherence_score }` | S15 Notifications (nutritionist) | Weekly adherence check |
| `food_log.logged` | S10 Nutrition | `{ log_id, user_id, meal_type, total_calories }` | S17 Analytics, S19 AI | Meal logged |

### 2.9 AI & Intelligence Events

| Event Name | Producer | Payload | Consumers | Trigger |
|-----------|----------|---------|-----------|---------|
| `ai.churn_prediction_ready` | S19 AI | `{ gym_id, customer_ids[], probabilities[] }` | S04 Membership, S15 Notifications, S21 AI Offers | Nightly batch complete |
| `ai.recommendation_generated` | S20 AI | `{ user_id, type, recommendation_id, confidence }` | S15 Notifications (in-app) | On-demand or scheduled |
| `ai.offer_generated` | S21 AI | `{ customer_id, membership_id, offer_type, discount }` | S15 Notifications | Churn risk triggered |
| `ai.model_retrained` | S19/S20/S21 | `{ model_name, version, accuracy, timestamp }` | S17 Analytics, S22 Staff | Training pipeline complete |

### 2.10 Notification Events

| Event Name | Producer | Payload | Consumers | Trigger |
|-----------|----------|---------|-----------|---------|
| `notification.sent` | S15 Notifications | `{ notification_id, user_id, channel, type, status }` | S17 Analytics | Notification dispatched |
| `notification.opened` | S15 Notifications | `{ notification_id, user_id, opened_at }` | S17 Analytics | User opened |
| `notification.clicked` | S15 Notifications | `{ notification_id, user_id, clicked_at, action }` | S17 Analytics, S04/S07 | User clicked CTA |

### 2.11 System & Analytics Events

| Event Name | Producer | Payload | Consumers | Trigger |
|-----------|----------|---------|-----------|---------|
| `analytics.daily_snapshot` | Cron | `{ date, metrics{}}` | S17 Analytics (materialised) | Daily midnight |
| `system.error_logged` | S18 Integration | `{ service, error_code, message, stack_trace }` | Sentry, S22 Staff | Exception occurred |
| `integration.webhook_failed` | S18 Integration | `{ integration_id, url, status_code, retry_count }` | S15 Notifications, S22 Staff | Webhook delivery failure |

---

## 3. SCHEDULED / CRON JOBS

| Job Name | Schedule | Service | Description |
|----------|----------|---------|-------------|
| `renewal-reminder-d7` | Daily 08:00 | S04 Membership | D-7 renewal reminder notification |
| `renewal-reminder-d3` | Daily 10:00 | S04 Membership | D-3 renewal reminder |
| `renewal-reminder-d1` | Daily 12:00 | S04 Membership | D-1 renewal reminder |
| `renewal-reminder-d+1` | Daily 14:00 | S04 Membership | Expired +1 day win-back |
| `churn-prediction-batch` | Daily 02:00 | S19 AI | Full churn scan all active members |
| `offer-generation-batch` | Daily 03:00 | S21 AI | Generate offers for at-risk members |
| `membership-expiry-check` | Daily 06:00 | S04 Membership | Mark expired memberships |
| `birthday-offer-check` | Daily 07:00 | S21 AI | Generate birthday offers |
| `supplement-stock-check` | Daily 09:00 | S07 Supplements | Low stock alerts |
| `amc-expiry-check` | Daily 09:00 | S08 Equipment | AMC/Warranty expiry notifications |
| `analytics-materialize` | Daily 01:00 | S17 Analytics | Refresh materialized views |
| `payout-processing` | Weekly (Mon) | S14 Revenue | Process all pending payouts |
| `data-retention-cleanup` | Monthly | S02 Users | GDPR deletion grace period check |
| `email-digest-weekly` | Weekly (Sun) | S15 Notifications | Weekly progress digest for customers |
| `nps-survey-trigger` | Monthly | S22 Staff | Auto-send NPS survey to gym owners |

---

## 4. EVENT FLOW SCENARIOS (Blueprint Mapped)

### Scenario 1: Customer Buying Membership (Blueprint Data Flow #1)

```
1. Customer selects plan → POST /v1/gyms/{id}/memberships
2. S04 Membership Service:
   a. Creates draft membership (status: pending_payment)
   b. Emits → payment.created
3. S13 Payment Service (consumes payment.created):
   a. Creates Razorpay order
   b. Returns payment URL to frontend
4. Customer completes payment → Razorpay webhook → POST /v1/payments/verify
5. S13 Payment:
   a. Marks payment as completed
   b. Emits → payment.completed
6. S04 Membership (consumes payment.completed):
   a. Marks membership as active
   b. Emits → membership.created
7. S15 Notifications (consumes membership.created):
   a. Sends welcome SMS
   b. Sends welcome email
   c. Sends in-app notification
8. S17 Analytics (consumes membership.created + payment.completed):
   a. Logs new member acquisition
   b. Updates MRR calculation
   c. Updates gym dashboard
9. S19 AI (consumes membership.created):
   a. Initializes member profile for predictions
10. Frontend (WebSocket):
    a. Gym owner dashboard refreshes (member count +1)
    b. Customer gets success screen
```

### Scenario 2: Trainer Supplement Recommendation (Blueprint Data Flow #2)

```
1. Trainer recommends supplement → POST /v1/supplements/{id}/recommend
2. S07 Supplements:
   a. Creates recommendation record
   b. Emits → supplement.recommended
3. S15 Notifications (consumes supplement.recommended):
   a. Sends SMS/WhatsApp to customer: "Your trainer recommends..."
   b. Sends push notification with deep link
4. Customer clicks → views product → buys → POST /v1/supplements/{id}/orders
5. S07 Supplements:
   a. Creates order (status: pending)
   b. Emits → supplement_order.created
6. S13 Payment: processes payment (as above)
7. S07 Supplements:
   a. On payment.completed: marks order as confirmed
   b. Emits → supplement_order.confirmed
8. S14 Revenue (consumes supplement_order.confirmed):
   a. Calculates commission splits:
      - Gym: 5%
      - Trainer: 10%
      - FitCore Pro: 5%
      - Supplement company: 80%
   b. Queues payouts
9. S18 Integration (consumes supplement_order.confirmed):
   a. Sends order to supplement company ERP/fulfillment
   b. Returns tracking number
10. S15 Notifications: sends order confirmation + tracking
11. S17 Analytics: logs conversion (recommendation → sale)
12. S06 Trainer (consumes revenue split):
    a. Updates trainer commission dashboard
```

### Scenario 3: Churn Prevention (Blueprint Data Flow #3)

```
1. Daily 02:00 — Cron triggers S19 AI churn-prediction-batch
2. S19 AI:
   a. Loads all active members with activity in last 30 days
   b. For each: runs XGBoost model → churn probability
   c. Identifies members with >70% probability
   d. Emits → membership.at_risk_detected (per member)
3. S04 Membership (consumes membership.at_risk_detected):
   a. Flags member as at-risk in database
   b. Updates gym owner dashboard
4. S21 AI Offers (consumes membership.at_risk_detected):
   a. Loads member LTV, segment, history
   b. Bayesian optimization → generates personalised offer
   c. Emits → ai.offer_generated
5. S15 Notifications (consumes ai.offer_generated):
   a. Day 0: Sends SMS "We miss you! Claim 20% off"
   b. Day 2: Sends push notification with offer CTA
   c. Day 5: Sends email with progress report + offer
6. If customer clicks offer → POST /v1/memberships/{id}/renew
7. S04 Membership:
   a. Processes renewal at discounted rate
   b. Emits → membership.renewed
8. S17 Analytics: logs churn prevented, offer effectiveness
9. S06 Trainer: notified if customer was training with them
10. If customer ignores for 7 days → escalated to gym owner for personal follow-up
```

---

## 5. EVENT RETRY & DEAD-LETTER POLICY

| Scenario | Retry Count | Backoff Strategy | Dead Letter |
|----------|-------------|-----------------|-------------|
| Payment webhook processing | 3 | Exponential (30s, 2min, 5min) | DLQ → manual review |
| Notification delivery | 3 | Fixed (1min intervals) | DLQ → retry next cycle |
| Webhook to supplement ERP | 5 | Exponential (1min, 5min, 15min, 30min, 1h) | DLQ → alert staff |
| Analytics ingestion | 3 | Immediate (1s, 2s, 5s) | Log and discard |
| AI model inference | 2 | Fixed (10s) | Fallback to rule-based |

---

## 6. EVENT SCHEMA STANDARD

```typescript
interface BaseEvent {
  event_id: string;          // UUID v4
  event_name: string;        // e.g., "membership.created"
  event_version: number;     // Schema version (e.g., 1)
  producer: string;          // Service name (e.g., "membership-service")
  timestamp: string;         // ISO 8601
  tenant_id: number;
  correlation_id: string;    // Trace across events
  causation_id: string;      // Immediate cause event
  data: Record<string, any>; // Type-specific payload
}
```

---

*End of Document — Event-Driven Architecture v1.0*
