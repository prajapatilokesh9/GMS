# Phase 2 Objectives

## Business Capabilities Introduced

### Core Monetisation Capabilities
1. **Membership & Billing Engine** — Fixed, PAYG, Flex plans with Razorpay/Stripe integration, auto-renewal cascade, EMI, prorated upgrades
2. **Supplement Marketplace** — Zero-inventory consignment model, dropship fulfilment, trainer affiliate commissions (5-10%), supplier analytics
3. **Personal Training Revenue** — PT session booking, calendar sync, commission tracking, trainer payout automation
3. **Equipment & AMC Lifecycle** — Sales lead management, installation scheduling, AMC tracking, predictive maintenance via IoT
4. **Nutritionist Marketplace** — Diet plan builder, lab report OCR, consultation booking (video/in-person), adherence tracking
5. **Maintenance Job Dispatch** — Real-time technician dispatch, digital job cards, rating system, zone-based availability
6. **Trainer Discovery & Earnings** — Public profiles, client portfolio, workout builder, supplement commission tracking

### AI/ML Intelligence Layer
7. **Churn Prediction** — XGBoost model using login frequency, payment history, attendance (>70% probability triggers)
8. **Workout & Diet Recommendation** — Collaborative filtering + rule engine; LLM fine-tuned for meal plans
9. **Offer Generation** — Bayesian optimisation for personalised discounts based on churn risk and member value
10. **Supplement Recommendations** — Deficiency flags from biometrics → targeted product suggestions

### Biometric & IoT Integration
11. **Biometric Entry** — Face/Fingerprint/QR/NFC/Manual with anti-spoofing, anti-passback, fallback chain
12. **Wearable Health Sync** — Apple Health, Google Fit, Mi Band/Fitbit; auto-log cardio, sleep, HR zones
13. **Equipment Telemetry** — Vibration/temperature/usage monitoring; ML predictive failure alerts

### Growth & Acquisition
14. **Local SEO & GMB Sync** — Schema.org markup, Google Ads lead forms, review management, keyword targeting
15. **Offer & Promotion Engine** — A/B testing, dynamic AI offers, referral rewards, seasonal campaigns
16. **Loyalty & Gamification** — Points (1pt/₹1), streak badges, leaderboard, referral rewards
17. **Company Staff Tools** — Area manager dashboard, field officer GPS-verified visits, NPS surveys, commission calculator

### Revenue Impact
- **Target MRR: ₹20L (~$24K USD)** from 500 gyms SaaS + marketplace commissions + lead generation
- **Four Revenue Streams**: SaaS subscriptions, marketplace commission (5-12% GMV), lead generation, data intelligence

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **MRR** | ₹20L | Monthly recurring revenue across all streams |
| **Gyms Onboarded** | 500 | Active paying gyms across subscription tiers |
| **Marketplace GMV** | ₹50L | Supplement + PT + nutritionist consultation volume |
| **Churn Rate** | <5% monthly | Member churn across all gyms |
| **Trainer Revenue Share** | ₹2L MRR | PT session + supplement commissions |
| **Equipment Leads** | 200/month | Qualified leads to manufacturers |
| **Churn Prediction Accuracy** | >85% | ML model precision at 30-day horizon |
| **Biometric Entry Adoption** | >60% | Members using face/QR/NFC vs manual |
| **Supplement Attach Rate** | >15% | Members purchasing supplements monthly |
| **NPS Score** | >50 | Gym owner Net Promoter Score |
| **Platform Uptime** | 99.9% | API availability SLA |
| **Payment Success Rate** | >98% | Razorpay/Stripe transaction success |
| **API p95 Latency** | <300ms | All Phase 2 endpoints under load |
| **ML Model Refresh** | Weekly | Automated retraining pipeline |

---

*Phase 2 activates all deferred blueprint capabilities for full multi-sided marketplace monetisation.*