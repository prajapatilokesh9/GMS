# Phase 2 Epic Inventory & Story Estimates

## Epic Inventory

| Epic | Business Value | Story Points | Dependencies |
|------|----------------|--------------|--------------|
| **E1: Membership & Billing Engine** | Core SaaS revenue | 21 | Phase 1 Auth, Gym, RBAC |
| **E2: Supplement Marketplace** | 5-8% GMV commission | 18 | E1 (payments), Phase 1 Gym |
| **E3: Personal Training Revenue** | 10% GMV commission | 15 | E1, Phase 1 Trainer, Gym |
| **E4: Equipment & AMC Lifecycle** | ₹2-10K/lead + AMC fees | 13 | Phase 1 Gym, Event bus |
| **E5: Nutritionist Marketplace** | 12% GMV commission | 13 | E1, Phase 1 User, Gym |
| **E6: Maintenance Job Dispatch** | 8% job value | 8 | Phase 1 Gym, Event bus |
| **E7: AI/ML Intelligence Layer** | Churn reduction, upsell | 21 | Phase 1 Analytics, Events |
| **E8: Biometric & IoT Integration** | Entry automation, data moat | 15 | Phase 1 Gym, Notification |
| **E9: Growth & Acquisition Tools** | Organic acquisition, retention | 13 | Phase 1 SEO, Notification |
| **E10: Company Staff Tools** | Sales efficiency, NPS | 8 | Phase 1 Auth, RBAC, Gym |

## Story Estimates

### E1: Membership & Billing (21 pts)
- Fixed/PAYG/Flex plans + proration: 5
- Razorpay/Stripe integration + webhooks: 5
- Auto-renewal cascade (D-7/D-3/D-1/D+1): 3
- EMI + prorated upgrades/downgrades: 3
- Wallet top-up + PAYG deduction: 3
- Payment failure retry + dunning: 2

### E2: Supplement Marketplace (18 pts)
- Supplier onboarding + catalogue: 4
- Zero-inventory dropship routing: 4
- Gym showcase + commission split (5-8%): 3
- Trainer affiliate (5-10%): 3
- Promo codes + banner placements: 2
- ERP webhook inventory sync: 2

### E3: Personal Training (15 pts)
- PT session booking + calendar sync: 4
- Commission tracking + payout automation: 4
- Trainer discovery profiles: 3
- Digital session cards + notes: 2
- Commission dashboard + tax docs: 2

### E4: Equipment & AMC (13 pts)
- Equipment inventory + specs: 3
- Sales lead management + pipeline: 3
- Installation scheduling + sign-off: 2
- AMC lifecycle + auto-renewal: 3
- Warranty claims: 2

### E5: Nutritionist Marketplace (13 pts)
- Diet plan builder + AI generation: 4
- Consultation booking (video/in-person): 3
- Lab report OCR + interpretation: 3
- Supplement recommendations + commission: 3

### E6: Maintenance Dispatch (8 pts)
- Job board + zone filtering: 3
- Digital job card + photos + signature: 3
- Technician rating + earnings dashboard: 2

### E7: AI/ML Intelligence (21 pts)
- Churn prediction (XGBoost): 5
- Workout recommendation engine: 5
- Diet recommendation (LLM): 4
- Offer generation (Bayesian): 4
- Model serving + weekly retrain: 3

### E8: Biometric & IoT (15 pts)
- Biometric device SDK integration: 5
- Face/FP/QR/NFC + fallback chain: 4
- Wearable sync (Apple/Google/Mi Band): 3
- Equipment telemetry + ML alerts: 3

### E9: Growth & Acquisition (13 pts)
- Local SEO + GMB sync: 3
- Offer engine + A/B testing: 4
- Loyalty points + streaks + leaderboard: 4
- Referral rewards: 2

### E10: Company Staff Tools (8 pts)
- Area manager dashboard: 3
- Field officer app + GPS verification: 3
- Commission calculator + NPS: 2

## Total: 145 Story Points

### Sprint Velocity Target: 25-30 pts/sprint
**Estimated Sprints: 5-6** (Sprint 4-9)