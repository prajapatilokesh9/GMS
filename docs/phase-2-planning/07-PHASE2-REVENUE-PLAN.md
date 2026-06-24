# Phase 2 Revenue Plan

## Revenue Model Overview

| Stream | Source | FitCore Share | Partner Share | Phase 2 Epic |
|--------|--------|---------------|---------------|--------------|
| **SaaS Subscription** | Gym monthly fees | 100% | — | E1 |
| **Supplement Marketplace** | GMV commission | 5-8% | Gym 3-5%, Trainer 5-10%, Company 80% | E2 |
| **PT Session Commission** | Booking fee | 10% | Trainer 70%, Gym 20% | E3 |
| **Equipment Leads** | Qualified lead fee | ₹2K-10K/lead | Manufacturer 85% | E4 |
| **Nutritionist Consultation** | Booking fee | 12% | Nutritionist 88% | E5 |
| **Maintenance Jobs** | Job value commission | 8% | Technician 60%, Platform 8%, Provider 32% | E6 |
| **Featured Placements** | Promoted listings | 100% | — | E9 |
| **Data Intelligence** | Benchmark reports | 100% | — | E7 |

## Subscription Revenue (E1)

| Tier | Price | Max Members | Features |
|------|-------|-------------|----------|
| Starter | ₹999/month | 100 | Core gym management |
| Growth | ₹2,499/month | 500 | + Marketplace, trainer mgmt |
| Pro | ₹5,999/month | 2,000 | + Biometric, AI, analytics |
| Enterprise | Custom | Unlimited | + White-label, dedicated CSM |

## PAYG Revenue (E1)

- Wallet-based: Load ₹500+ amount; each visit deducts ₹50
- Flex: ₹299 base + ₹50/class; 20% cheaper than pure PAYG
- No-cost EMI on 3+ month plans (Razorpay integration)

## Marketplace Revenue (E2, E3, E5)

| Marketplace | GMV Commission | Payment Trigger | Settlement |
|-------------|---------------|----------------|------------|
| Supplements | 5-8% | Order delivered | T+7 to company |
| PT Sessions | 10% | Session completed | T+2 to trainer |
| Nutritionist | 12% | Consultation completed | T+2 to nutritionist |
| Equipment | ₹2K-10K/lead | Quote requested | T+1 to FitCore |
| Maintenance | 8% | Job approved | T+3 to technician |

## Commission Structure (E2, E3, E6)

```
Supplement Order (₹1,000)
├── FitCore Pro: ₹60 (6%)
├── Gym: ₹40 (4%)
├── Trainer: ₹80 (8%) [if affiliated]
└── Supplement Company: ₹820 (82%)

PT Session (₹500)
├── FitCore Pro: ₹50 (10%)
├── Gym: ₹100 (20%)
└── Trainer: ₹350 (70%)

Maintenance Job (₹2,000)
├── FitCore Pro: ₹160 (8%)
├── Platform Ops: ₹80 (4%)
└── Technician: ₹1,760 (88%)
```

## Trainer Revenue Model (E3)

- PT sessions: 70% of booking fee (gym 20%, platform 10%)
- Supplement affiliate: 5-10% of product sale via referral link
- Performance bonus: Gym-set targets (e.g., 50 sessions/month → ₹5K bonus)
- Payout schedule: Monthly via bank transfer

## Gym Revenue Model (E1, E2, E4, E6)

- SaaS subscription (fixed monthly fee)
- Supplement marketplace: 3-5% GMV commission
- Equipment leads: Referral fee from manufacturer
- Maintenance: Service call markup
- Featured trainer placements: ₹500-2K/month

## Partner Revenue Model (E2, E4)

| Partner | Revenue Stream | Split |
|---------|---------------|-------|
| Supplement Company | Product sales - commissions | 80-87% of GMV |
| Equipment Manufacturer | Equipment sales + AMC | 85% of sale + full AMC |
| Maintenance Provider | Job fees - platform commission | 88% of job value |

## Payout Flows

```
Payment Received (Razorpay/Stripe)
    ↓
Revenue Engine (commission_splits table)
    ├── Platform fee → FitCore Pro account (T+0)
    ├── Gym commission → Gym wallet (T+7)
    ├── Trainer payout → Trainer account (T+2)
    ├── Supplement co. → Supplier account (T+7)
    └── Technician → Technician account (T+3)
        ↓
Bulk payout batch (weekly for trainers, monthly for suppliers)
    → Razorpay Payouts API / Stripe Connect
    ↓
Audit log entry + notification to recipient
```

## Revenue KPIs

| Metric | Phase 2 Target | Calculation |
|--------|---------------|-------------|
| MRR | ₹20L | Σ(SaaS subscriptions + marketplace commissions) |
| ARR | ₹2.4Cr | MRR × 12 |
| Gross Margin | >75% | (Revenue - payment gateway fees - hosting) / Revenue |
| Net Revenue Retention | >110% | (Starting MRR + expansion - churn) / Starting MRR |
| Marketplace GMV | ₹50L/month | Total supplement + PT + nutritionist transaction volume |
| Average Revenue Per Gym | ₹2,499/month | Total MRR / Active gyms |
| Supplement Attach Rate | >15% | Members buying supplements monthly / Total members |
| Payout Accuracy | >99.5% | Correct payouts / Total payouts |
| Payout TAT | <T+7 | Days from transaction to partner settlement |

## Monetization Dependencies

| Dependency | Epic | Required For |
|-----------|------|-------------|
| Razorpay/Stripe integration | E1 | All payment collection |
| Revenue Engine (commission_splits) | E3 | All commission calculations |
| Wallet system | E1 | PAYG deductions, payouts |
| Payout automation | E2, E3 | Trainer/supplier settlements |
| Tax engine (GST/HSN) | E1, E2 | Invoice generation, compliance |
| Subscription tier enforcement | E1 | Feature gating per gym plan |