# FITCORE PRO - Comprehensive Platform Blueprint

**Version:** 1.0  
**Date:** June 2026  
**Status:** Production-Ready Architecture & Development Roadmap

---

## TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Competitive Analysis](#competitive-analysis)
3. [Feature List by Role](#feature-list-by-role)
4. [System Architecture](#system-architecture)
5. [Technology Stack](#technology-stack)
6. [Database Schema](#database-schema)
7. [API Design Patterns](#api-design-patterns)
8. [Development Roadmap](#development-roadmap)
9. [Security & Compliance](#security--compliance)
10. [Risk Mitigation](#risk-mitigation)
11. [Getting Started](#getting-started)

---

## EXECUTIVE SUMMARY

### The Problem

**Fitboat** (fitboat.com): Limited to gym scheduling and billing. No marketplace, no AI, no multi-stakeholder ecosystem.  
**GYM-One** (GitHub): Self-hosted open-source. Requires developer setup, no mobile app, no monetization layer.  
**Market Gap:** 300,000+ gyms in India alone; <12% use any software. Underserved, fragmented market ripe for disruption.

### The Solution: FitCore Pro

A **next-generation, multi-sided SaaS platform** that becomes the operating system of the fitness ecosystem by connecting:

- **Gyms** (management, inventory, member lifecycle)
- **Trainers** (PT scheduling, commission tracking, client management)
- **Customers** (discovery, progress tracking, renewal automation)
- **Nutritionists** (diet planning, consultation booking)
- **Supplement companies** (zero-inventory marketplace)
- **Equipment manufacturers** (sales, service, AMC lifecycle)
- **Maintenance providers** (job dispatch, scheduling)
- **Company staff** (area managers, field officers, onboarding)

### Core Business Model

**Four Revenue Streams:**

1. **SaaS Subscriptions** (Gyms, Trainers, Companies)
   - Starter: ₹999/month (100 members)
   - Growth: ₹2,499/month (500 members)
   - Pro: ₹5,999/month (2,000 members)
   - Enterprise: Custom (unlimited)

2. **Marketplace Commission**
   - Supplement sales: 5-8% GMV
   - PT session bookings: 10% GMV
   - Nutritionist consultations: 12% GMV
   - Equipment leads: ₹2,000-10,000 per qualified lead
   - Maintenance jobs: 8% of job value
   - Featured placements: ₹500-2,000/month per city

3. **Lead Generation**
   - Verified customer leads from Google Ads, Instagram, in-app search

4. **Data Intelligence**
   - Anonymised benchmarks & analytics sold to supplement/equipment companies

### 12-Month Unit Economics Target

```
500 gyms × ₹2,499 SaaS               = ₹12.5L MRR
₹50L supplement GMV × 6%               = ₹3L MRR
₹20L PT session GMV × 10%              = ₹2L MRR
Equipment leads, featured, leads       = ₹2.5L MRR
─────────────────────────────────────
Total MRR Target                        ₹20L (~$24K USD)
Total ARR Target                        ₹2.4Cr (~$288K USD)
```

---

## COMPETITIVE ANALYSIS

### Fitboat Deep Dive

**Strengths:**
- Clean UI for gym management
- Scheduling, attendance, basic payments
- Traction in AU/UK SMB market

**Critical Gaps:**
- ❌ No marketplace (supplements, equipment)
- ❌ No AI/ML features
- ❌ No multi-role ecosystem
- ❌ No biometric entry
- ❌ No local SEO integration
- ❌ No white-label option
- ❌ No mobile-first design
- ❌ Per-member pricing doesn't scale for chains

**Why FitCore Pro Wins:**
- Network effects (gyms → customers → trainers → supplement companies → data → AI → gyms)
- Revenue alignment (we earn when gyms earn)
- Data moat (workout, biometric, nutrition data)

### GYM-One Deep Dive

**Strengths:**
- Free, open-source
- Basic member and payment management
- No vendor lock-in

**Critical Gaps:**
- ❌ No mobile app (fatal for fitness)
- ❌ No APIs (can't integrate biometric devices, payment gateways)
- ❌ No marketplace layer
- ❌ No AI/ML
- ❌ Requires developer to operate
- ❌ No SaaS delivery model
- ❌ Single-tenant only (no multi-tenancy)
- ❌ No biometric support
- ❌ No supplement or equipment modules
- ❌ Dead on GitHub (last commit 2021)

**User Base:**
- Tech-savvy developers, NOT mass market
- Requires operational overhead

**Why FitCore Pro Wins:**
- Turnkey SaaS (no setup required)
- Mobile-first (PWA + native apps)
- API-first architecture
- Professional support
- Revenue sharing alignment

### Features FitCore Pro Adds

| Feature | Fitboat | GYM-One | FitCore Pro | Priority |
|---------|---------|---------|------------|----------|
| Multi-role marketplace | ✗ | ✗ | ✓ 8 roles | P0 |
| AI recommendations | ✗ | ✗ | ✓ Churn, Workouts, Diet | P0 |
| Payment gateway integration | ✓ | ✗ | ✓ Razorpay + Stripe | P0 |
| Churn prediction ML | ✗ | ✗ | ✓ XGBoost model | P0 |
| OYO-style PAYG model | ✗ | ✗ | ✓ Fixed + PAYG + Flex | P0 |
| Biometric scanning | ✗ | ✗ | ✓ Face + QR + NFC + Fingerprint | P0 |
| Local SEO + GMB sync | ~ | ✗ | ✓ Full integration | P0 |
| Video consultations | ✗ | ✗ | ✓ Agora/Jitsi | P1 |
| Wearable health sync | ✗ | ✗ | ✓ Apple Health, Google Fit | P1 |
| White-label gym app | ✗ | ✗ | ✓ Full customisation | P1 |
| Loyalty & gamification | ✗ | ✗ | ✓ Points, badges, leaderboards | P1 |
| Equipment lifecycle mgmt | ✗ | ✗ | ✓ Purchase to AMC to replacement | P1 |
| Maintenance job dispatch | ✗ | ✗ | ✓ Real-time scheduling | P1 |
| Franchise management | ✗ | ✗ | ✓ Multi-branch with brand control | P1 |
| Multi-currency & language | ✗ | ✗ | ✓ Ready for Asia expansion | P2 |
| IoT equipment telemetry | ✗ | ✗ | ✓ Predictive maintenance | P2 |
| Legal e-signature | ✗ | ✗ | ✓ Contracts, membership agreements | P2 |
| GDPR/DPDP compliance | ~ | ✗ | ✓ Full compliance module | P1 |

---

## FEATURE LIST BY ROLE

### 1. GYM OWNERS / MANAGEMENT

#### Dashboard & Analytics
- **Real-time metrics:** Active members, revenue (daily/weekly/monthly), attendance rate, facility occupancy
- **Multi-branch unified dashboard** with drill-down by location
- **Drill-down analytics:** Member acquisition cost, lifetime value, churn rate, average session duration
- **Comparative analytics:** This month vs last month, year-over-year trends
- **Custom date range queries** and data export (CSV, PDF)

#### Member Lifecycle Management
- **Onboarding flow:** Lead capture → form filling → membership plan selection → payment → welcome email/SMS
- **Membership types:**
  - Fixed (monthly/quarterly/annual with auto-renewal)
  - Pay-as-you-go (wallet-based, no commitment)
  - Hybrid flex (base fee + per-class top-ups)
- **Automatic renewal reminders:** D-7, D-3, D-1, D+1 via SMS, WhatsApp, push, email
- **Churn prediction alerts:** When ML model flags members as at-risk (>70% probability)
- **Win-back campaigns:** Auto-triggered for lapsed members (>30 days post-expiry)
- **Birthday offers:** Auto-coupon 3 days before member's birthday
- **Monthly progress reports:** Auto-generated PDF with weight change, sessions attended, streak

#### Trainer Management
- **Trainer roster:** Add, edit, delete trainers with certifications, specialisations, hourly rate
- **PT session scheduling:** View calendar, accept/decline bookings, set availability
- **Commission tracking:** PT session fees, supplement commissions, performance bonuses
- **Trainer performance dashboard:** Revenue per trainer, client satisfaction score, top performers
- **Supplement recommendation:** See which trainers recommend which supplements and commission earned
- **Lead generation for trainers:** Market trainers as "featured" or "trending" to customers

#### Supplement Showcase & Sales
- **Zero-inventory consignment:** Display supplements from partner companies without holding stock
- **Product catalogue:** Browse supplements, filter by goal (muscle, weight loss, recovery), sort by price/rating
- **Dropship model:** Orders route to supplement company for fulfilment; gym receives commission
- **Trainer affiliate:** Trainers can recommend supplements and earn commission on customer purchases
- **Inventory alerts:** (For physical stock) Low stock warnings, auto-reorder suggestions
- **Supplier management:** Contract terms, commission rates, payment dates, dispute resolution

#### Equipment & Maintenance
- **Equipment inventory:** Add machine with serial, model, purchase date, warranty expiry, specs
- **Maintenance requests:** Create requests, assign to technician, track status
- **AMC (Annual Maintenance Contract) lifecycle:** Track expiry dates, auto-renew, service history
- **Preventive maintenance schedule:** Set frequency (monthly/quarterly/annual), auto-notify technician
- **Spare parts ordering:** Order directly from manufacturer via platform
- **Machine performance alerts:** IoT-connected machines report anomalies (temperature, vibration, usage)

#### Biometric Device Integration
- **Support:** Suprema, ZKTeco, HikVision biometric readers
- **Entry modes:** Face recognition, fingerprint, QR code, NFC, staff manual override
- **Anti-passback:** One QR code = one entry per session; prevents sharing
- **Attendance real-time syncing:** Entry events stream to Attendance module via WebSocket
- **Fallback chain:** If face fails → fingerprint → NFC → QR → manual
- **Device management:** Register device, assign to gym location, manage access rules

#### Local SEO & Google Integration
- **Google My Business sync:** Auto-update hours, photos, offers, reviews from within platform
- **Schema.org markup:** Auto-inject SportsActivityLocation structured data for SEO
- **Google Ads lead form integration:** Leads from ads flow directly to CRM with attribution
- **Performance tracking:** Views, phone calls, directions requested from GMB
- **Review management:** Flag spam reviews, request reviews from members
- **Local keyword targeting:** Gym slug = /gyms/{city}/{gym-name} for organic rankings

#### Offer & Promotion Engine
- **A/B testing:** Create two coupon versions, measure conversion rate
- **Dynamic offers:** AI generates personalised discounts based on churn risk
- **Bulk promotions:** Create campaigns (e.g., "New Year, New Body - 20% off")
- **Referral rewards:** Give existing members credit for bringing friends
- **Seasonal campaigns:** Pre-built templates for New Year, Summer, Diwali, etc.
- **Coupon tracking:** Track redemption rate, revenue attribution per campaign

#### Staff Management
- **Payroll calculator:** Track attendance, mark leaves, calculate monthly salary
- **Role-based access control:** Receptionist, trainer, manager, admin with different permissions
- **Shift scheduling:** Create shifts, assign staff, track utilisation
- **Performance metrics:** Attendance rate, customer satisfaction score, referral count

---

### 2. TRAINERS (IN-GYM & INDEPENDENT)

#### Professional Profile
- **Bio & gallery:** Profile photo, headline, bio, workout photos, before-after transformations
- **Certifications:** ACE, NASM, ISSF, CSCS, ISSN (with verified upload)
- **Specialisations:** Weightlifting, CrossFit, yoga, nutrition, rehabilitation, women's fitness
- **Ratings & reviews:** 5-star system with verified reviews from clients
- **Availability calendar:** Set working hours, holidays, vacation blocks
- **Hourly rate:** Configurable per trainer (gym can suggest, trainer can set if independent)
- **Discovery profile:** Searchable in in-app marketplace by customers

#### PT Session Management
- **Calendar sync:** Google Calendar, Outlook calendar integration
- **Session booking flow:** Customer selects trainer → date/time → confirms → payment
- **Automated reminders:** SMS/push to trainer 24h before, to customer 24h & 1h before
- **No-show alerts:** Trainer gets alert if customer hasn't arrived 10 mins after session start
- **Digital session card:** Trainer logs exercise, duration, notes, photos before session ends
- **Rescheduling:** One-tap to propose new time to customer
- **Video recording:** Option to record session for client's portfolio (consent required)
- **Commission calculation:** Auto-calculated based on trainer rate, gym rate, FitCore Pro fee split

#### Client Portfolio
- **Client list:** All active and past clients with status, join date, last session
- **Biometric tracking:** View client's weight, body fat %, muscle mass, measurements from their logs
- **Workout history:** See all past sessions with exercises, reps, sets, weight
- **Diet log:** View client's food intake (if client shared permission)
- **Progress photos:** Timeline of client's transformation with dates
- **Body measurements:** Chest, waist, arms, legs, hips with date-wise trends
- **Injury flags:** If client marked injury, trainer can see it and modify workouts accordingly

#### Workout Plan Builder
- **Exercise library:** 5,000+ exercises with video demonstrations, muscle groups, difficulty
- **Drag-and-drop interface:** Add exercises to day, set sets/reps/rest
- **Auto-generation:** AI generates starter plan based on client's goal and fitness level
- **Weekly schedule:** Customise per day (e.g., Monday = Chest, Tuesday = Back)
- **Progression:** Set weight progression rules (e.g., +2.5kg every week)
- **Diet integration:** Link diet plan from nutritionist to workout plan for holistic guidance
- **Share:** Send plan to client via app; client marks exercises as done
- **History:** Keep all past plans; client can reference old progressions

#### Supplement Commission Tracking
- **Recommended products:** Trainer can recommend specific supplements in app to clients
- **Affiliate commission:** When client buys via trainer's link, trainer earns commission
- **Commission dashboard:** See all recommended products, conversion rate, total earnings
- **Top recommendations:** See which supplements convert best
- **Payout schedule:** Monthly payouts to trainer's bank account after gym/platform fee split

#### Earnings Dashboard
- **PT session revenue:** ₹X per session × Y sessions this month = ₹Z earnings
- **Supplement commissions:** Track by product and total
- **Performance bonuses:** Gym offers bonus if trainer hits target (e.g., 50 sessions/month)
- **Total earnings:** Sum of all revenue streams this month/quarter/year
- **Payout history:** See all past payouts with dates and amounts
- **Tax documents:** Auto-generated 1099/invoice for tax filing

#### In-App Messaging
- **Chat with clients:** Send messages, share workout videos, ask about pain points
- **Group chat:** Create group chats for class-based training
- **File sharing:** Share workout PDFs, video links, before-after photos
- **Message history:** Searchable archive of all conversations

#### Discovery Profile
- **Public profile:** Searchable in in-app marketplace by customers based on:
  - Goal (weight loss, muscle gain, flexibility, strength)
  - Specialisation (yoga, CrossFit, strength, rehab)
  - Certification
  - Location
  - Price range
  - Availability
- **Booking via profile:** Customer can book directly from trainer's profile

---

### 3. CUSTOMERS / END-USERS

#### Goal-Based Onboarding
- **Goal selection:** Yoga, Zumba, Powerlifting, Bodybuilding, Weight Loss, Rehabilitation, General Fitness
- **Fitness level:** Beginner, Intermediate, Advanced
- **Health questionnaire:** Current weight, height, injuries, medical conditions, allergies
- **Dietary preferences:** Vegan, vegetarian, gluten-free, no preference
- **Equipment access:** Home gym (dumbbells, nothing), gym membership (single gym, multiple gyms)
- **Goal-specific recommendations:** Based on selection, app recommends gyms, trainers, nutrition plans

#### Gym & Trainer Discovery
- **GPS-based search:** Find gyms within 1km, 2km, 5km, 10km radius
- **Filter dimensions:**
  - Goal type (yoga, strength, cardio)
  - Price range (₹500-₹2,000/month)
  - Trainer specialisation (women-only, morning batches, evening)
  - Opening hours (24-hour, morning 5-8am, evening 5-9pm)
  - Amenities (biometric entry, steam, shower, parking)
  - Ratings (4.5+, 4.0+, 3.5+)
- **Sorting:** Distance, price, rating, new, trending
- **Trainer discovery:** Search by name, specialisation, availability, hourly rate
- **Deep-link:** Gym profile is shareable web URL (https://fitcore.app/gyms/jaipur/gold-gym) for SEO
- **Reviews:** See verified member reviews with photos

#### Membership Purchase
- **Plan selection:**
  - Fixed: ₹1,299/month (unlimited sessions)
  - PAYG: Load ₹500 wallet; each visit deducts ₹50 (10 visits)
  - Flex: ₹299 base + ₹50 per class (20% cheaper than PAYG)
- **Payment:** Razorpay (UPI, cards, wallets, EMI), Stripe (international)
- **EMI option:** For 3-month+ plans, offer no-cost EMI
- **Instant activation:** Membership active immediately after payment

#### Biometric Gym Entry
- **Modes:** Face recognition, fingerprint, QR code, NFC card, manual (staff registers)
- **Registration:** Customer adds face during onboarding; optionally adds fingerprint
- **Entry process:** Tap face reader → recognised → gate opens (1-second)
- **Fallback:** If face fails, tap NFC card or scan QR code on app
- **Anti-spoofing:** Liveness detection prevents photo-based spoofing
- **Session logging:** Entry automatically triggers "Session started" notification
- **Workout prompt:** 5 mins after entry, app prompts customer to select workout (optional)

#### Workout & Progress Tracking
- **Pre-workout:** Select workout type (chest, back, cardio, yoga, class), expected duration
- **During workout:** Log exercises manually or via trainer-created plan
- **Exercise logging:** Exercise name, reps, sets, weight, rest period
- **Timer:** Auto-timer between sets (configurable)
- **Post-workout:** Rate workout difficulty (1-10), notes, mood
- **Progress charts:** Weight, body fat %, muscle mass over time (line charts)
- **Streaks:** Track consecutive days at gym (gamification)
- **Badges & achievements:** "100 sessions", "Lost 5kg", "New PR"
- **Comparison:** This month vs last month, week-over-week progress

#### Diet & Nutrition Tracking
- **Meal logging:** Select meal (breakfast, lunch, snack, dinner), log foods
- **Macro calculator:** Auto-calculate calories, protein, carbs, fat per meal
- **Macro goals:** Set daily targets (e.g., 2,000 cal, 150g protein, 150g carbs, 70g fat)
- **Nutritionist plans:** If subscribed, see diet plan from nutritionist; log adherence
- **Food database:** 100,000+ Indian and global foods with macro data
- **Recipe generator:** "Generate 2,000 cal, 40% protein recipe" → AI suggests recipes
- **Weekly summary:** Pie chart of macro distribution, adherence to plan
- **Alerts:** "You've hit your protein target" or "You're 500 cal under target"

#### AI-Generated Plans
- **Workout AI:** "Generate 4-week progressively overloading chest plan for beginner"
- **Diet AI:** "2,000 cal, vegetarian, high protein, low sugar plan for weight loss"
- **Supplement recommendations:** Based on goal, deficiency flags from biometrics
- **Trainer override:** Can always request trainer to modify or create custom plan

#### Supplement Shop
- **Browse:** Filter by goal (muscle, weight loss, recovery, immunity), brand, price
- **Trainer recommendations:** See which supplements trainers recommend (with commission disclosure)
- **Reviews:** Customer ratings, verified purchase reviews
- **Pricing:** Compare across brands, see if gym recommends specific brand
- **Doorstep delivery:** Select delivery address, track order
- **Payment:** Via wallet or card
- **Order history:** Track all past orders

#### Auto-Renewal & Membership Management
- **Days left badge:** Shows "15 days left" on home screen
- **Renewal alert cascade:**
  - D-7: Email + push notification
  - D-3: SMS + WhatsApp message
  - D-1: SMS + push with "Renew now" CTA
  - D+1 (expired): Push with special win-back offer
- **One-tap renewal:** Select same plan or upgrade; instant payment via saved card
- **Plan upgrade:** Anytime can upgrade to higher plan; prorated refund if downgrading
- **Auto-renewal toggle:** Can turn on/off (on by default after first renewal)
- **Pause membership:** Can pause for up to 30 days without losing plan

#### Loyalty & Gamification
- **Points system:** 1 point per ₹1 spent, bonus points for streaks
- **Redemption:** 100 points = ₹50 discount on renewal
- **Referral rewards:** Refer friend → friend joins → you get 200 points
- **Streak badges:**
  - "7-day streak" (gold badge)
  - "30-day streak" (platinum badge)
  - "100 sessions" (diamond badge)
- **Leaderboard:** Gym-wide leaderboard of top 10 members by activity (weekly reset)
- **Special bonuses:** Gym offers bonus points on milestone (e.g., +100 points on 50th session)

#### Class Booking
- **Live classes:** View gym's live class schedule (yoga 6am, zumba 7pm, strength 8am)
- **Booking flow:** Select class → date/time → confirm → added to calendar
- **Reminders:** 24h and 1h before class start
- **Cancellation:** Can cancel up to 1h before class; no penalty
- **Waitlist:** If class full, join waitlist; get notification if spot opens
- **Instructor profile:** See instructor's bio, ratings, specialisations

#### Health Integrations
- **Apple Health sync:** Auto-import steps, workouts, active energy from iPhone
- **Google Fit sync:** Auto-import steps, workouts from Android
- **Mi Band / Fitbit sync:** Auto-import daily steps, heart rate data
- **Auto-logging:** If customer walked 10,000 steps today, FitCore logs as "Cardio" session
- **Sleep tracking:** Import sleep data; app suggests rest days if sleep <6 hours
- **Heart rate zones:** View VV02max, heart rate zones from wearables

#### Injury & Health Flags
- **Injury logging:** "I have knee pain" → app alerts trainers
- **Temporary modifications:** App suggests lower-impact exercises during injury
- **Recovery tracking:** "My knee is healing" → custom plan transitions back to normal
- **Medical condition flags:** Asthma, diabetes, BP issues → trainer can see & adjust

---

### 4. NUTRITIONISTS

#### Client Management Portal
- **Client list:** View all active/past clients with status, join date, last consultation
- **Health intake form:** Medical history, food allergies, food preferences, lifestyle, goals
- **Lab reports:** Upload/download blood test, thyroid, lipid profiles
- **Consultation notes:** Append notes after each consultation for follow-up

#### Diet Plan Builder
- **Template library:** Pre-built plans (weight loss, muscle gain, diabetes management, heart health)
- **Custom builder:**
  - Set daily calorie target
  - Set macro split (% protein, carbs, fat)
  - Select meal frequency (3, 4, 5 meals/day)
  - Add meal templates (e.g., breakfast = oats, egg, banana)
- **Auto-generation:** Select goal + current stats → AI generates balanced meal plan
- **Weekly meal plan:** Mon-Sun with breakfast, lunch, snack, dinner
- **Recipe integration:** Link recipes to meals; customer sees shopping list
- **Duration:** Set plan duration (4 weeks, 3 months, 6 months)
- **Revision:** Client feedback → modify plan dynamically

#### Client Food Log Integration
- **Real-time tracking:** View client's food logs from FitCore Pro app
- **Adherence score:** % of planned macros actually logged (e.g., 85% adherent)
- **Weekly progress:** Summary of average calories, macros, water intake
- **Alerts:** If client goes 2,000 cal over target, app alerts nutritionist to check in

#### Lab Report Interpretation
- **Upload:** Client/nutritionist uploads blood report (PDF/image)
- **Parsing:** OCR extracts key values (hemoglobin, B12, vitamin D, etc.)
- **Interpretation notes:** Nutritionist adds notes ("B12 is low, suggest supplementation")
- **Recommendations:** Auto-linked supplement recommendations based on deficiencies

#### Supplement Recommendations
- **In-platform shop:** Recommend supplements via the FitCore Pro marketplace
- **Commission:** Nutritionist earns commission (0-5%) if client buys via recommendation
- **Dosage guidance:** "Vitamin D3 2000IU daily with food"
- **Progress tracking:** See if client actually purchased and is taking supplement

#### Consultation Booking
- **Appointment types:** In-person (gym), video call (Jitsi/Agora), phone call
- **Booking calendar:** Client selects available time slot
- **Payment:** Client pays consultation fee (₹500-2,000 per session)
- **Video link:** 5 mins before consultation, both get meeting link
- **Notes:** Document key points, action items for next visit
- **Reminders:** Auto-SMS 24h before consultation

#### Automated Weekly Check-ins
- **Survey:** "How was your adherence this week (1-10)?" + "Any challenges?"
- **Frequency:** Auto-sent every Monday morning
- **Response triggers:** If <5, auto-send re-motivation message
- **Insights:** Track mood and adherence correlation over time

#### Discovery Profile
- **Public profile:** Searchable by customers looking for nutritionists
- **Filters:** Location, expertise (diabetes, weight loss, sports nutrition), experience, price
- **Booking:** Customers can book first consultation directly from profile

---

### 5. SUPPLEMENT COMPANIES

#### Brand Account Setup
- **Company info:** Company name, GST number, FSSAI license, contact person, website
- **Brand details:** Brand name, logo, description, certifications (ISO, NSF, GMP)
- **Product categories:** Whey protein, pre-workout, vitamin, mineral, herbal, multi-vitamin

#### Product Catalogue Management
- **Product entry:**
  - SKU, name, description, image gallery
  - Flavours (vanilla, chocolate, strawberry)
  - Size options (500g, 1kg, 2kg)
  - Price (per size), discount for bulk
  - Ingredients, nutritional facts (auto-parse from label)
  - Allergen warnings, storage instructions
  - Goals it serves (muscle gain, weight loss, recovery, immunity)
- **Lab reports:** Upload third-party testing (heavy metals, microbial, authenticity)
- **Certifications:** ISO, GMP, NSF, lab certificates for transparency

#### Virtual Shelf Presence (Zero-Inventory Model)
- **Display in gyms:** Products appear on "Supplement Shop" in any gym's app
- **No physical stock:** Gym doesn't hold inventory; dropship model
- **Ordering:** Customer orders in gym's app → payment to FitCore Pro → order routed to company
- **Gym's role:** Supplement showcase & promotion; earn 3-5% commission on each order

#### Sales Analytics Dashboard
- **By gym:** See top-selling gyms, revenue per gym, growth trends
- **By region:** Analyse performance across cities/states
- **By trainer:** See which trainers drive most supplement sales (trainer affiliate commission)
- **By customer segment:** Weight loss buyers vs muscle gain buyers; tailor campaigns
- **Sales trends:** Product-wise performance, seasonal patterns
- **Conversion funnel:** Views → clicks → purchases (identify leaks)

#### Campaign Tools
- **Promo codes:** Create discount codes (e.g., FITCORE10 = 10% off)
- **Time-limited offers:** "Buy 2, get 1 free" valid for specific dates
- **Trainer incentive programs:** "Sell 10, earn ₹500 bonus"
- **Banner placements:** Featured spot in gym's supplement shop for ₹5,000/month
- **Email campaigns:** Send to all customers who viewed your product (permissioned)
- **SMS campaigns:** Bulk SMS to customers (limited to users who opted in)

#### Inventory Integration
- **Real-time sync:** Webhook integration with company's ERP/WMS
- **Stock updates:** When stock hits 0, product marked unavailable in all gyms
- **Dropship orders:** Real-time order feed from FitCore to company's fulfillment
- **Tracking:** Customer can track package from dispatch to delivery

#### Affiliate Commission Model
- **Trainer affiliates:** Trainers recommend products, earn 5-10% per sale
- **Influencer partners:** Fitness influencers link products, earn commission
- **Coupon tracking:** Each trainer/influencer gets unique coupon code; commissions tracked
- **Payout:** Monthly payouts to affiliate bank accounts

---

### 6. EQUIPMENT MANUFACTURERS

#### Product Catalogue
- **Equipment:** Treadmill, dumbbell, barbell, cable machine, leg press, etc.
- **Product details:**
  - Model name, image gallery
  - Specifications (dimensions, weight, materials, power requirements)
  - Price (gym quote), warranty (1-3 years)
  - Installation cost, shipping cost
  - Financing options (EMI available)
  - Certifications (ISO, CE, safety standards)

#### Sales Lead Management
- **Lead generation:** Gyms browse equipment, click "Request Quote"
- **Lead notification:** Manufacturer gets alert with gym contact, equipment interest
- **Lead tracking:** Can-mark as "followed up", "quoted", "won", "lost"
- **Sales pipeline:** Visual funnel showing leads by stage
- **Lead scoring:** Auto-score based on gym size, budget, region

#### Installation & Commissioning
- **Request creation:** Gym schedules installation after purchase
- **Technician assignment:** Company assigns certified technician to install
- **Visit scheduling:** Technician confirms date/time with gym
- **Checklist:** Technician verifies proper installation, safety, user training
- **Sign-off:** Gym manager signs off on installation completion
- **Photos:** Technician uploads photos of installed equipment for record

#### AMC (Annual Maintenance Contract) Lifecycle
- **AMC creation:** When equipment installed, gym buys AMC (₹5,000-50,000/year)
- **Expiry tracking:** Dashboard shows expiring AMCs; auto-notify gym before expiry
- **Auto-renewal:** Can auto-renew at current rate or renegotiate
- **Service history:** Document all services done (date, technician, issue, parts replaced)
- **Warranty claims:** If equipment fails within warranty, process claim via platform

#### Maintenance Job Dispatch
- **Service request:** Gym requests service (not under AMC or AMC expired)
- **Job creation:** Manufacturer creates job with equipment details, issue description, urgency
- **Technician assignment:** Assign to available technician (FCFS, location-based routing)
- **Job card:** Digital form with photos before/after, parts used, labour hours, cost
- **Payment:** Gym pays for service; split between technician, company, FitCore Pro

#### Machine Telemetry & Predictive Maintenance
- **IoT integration:** Connect telemetry to smart equipment (vibration, temperature, usage)
- **Anomaly detection:** ML model detects unusual patterns (early wear indicators)
- **Predictive alerts:** "This treadmill's belt will fail in ~2 weeks. Schedule service?"
- **Usage analytics:** See which machines are most used; recommend maintenance intervals
- **Performance metrics:** Gym can see daily/monthly machine usage for capacity planning

#### Lead Scoring & Territory Management
- **Lead scoring:** Auto-score leads by gym size, equipment budget, location
- **Territory assignment:** Assign sales reps to regions; track their pipeline
- **Win rate:** Track conversion rate per sales rep, per gym segment

---

### 7. MAINTENANCE PROVIDERS / WORKERS

#### Job Board
- **Open jobs:** Filter by:
  - Job type (equipment repair, installation, AMC service, emergency)
  - Location (1km, 5km, 10km radius from current location)
  - Required skill (electrical, mechanical, hydraulic, software)
  - Urgency (emergency, same-day, scheduled)
  - Price (hourly rate offered)
- **Job details:** Equipment type, issue description, gym location, contact person, urgency
- **One-tap apply:** Accept job → location pinned on map

#### Job Acceptance & Tracking
- **Accept job:** Tap "Accept" → becomes your job
- **Navigation:** Get turn-by-turn directions to gym
- **En-route tracking:** Gym can see your live location on map
- **ETA:** Gym gets real-time ETA
- **Arrival alert:** Gym notified when you arrive; can meet you at gate

#### Digital Job Card
- **Before photos:** Take photos of equipment, damage, condition
- **Issue investigation:** Document findings
- **Parts used:** Log all parts replaced with cost
- **Labour hours:** Log time spent on job
- **Service notes:** Describe work done, recommendations
- **After photos:** Document completed work
- **Customer signature:** Gym manager signs off on job completion
- **Submit:** Send job card; payment released after approval

#### Earning Dashboard
- **Job history:** All completed jobs with payment status
- **Earnings this week/month:** Total revenue from all jobs
- **Pending payouts:** Amount awaiting approval
- **Payout schedule:** Weekly/fortnightly payouts to bank account
- **Tax documents:** Auto-generated invoice for tax purposes
- **Milestone bonuses:** "100 jobs completed" → bonus payment

#### Rating & Reputation
- **5-star rating system:** Gym rates technician after job completion
- **Review:** Gym can leave written feedback ("Professional, quick, clean work")
- **Profile score:** Average rating displayed on public profile
- **Badge system:** "Reliable" badge if 4.5+ rating with 20+ jobs
- **Top performers:** Featured in "Recommended technicians" list for new jobs

#### Availability & Service Zone
- **Availability calendar:** Set working hours, days off, vacation
- **Service zone:** Define preferred work area (1km-15km radius from home)
- **Job alerts:** Only receive notifications for jobs within service zone
- **Toggle online/offline:** Turn on when available, off when done for day

---

### 8. COMPANY STAFF (Area Managers, Field Officers)

#### Area Manager Dashboard
- **Territory overview:** All gyms, trainers, nutritionists, supplement companies in area
- **MRR by gym:** Total revenue per gym (SaaS + marketplace)
- **Churn rate:** % of members who didn't renew this month
- **NPS score:** Net Promoter Score from gym satisfaction surveys
- **Deal pipeline:** Gyms in "prospect" → "demo" → "onboarding" → "active" stages
- **Field officer activity:** Visit logs, NPS surveys conducted, issues escalated

#### Field Officer App
- **Gym visits:** Log visit with photos, notes, action items taken
- **GPS verification:** Location auto-tracked; proves visit occurred
- **Offline mode:** Works without internet; syncs when back online
- **NPS survey:** Ask gym owner "How likely are you to recommend FitCore Pro? (1-10)"
- **Issue tracking:** Document gym complaints (biometric device not working, payment issue)
- **Follow-up tasks:** "Call this gym about renewal next week"
- **Checklist:** "Did gym update all equipment info?" "Are biometric devices active?"

#### Onboarding Tracker
- **Funnel visibility:** See gyms at each stage (signed up → trained → active)
- **Activation checklist:**
  - ✓ Gym admin trained on dashboard
  - ✓ At least 10 trainers added
  - ✓ At least 50 members onboarded
  - ✓ First payment received
  - ✓ Biometric device set up (if purchased)
- **Blockers:** "Gym hasn't added members yet" → auto-escalate to field officer
- **Timeline:** Expected activation date vs actual; track delays

#### Revenue Dashboard
- **MRR trend:** Monthly recurring revenue growth chart
- **ARR:** Annual recurring revenue, run rate
- **Churn rate:** % of members lost, $ value of churn
- **Churn trend:** Month-over-month, identify problematic gyms
- **Cohort analysis:** Gyms onboarded in Jan 2026 have X% retention vs Feb 2026 gyms
- **NPS by gym:** Which gyms are happiest, which need support
- **Expansion potential:** Which gyms are ready to upgrade plan

#### Support Ticket Management
- **Ticket queue:** Support requests from gyms, sorted by priority
- **SLA tracking:** 4-hour response for critical, 24-hour for non-critical
- **Assignment:** Assign tickets to support team members
- **Resolution time:** Track time-to-resolution, identify slow handlers
- **Escalation:** Critical issues auto-escalate to manager after 2 hours

#### Commission & Incentive Calculator
- **Gym acquisition commission:** Area manager gets ₹5,000 per gym onboarded
- **Retention bonus:** "Keep 90% of gyms; get 10% bonus on commission"
- **Expansion bonus:** "Upgrade 5 gyms from Growth to Pro plan; get ₹10,000 bonus"
- **NPS bonus:** "Achieve 50+ NPS score; get 5% bonus"
- **Monthly payout:** Auto-calculate commission, send via bank transfer

#### Fraud & Abuse Detection
- **Alert dashboard:** Suspicious activity flagged (unusual payment patterns, chargeback rate)
- **Manual review:** Can flag gym for manual verification
- **Dispute resolution:** Manage chargebacks, refund requests, payment disputes

---

## SYSTEM ARCHITECTURE

### Architecture Overview

```
┌────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                            │
├────────────────────────────────────────────────────────────────┤
│  React Native Mobile (iOS/Android)                             │
│  Next.js Progressive Web App (Web)                             │
│  React.js Admin Portal (Dashboards)                            │
│  Biometric Device SDKs (Suprema, ZKTeco, Hikvision)           │
└────────────────────────────────────────────────────────────────┘
                              │
                              │
┌────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                         │
├────────────────────────────────────────────────────────────────┤
│  Kong / AWS API Gateway                                        │
│  - Rate limiting (100 req/min per API key)                    │
│  - JWT auth validation (RS256)                                │
│  - Request/response logging                                   │
│  - API versioning (/v1, /v2)                                 │
│  - SSL/TLS termination                                        │
└────────────────────────────────────────────────────────────────┘
                              │
                              │
┌────────────────────────────────────────────────────────────────┐
│                    CORE SERVICE LAYER                          │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ Auth Service │  │ User Service │  │ Gym Service  │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │Booking Service│ │Payment Service│ │Membership Svc│        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │Trainer Svc   │  │Supplement Svc│  │Equipment Svc │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │AI/ML Engine  │  │Notification  │  │Search Engine │        │
│  │(Python FastAPI)│ │(BullMQ+Twilio)│ │(Elasticsearch)│        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │Analytics     │  │Revenue Engine│  │Integration   │        │
│  │(ClickHouse)  │  │              │  │(Webhooks)    │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                │
└────────────────────────────────────────────────────────────────┘
                              │
                              │
┌────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │PostgreSQL 16 │  │Redis Cluster │  │Elasticsearch │        │
│  │(Primary DB)  │  │(Cache/Pub-Sub)│ │(Search Index)│        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ClickHouse    │  │S3/Cloudflare │  │Message Queue │        │
│  │(Analytics DB)│  │R2 (Files)    │  │(BullMQ/Kafka)│        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                │
└────────────────────────────────────────────────────────────────┘
                              │
                              │
┌────────────────────────────────────────────────────────────────┐
│               INFRASTRUCTURE & OPERATIONS                      │
├────────────────────────────────────────────────────────────────┤
│  Kubernetes (EKS) | Docker Containers | Auto-scaling HPA      │
│  GitOps (ArgoCD) | GitHub Actions (CI/CD)                    │
│  Prometheus + Grafana (Monitoring) | Sentry (Error tracking)  │
│  CloudFlare CDN | AWS VPC | SSL/TLS certificates             │
└────────────────────────────────────────────────────────────────┘
```

### Module Wiring Diagram

```
USER AUTH (JWT)
    ├── Validates all requests
    ├── Refreshes tokens every 7 days
    └── Multi-role RBAC (gym_owner, trainer, customer, etc.)

GYM MANAGEMENT SERVICE
    ├── Creates gym profile
    ├── Manages branches, staff, inventory
    ├── Interfaces with → Trainer, Membership, Analytics
    └── Triggers → Notification Service (welcome email)

MEMBERSHIP SERVICE
    ├── Stores membership plans (fixed/PAYG/flex)
    ├── Manages subscriptions (active/expired/paused)
    ├── Triggers → Payment Service, Notification Service
    ├── Feeds → AI Engine (for churn prediction)
    └── Reports to → Analytics (MRR, ARR, churn)

BOOKING & SCHEDULING SERVICE
    ├── PT session bookings
    ├── Class bookings
    ├── Interfaces with → Trainer, Customer, Gym
    ├── Triggers → Payment Service, Notification Service
    └── Syncs to → Calendar integration (Google, Outlook)

PAYMENT SERVICE
    ├── Handles all transactions (Razorpay + Stripe)
    ├── Stores payment records in Database
    ├── Triggers → Revenue Engine (commission split)
    ├── Triggers → Notification Service (receipt, confirmation)
    └── Feeds → Analytics Dashboard

REVENUE ENGINE SERVICE
    ├── Calculates commission splits:
    │   ├── Gym gets %
    │   ├── FitCore Pro gets %
    │   ├── Trainer/Supplement Co gets %
    │   └── Maintenance provider gets %
    ├── Queues payouts for processing
    └── Reports to → Analytics (revenue by stream)

NOTIFICATION SERVICE (BullMQ + Twilio/Firebase)
    ├── Subscribes to all service events
    ├── SMS (Twilio)
    ├── WhatsApp (Gupshup)
    ├── Push (Firebase Cloud Messaging)
    ├── Email (SendGrid / AWS SES)
    └── In-app (WebSocket via Socket.io)

SEARCH & DISCOVERY SERVICE (Elasticsearch)
    ├── Indexes: Gyms, Trainers, Supplements, Articles
    ├── Faceted search (goal, price, location, rating)
    ├── Geospatial queries (PostGIS in PostgreSQL)
    ├── Auto-completion for trainer names, supplement names
    └── Powers → In-app discovery, SEO pages

AI/ML ENGINE (Python FastAPI)
    ├── Churn Prediction
    │   ├── Input: Login frequency, payment history, session attendance
    │   ├── Model: XGBoost classifier
    │   └── Output: Churn probability % for each customer
    ├── Workout Recommendation
    │   ├── Input: Goal, fitness level, past workouts, biometrics
    │   ├── Model: Collaborative filtering + rule engine
    │   └── Output: Personalized plan
    ├── Diet Recommendation
    │   ├── Input: BMI, goal, allergies, preferences
    │   ├── Model: Fine-tuned LLM (OpenAI)
    │   └── Output: Meal plan + macros
    ├── Offer Generation
    │   ├── Input: Churn probability, member value, segment
    │   ├── Model: Bayesian optimisation
    │   └── Output: Personalised discount offer
    └── Feeds results to → Customer app, Offer engine

ANALYTICS SERVICE (ClickHouse)
    ├── Ingests events from all services (event stream)
    ├── Real-time aggregations (MRR, DAU, churn rate)
    ├── Custom dashboards for:
    │   ├── Gym owner (revenue, members, trainer performance)
    │   ├── Trainer (earnings, client progress)
    │   ├── Company staff (territory, churn, NPS)
    │   └── Executive (company-wide metrics)
    └── Data export (CSV) for external analysis

SUPPLEMENT MARKETPLACE SERVICE
    ├── Manages company accounts
    ├── Product catalogue
    ├── Order routing to fulfillment
    ├── Commission tracking (gym, trainer, company)
    ├── Interfaces with → Payment, Revenue Engine
    └── Reports to → Analytics

EQUIPMENT & MAINTENANCE SERVICE
    ├── Equipment inventory management
    ├── Maintenance job dispatch
    ├── AMC lifecycle tracking
    ├── Technician assignment
    ├── Job card management
    └── Interfaces with → Payment, Revenue Engine, Notification

INTEGRATION SERVICE (Webhooks & APIs)
    ├── Accepts webhooks from:
    │   ├── Supplement company ERP (inventory updates)
    │   ├── Equipment manufacturer (machine telemetry)
    │   ├── Biometric device API (attendance events)
    │   ├── Calendar (Google, Outlook)
    │   ├── Health apps (Apple Health, Google Fit)
    │   └── Payment gateway (Razorpay events)
    └── Transforms and syncs data to appropriate services
```

### Data Flow Examples

#### Scenario 1: Customer Joins Gym

```
1. Customer opens app → Gym Discovery Service (searches for "yoga near me")
2. Search Service queries Elasticsearch → returns gyms + trainers
3. Customer selects gym, views membership plans
4. Clicks "Buy Membership" → Membership Service
5. Membership Service creates draft subscription
6. Customer selects payment method (UPI/card) → Payment Service
7. Payment Service calls Razorpay API → Payment confirmed
8. Membership Service marks subscription as ACTIVE
9. Triggers → Notification Service (welcome email + SMS)
10. Gym owner's dashboard updated in real-time (new member count +1)
11. Analytics Service logs event (member acquisition, plan type, price)
12. AI Engine updates customer profile for recommendations
13. Customer prompted to book first PT session (if interested)
```

#### Scenario 2: Trainer Recommends Supplement

```
1. Trainer in app → view client profile
2. Trainer sees client's goal ("muscle gain") + biometrics (low protein intake)
3. Clicks "Recommend Supplement" → Supplement Marketplace Service
4. Browses whey protein options
5. Recommends "Brand X Whey Protein" to client
6. Notification Service sends SMS to client: "Your trainer recommended Brand X..."
7. Client clicks link → adds supplement to cart
8. Client purchases (₹2,000) → Payment Service
9. Payment confirmed → Supplement Marketplace routes order to Brand X company
10. Revenue Engine splits: Gym 5%, Trainer 10%, FitCore 5%, Brand X 80%
11. Payouts queued for all parties (monthly settlement)
12. Analytics logs: supplement recommendation → purchase (conversion tracked)
13. Trainer's commission dashboard updates (earned ₹200 from this sale)
```

#### Scenario 3: Churn Prevention Flow

```
1. Customer's last gym visit: 20 days ago
2. Membership expires in 5 days
3. AI Engine nightly batch job:
   - Loads customer's activity history
   - Runs churn prediction model
   - Calculates: 85% probability of churn
4. Triggers alert in Gym Owner dashboard: "Customer at risk"
5. Notification Service queues messages:
   - SMS: "We miss you! Come back this week"
   - Push: "Renew now and get 20% off"
   - Email: Personalized offer + progress report
6. Offer Engine generates dynamic discount (based on LTV, churn risk)
7. If customer opens app + clicks offer → Payment Service
8. Membership renewed → Churn prevented!
9. Analytics logs: member retention, offer effectiveness
10. If customer ignores → Escalates to gym staff to personally follow up
```

---

## TECHNOLOGY STACK

### Backend

| Technology | Version | Purpose | Why Chosen |
|-----------|---------|---------|-----------|
| **Node.js** | 20 LTS | Runtime | Fast, event-driven, excellent for I/O operations |
| **NestJS** | 10+ | Web framework | Typescript, modular, DI container, OpenAPI auto-docs |
| **TypeScript** | 5+ | Language | Type safety, better developer experience |
| **PostgreSQL** | 16 | Primary DB | ACID, multi-tenancy (RLS), full-text search, JSON |
| **Redis** | 7 | Cache/Pub-Sub | Sub-millisecond latency, session storage, message queue |
| **BullMQ** | Latest | Job queue | Reliable job processing, retry logic, priority queues |
| **Prisma** | 5+ | ORM | Type-safe DB access, auto-migrations, relation queries |
| **Zod** | Latest | Validation | Runtime type validation, error messages |
| **Passport.js** | Latest | Auth | OAuth 2.0, JWT strategies, 500+ providers |
| **Socket.io** | Latest | Real-time | WebSocket with fallback, multi-room messaging |

### Frontend

| Technology | Version | Purpose | Why Chosen |
|-----------|---------|---------|-----------|
| **React Native** | 0.73+ | Mobile app | Single codebase (iOS + Android), OTA updates with Expo |
| **Expo** | Latest | React Native tooling | Managed service, no Xcode/Android Studio needed, EAS Build |
| **Next.js** | 14+ | Web framework | SSR for SEO, ISR for static pages, API routes, Vercel deploy |
| **React.js** | 18+ | UI library | Component-based, hooks, ecosystem |
| **TanStack Query** | v5 | State management | Caching, background refetching, devtools |
| **Zustand** | Latest | State store | Lightweight global state (auth, user preferences) |
| **Tailwind CSS** | Latest | Styling | Utility-first, rapid development, mobile-first |
| **React Hook Form** | Latest | Form handling | Lightweight, validation integration |
| **Chart.js / Recharts** | Latest | Data visualisation | Real-time charts, multiple chart types |
| **Framer Motion** | Latest | Animations | Smooth animations, gesture detection (mobile) |

### AI/ML

| Technology | Version | Purpose | Why Chosen |
|-----------|---------|---------|-----------|
| **Python** | 3.11+ | ML language | Rich ecosystem, NumPy/Pandas/Scikit-learn |
| **FastAPI** | Latest | Async API | Type hints, auto-documentation, async I/O |
| **PyTorch** | 2.0+ | Deep learning | Dynamic graphs, research-friendly, production-ready |
| **Scikit-learn** | Latest | Classical ML | XGBoost, LightGBM, standard algorithms |
| **XGBoost** | Latest | Churn prediction | Fast, interpretable, good for tabular data |
| **LightGBM** | Latest | Recommendation | Memory-efficient, fast training |
| **Pandas** | Latest | Data manipulation | DataFrames, time-series analysis |
| **NumPy** | Latest | Numerical computing | Array operations, linear algebra |
| **Optuna** | Latest | Hyperparameter tuning | Bayesian optimization, parallel trials |
| **MLflow** | Latest | Experiment tracking | Model versioning, comparison, production serving |

### Data & Search

| Technology | Version | Purpose | Why Chosen |
|-----------|---------|---------|-----------|
| **Elasticsearch** | 8+ | Full-text search | Distributed, faceted search, geo-queries |
| **ClickHouse** | Latest | Analytics DB | Columnar, billion-row queries in seconds, real-time aggregations |
| **Kafka** | 3.6+ | Event streaming | Distributed, durable, high-throughput (if scale demands) |
| **Apache Airflow** | 2.7+ | Workflow orchestration | DAG scheduling, monitoring, backfill |
| **Debezium** | Latest | CDC (Change Data Capture) | Real-time sync PostgreSQL → Elasticsearch |

### Infrastructure & DevOps

| Technology | Version | Purpose | Why Chosen |
|-----------|---------|---------|-----------|
| **Docker** | Latest | Containerization | Reproducible builds, consistent environments |
| **Kubernetes** | 1.28+ | Orchestration | Auto-scaling, self-healing, rolling updates |
| **Helm** | 3+ | K8s package manager | Templating, releases, rollback |
| **ArgoCD** | Latest | GitOps | Declarative, Git as source of truth |
| **GitHub Actions** | Latest | CI/CD | Workflows, PR reviews, auto-deploy |
| **Prometheus** | Latest | Metrics | Time-series metrics, alerting |
| **Grafana** | Latest | Visualization | Real-time dashboards, alerting |
| **Sentry** | Latest | Error tracking | Exception monitoring, alert on deployments |
| **AWS EKS** | Latest | Kubernetes service | Managed K8s, VPC integration, load balancers |
| **CloudFlare** | Latest | CDN / WAF | DDoS protection, SSL, caching, edge computing |
| **AWS S3 / Cloudflare R2** | Latest | Object storage | Media files, backups, log archival |

### Payment & Notifications

| Technology | Version | Purpose | Why Chosen |
|-----------|---------|---------|-----------|
| **Razorpay** | Latest API | Payments (India) | UPI, cards, wallets, EMI, low fees |
| **Stripe** | Latest API | Payments (Global) | International cards, ACH, strong docs |
| **Twilio** | Latest API | SMS | OTP, transactional SMS, reliable |
| **Gupshup / WhatsApp Business API** | Latest | WhatsApp messaging | Templates, notifications, high delivery rate |
| **Firebase Cloud Messaging** | Latest | Push notifications | iOS + Android, topic-based, geo-targeting |
| **SendGrid / AWS SES** | Latest | Email | Transactional, templates, deliverability |

### Maps & Location

| Technology | Version | Purpose | Why Chosen |
|-----------|---------|---------|-----------|
| **Google Maps Platform** | Latest | Maps & geolocation | Places API, directions, geocoding, Static maps |
| **PostGIS** | 3.3+ | Geospatial database | Postgres extension, distance queries, polygon search |
| **OpenStreetMap** | Latest | Alternative mapping | Free, open-source (fallback) |

### Video & Communication

| Technology | Version | Purpose | Why Chosen |
|-----------|---------|---------|-----------|
| **Agora.io** | Latest | Video calls | Low-latency, reliable, has recording |
| **Jitsi** | Self-hosted | Open-source video | No vendor lock-in, full control |
| **Twilio Flex** | Latest | Call center (future) | Agent routing, CRM integration |

### Authentication & Security

| Technology | Version | Purpose | Why Chosen |
|-----------|---------|---------|-----------|
| **JSON Web Tokens (JWT)** | RS256 | Token-based auth | Stateless, scalable, standard |
| **OAuth 2.0** | 2.0 | SSO | Google, Apple login |
| **bcryptjs** | Latest | Password hashing | Strong, slow hashing for security |
| **crypto** | Node.js built-in | Encryption | AES-256 for sensitive data |
| **OWASP** | Latest | Security standards | Guidelines for secure coding |
| **Snyk** | Latest | Dependency scanning | Vulnerability detection, remediation |

### Development Tools

| Technology | Purpose | Why Chosen |
|-----------|---------|-----------|
| **VSCode** | Code editor | Lightweight, excellent extensions |
| **Postman / Insomnia** | API testing | Request history, environments, automation |
| **Git** | Version control | Distributed, standard |
| **GitHub** | Repository hosting | Issues, PRs, actions, wiki |
| **Jira / Linear** | Project management | Sprints, burndowns, roadmap |
| **Figma** | Design tool | Collaborative, web-based, prototype to code |
| **Storybook** | Component library | Document, develop, test components |
| **Jest** | Unit testing | Snapshot testing, coverage reports |
| **Cypress / Playwright** | E2E testing | Browser automation, cross-browser testing |
| **Docker Desktop** | Local containerization | Develop in Docker locally |

---

## DATABASE SCHEMA

### Core Tables

#### 1. Users Table

```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url TEXT,
  date_of_birth DATE,
  gender VARCHAR(20),
  status VARCHAR(50) DEFAULT 'active', -- active, inactive, suspended, deleted
  
  -- OAuth
  google_id VARCHAR(255) UNIQUE,
  apple_id VARCHAR(255) UNIQUE,
  
  -- Preferences
  preferred_language VARCHAR(10) DEFAULT 'en',
  preferred_currency VARCHAR(3) DEFAULT 'INR',
  notifications_enabled BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  INDEX idx_tenant_email (tenant_id, email),
  INDEX idx_phone (phone)
);
```

#### 2. Roles & Permissions Table

```sql
CREATE TABLE roles (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL, -- gym_owner, trainer, customer, nutritionist, etc.
  description TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  role_id BIGINT NOT NULL,
  tenant_id BIGINT NOT NULL,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  UNIQUE (user_id, role_id, tenant_id)
);

CREATE TABLE permissions (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL, -- read_gyms, write_gyms, delete_members
  description TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE role_permissions (
  id BIGSERIAL PRIMARY KEY,
  role_id BIGINT NOT NULL,
  permission_id BIGINT NOT NULL,
  
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id),
  UNIQUE (role_id, permission_id)
);
```

#### 3. Gyms Table

```sql
CREATE TABLE gyms (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  owner_id BIGINT NOT NULL,
  
  -- Basic info
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL, -- for URLs
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  
  -- Address
  address_line_1 VARCHAR(255),
  address_line_2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Branding
  logo_url TEXT,
  cover_photo_url TEXT,
  description TEXT,
  
  -- Gym info
  established_year INT,
  total_capacity INT,
  equipment_count INT,
  trainer_count INT,
  
  -- Integration
  gmb_place_id VARCHAR(255), -- Google My Business
  
  -- Subscription
  subscription_plan_id BIGINT,
  subscription_status VARCHAR(50) DEFAULT 'active', -- active, trial, suspended, cancelled
  subscription_started_at TIMESTAMP,
  subscription_renews_at TIMESTAMP,
  
  -- Operating hours (JSONB)
  operating_hours JSONB DEFAULT '{"monday":"05:00-23:00","tuesday":"05:00-23:00"}',
  
  -- Features enabled
  biometric_enabled BOOLEAN DEFAULT false,
  supplement_marketplace_enabled BOOLEAN DEFAULT false,
  equipment_management_enabled BOOLEAN DEFAULT false,
  
  status VARCHAR(50) DEFAULT 'active',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (owner_id) REFERENCES users(id),
  FOREIGN KEY (subscription_plan_id) REFERENCES membership_plans(id),
  
  INDEX idx_tenant (tenant_id),
  INDEX idx_owner (owner_id),
  INDEX idx_city_state (city, state),
  INDEX idx_slug (slug),
  INDEX idx_location (latitude, longitude)
);
```

#### 4. Membership Plans Table

```sql
CREATE TABLE membership_plans (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  gym_id BIGINT NOT NULL,
  
  name VARCHAR(255) NOT NULL, -- "Gold Plan", "Flex PAYG"
  type VARCHAR(50) NOT NULL, -- fixed, payg, flex
  description TEXT,
  
  -- Pricing
  price_amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  
  -- Duration
  duration_days INT, -- 30 for monthly, null for PAYG
  sessions_included INT, -- null if unlimited
  
  -- Features (JSONB)
  features JSONB DEFAULT '{}', -- {pool: true, steam: true, trainer_included: 2}
  
  -- Billing
  auto_renew BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (gym_id) REFERENCES gyms(id),
  
  INDEX idx_gym_plan (gym_id, is_active)
);
```

#### 5. Memberships Table

```sql
CREATE TABLE memberships (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  gym_id BIGINT NOT NULL,
  customer_id BIGINT NOT NULL,
  plan_id BIGINT NOT NULL,
  
  -- Dates
  start_date DATE NOT NULL,
  end_date DATE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active', -- active, expired, paused, cancelled, suspended
  
  -- Payment
  price_paid DECIMAL(10, 2) NOT NULL,
  payment_id BIGINT,
  payment_method VARCHAR(50), -- card, upi, wallet
  
  -- Renewal
  auto_renew BOOLEAN DEFAULT true,
  renewal_date DATE,
  last_renewed_at TIMESTAMP,
  
  -- Pause
  paused_at TIMESTAMP,
  paused_until TIMESTAMP,
  
  -- PAYG specific
  wallet_balance DECIMAL(10, 2) DEFAULT 0, -- for PAYG members
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (gym_id) REFERENCES gyms(id),
  FOREIGN KEY (customer_id) REFERENCES users(id),
  FOREIGN KEY (plan_id) REFERENCES membership_plans(id),
  FOREIGN KEY (payment_id) REFERENCES payments(id),
  
  INDEX idx_customer_gym (customer_id, gym_id),
  INDEX idx_status (status),
  INDEX idx_renewal_date (renewal_date)
);
```

#### 6. Trainers Table

```sql
CREATE TABLE trainers (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  gym_id BIGINT, -- NULL if independent
  
  -- Profile
  bio TEXT,
  specialisations TEXT[],
  certifications JSONB DEFAULT '[]', -- [{name: "NASM", issued_date: "2020-01-01"}]
  experience_years INT,
  
  -- Pricing
  hourly_rate DECIMAL(10, 2),
  is_independent BOOLEAN DEFAULT false,
  
  -- Ratings
  rating DECIMAL(3, 2) DEFAULT 5, -- 0-5
  total_reviews INT DEFAULT 0,
  total_completed_sessions INT DEFAULT 0,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (gym_id) REFERENCES gyms(id),
  
  INDEX idx_gym_trainer (gym_id, status),
  INDEX idx_specialisations (specialisations)
);
```

#### 7. PT Sessions Table

```sql
CREATE TABLE pt_sessions (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  trainer_id BIGINT NOT NULL,
  customer_id BIGINT NOT NULL,
  gym_id BIGINT NOT NULL,
  
  -- Timing
  scheduled_at TIMESTAMP NOT NULL,
  duration_minutes INT NOT NULL,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  
  -- Status
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, in-progress, completed, cancelled, no-show
  
  -- Notes
  trainer_notes TEXT,
  exercises_done JSONB DEFAULT '[]', -- [{exercise: "chest_press", sets: 3, reps: 10, weight: 40}]
  
  -- Payment
  amount_due DECIMAL(10, 2),
  payment_id BIGINT,
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, completed, refunded
  
  -- Recording
  recording_url TEXT,
  recording_duration_seconds INT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (trainer_id) REFERENCES trainers(id),
  FOREIGN KEY (customer_id) REFERENCES users(id),
  FOREIGN KEY (gym_id) REFERENCES gyms(id),
  FOREIGN KEY (payment_id) REFERENCES payments(id),
  
  INDEX idx_trainer_date (trainer_id, scheduled_at),
  INDEX idx_customer_date (customer_id, scheduled_at),
  INDEX idx_status (status),
  INDEX idx_scheduled_at (scheduled_at)
);
```

#### 8. Workouts Table

```sql
CREATE TABLE workouts (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  customer_id BIGINT NOT NULL,
  trainer_id BIGINT,
  gym_id BIGINT NOT NULL,
  
  -- Date
  workout_date DATE NOT NULL,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  
  -- Details
  workout_type VARCHAR(50), -- chest, back, cardio, yoga, class
  exercises JSONB NOT NULL, -- [{exercise_id, sets, reps, weight, rest_seconds}]
  duration_minutes INT,
  difficulty_rating INT, -- 1-10
  notes TEXT,
  photos TEXT[], -- URLs
  
  -- AI flag
  ai_generated BOOLEAN DEFAULT false,
  ai_plan_id BIGINT, -- reference to AI-generated plan
  
  -- Mood & health
  mood VARCHAR(50), -- energetic, tired, motivated, unmotivated
  injury_flags TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (customer_id) REFERENCES users(id),
  FOREIGN KEY (trainer_id) REFERENCES trainers(id),
  FOREIGN KEY (gym_id) REFERENCES gyms(id),
  
  INDEX idx_customer_date (customer_id, workout_date),
  INDEX idx_workout_date (workout_date)
);
```

#### 9. Body Metrics Table

```sql
CREATE TABLE body_metrics (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  
  -- Date
  recorded_at DATE NOT NULL,
  
  -- Measurements
  weight_kg DECIMAL(5, 2),
  height_cm DECIMAL(5, 2),
  bmi DECIMAL(4, 2),
  body_fat_percentage DECIMAL(5, 2),
  muscle_mass_kg DECIMAL(5, 2),
  water_percentage DECIMAL(5, 2),
  
  -- Circumferences
  measurements JSONB DEFAULT '{}', -- {chest: 100, waist: 80, bicep: 35, thigh: 60}
  
  -- Photos
  photos JSONB DEFAULT '[]', -- [{url, taken_at, note}]
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  
  INDEX idx_user_date (user_id, recorded_at)
);
```

#### 10. Diet Plans Table

```sql
CREATE TABLE diet_plans (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  nutritionist_id BIGINT NOT NULL,
  customer_id BIGINT NOT NULL,
  
  -- Plan info
  name VARCHAR(255),
  description TEXT,
  
  -- Duration
  start_date DATE,
  end_date DATE,
  
  -- Targets
  daily_calorie_target INT,
  macros JSONB DEFAULT '{}', -- {protein_g: 150, carbs_g: 200, fat_g: 70}
  
  -- Meals
  meals JSONB NOT NULL, -- [{meal_type: "breakfast", foods: [...]}]
  
  -- Status
  status VARCHAR(50) DEFAULT 'active', -- active, completed, paused
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (nutritionist_id) REFERENCES users(id),
  FOREIGN KEY (customer_id) REFERENCES users(id),
  
  INDEX idx_customer_plan (customer_id, status),
  INDEX idx_nutritionist (nutritionist_id)
);
```

#### 11. Food Logs Table

```sql
CREATE TABLE food_logs (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  
  -- Date
  logged_at TIMESTAMP NOT NULL,
  meal_type VARCHAR(50), -- breakfast, lunch, snack, dinner
  
  -- Foods
  foods JSONB NOT NULL, -- [{food_id, quantity, unit, calories, macros}]
  total_calories INT,
  
  -- Macros
  macros JSONB DEFAULT '{}', -- {protein_g, carbs_g, fat_g}
  
  -- Metadata
  notes TEXT,
  photos TEXT[],
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  
  INDEX idx_user_date (user_id, logged_at),
  INDEX idx_logged_at (logged_at)
);
```

#### 12. Supplements Table

```sql
CREATE TABLE supplements (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  company_id BIGINT NOT NULL,
  
  -- Product info
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE,
  category VARCHAR(100), -- protein, bcaa, creatine, vitamin, etc.
  description TEXT,
  
  -- Pricing & stock
  price_amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  
  stock_type VARCHAR(50), -- dropship, physical
  physical_stock_qty INT, -- NULL if dropship
  
  -- Images
  images TEXT[],
  
  -- Nutritional info
  nutritional_facts JSONB DEFAULT '{}',
  ingredients TEXT[],
  allergen_warnings TEXT[],
  
  -- Certifications
  certifications JSONB DEFAULT '[]', -- [{name: "GMP", issuer, verified_at}]
  lab_report_urls TEXT[],
  
  -- Goals it serves
  goals TEXT[],
  
  status VARCHAR(50) DEFAULT 'active',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (company_id) REFERENCES users(id),
  
  INDEX idx_category (category),
  INDEX idx_company (company_id)
);
```

#### 13. Supplement Orders Table

```sql
CREATE TABLE supplement_orders (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  customer_id BIGINT NOT NULL,
  gym_id BIGINT,
  
  -- Order details
  order_number VARCHAR(50) UNIQUE,
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, shipped, delivered, returned, refunded
  
  -- Items
  items JSONB NOT NULL, -- [{supplement_id, quantity, unit_price}]
  subtotal_amount DECIMAL(10, 2),
  tax_amount DECIMAL(10, 2),
  shipping_amount DECIMAL(10, 2),
  total_amount DECIMAL(10, 2),
  
  -- Delivery
  delivery_address JSONB NOT NULL, -- {street, city, state, postal_code}
  delivered_at TIMESTAMP,
  
  -- Payment
  payment_id BIGINT,
  payment_status VARCHAR(50),
  
  -- Tracking
  tracking_number VARCHAR(100),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (customer_id) REFERENCES users(id),
  FOREIGN KEY (gym_id) REFERENCES gyms(id),
  FOREIGN KEY (payment_id) REFERENCES payments(id),
  
  INDEX idx_customer_order (customer_id, created_at),
  INDEX idx_status (status)
);
```

#### 14. Equipment Table

```sql
CREATE TABLE equipment (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  manufacturer_id BIGINT NOT NULL,
  gym_id BIGINT NOT NULL,
  
  -- Equipment details
  model_name VARCHAR(255) NOT NULL,
  serial_number VARCHAR(100) UNIQUE,
  equipment_type VARCHAR(100), -- treadmill, barbell, etc.
  
  -- Dates
  purchase_date DATE,
  warranty_expiry DATE,
  last_serviced_at TIMESTAMP,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active', -- active, under_maintenance, damaged, retired
  
  -- Specs (JSONB)
  specifications JSONB DEFAULT '{}',
  
  -- AMC
  amc_status VARCHAR(50), -- active, expired, no_amc
  amc_expiry DATE,
  amc_cost DECIMAL(10, 2),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (manufacturer_id) REFERENCES users(id),
  FOREIGN KEY (gym_id) REFERENCES gyms(id),
  
  INDEX idx_gym_status (gym_id, status),
  INDEX idx_amc_expiry (amc_expiry)
);
```

#### 15. Maintenance Jobs Table

```sql
CREATE TABLE maintenance_jobs (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  equipment_id BIGINT NOT NULL,
  gym_id BIGINT NOT NULL,
  technician_id BIGINT,
  
  -- Dates
  reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  scheduled_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Issue
  issue_description TEXT NOT NULL,
  urgency VARCHAR(50) DEFAULT 'normal', -- normal, high, emergency
  
  -- Status
  status VARCHAR(50) DEFAULT 'open', -- open, assigned, in_progress, completed, cancelled
  
  -- Work done
  work_done_notes TEXT,
  parts_used JSONB DEFAULT '[]', -- [{part_name, part_cost, qty}]
  labour_hours DECIMAL(5, 2),
  labour_cost DECIMAL(10, 2),
  total_cost DECIMAL(10, 2),
  
  -- Photos
  before_photos TEXT[],
  after_photos TEXT[],
  
  -- Rating
  technician_rating INT, -- 1-5
  technician_review TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (equipment_id) REFERENCES equipment(id),
  FOREIGN KEY (gym_id) REFERENCES gyms(id),
  FOREIGN KEY (technician_id) REFERENCES users(id),
  
  INDEX idx_gym_status (gym_id, status),
  INDEX idx_technician_scheduled (technician_id, scheduled_at),
  INDEX idx_status (status)
);
```

#### 16. Payments Table

```sql
CREATE TABLE payments (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  
  -- Entity
  entity_type VARCHAR(50) NOT NULL, -- membership, pt_session, supplement_order, equipment_lead, maintenance_job
  entity_id BIGINT NOT NULL,
  
  -- Amount
  amount_amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  
  -- Payment gateway
  gateway VARCHAR(50), -- razorpay, stripe
  gateway_txn_id VARCHAR(255) UNIQUE,
  gateway_order_id VARCHAR(255),
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed, refunded, disputed
  
  -- Refund
  refund_amount DECIMAL(10, 2) DEFAULT 0,
  refund_reason TEXT,
  refunded_at TIMESTAMP,
  
  -- Metadata
  metadata JSONB DEFAULT '{}', -- {gym_id, customer_id, plan_id, etc.}
  
  -- Reconciliation
  reconciled_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_gateway_txn (gateway, gateway_txn_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
```

#### 17. Notifications Table

```sql
CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  
  -- Channel
  channel VARCHAR(50) NOT NULL, -- sms, email, push, whatsapp, in_app
  
  -- Content
  type VARCHAR(100), -- membership_reminder, churn_alert, offer, etc.
  title VARCHAR(255),
  body TEXT,
  
  -- Payload (JSONB)
  payload JSONB DEFAULT '{}', -- {discount_code, gym_id, renewal_date, etc.}
  
  -- Scheduling
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, failed, bounced
  failure_reason TEXT,
  
  -- Engagement
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  
  INDEX idx_user_channel (user_id, channel),
  INDEX idx_scheduled_at (scheduled_at),
  INDEX idx_status (status)
);
```

#### 18. Audit Logs Table

```sql
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  user_id BIGINT,
  
  -- Action
  action VARCHAR(100), -- create, update, delete, login, payment, etc.
  
  -- Entity
  entity_type VARCHAR(50), -- gym, membership, user, payment
  entity_id BIGINT,
  
  -- Changes
  old_value JSONB,
  new_value JSONB,
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_user (user_id),
  INDEX idx_created_at (created_at)
);
```

#### 19. AI Recommendations Table

```sql
CREATE TABLE ai_recommendations (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  
  -- Type
  type VARCHAR(100), -- workout, diet, supplement, gym, trainer, offer
  
  -- Recommendation
  title VARCHAR(255),
  description TEXT,
  payload JSONB NOT NULL, -- {workout_plan_id, supplement_ids, discount_percentage, etc.}
  
  -- Confidence
  confidence_score DECIMAL(3, 2), -- 0-1
  reasoning TEXT, -- Why this recommendation
  
  -- Engagement
  shown_at TIMESTAMP,
  acted_on BOOLEAN DEFAULT false,
  acted_on_at TIMESTAMP,
  action_value DECIMAL(10, 2), -- $ value if purchase made
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  
  INDEX idx_user_type (user_id, type),
  INDEX idx_created_at (created_at)
);
```

#### 20. Loyalty Points Table

```sql
CREATE TABLE loyalty_points (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  gym_id BIGINT,
  
  -- Points
  points_amount INT NOT NULL,
  points_type VARCHAR(50), -- purchase, referral, milestone, bonus
  
  -- Redemption
  redeemed_at TIMESTAMP,
  redeemed_for TEXT, -- 'membership_discount_500', etc.
  
  -- Expiry
  expires_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (gym_id) REFERENCES gyms(id),
  
  INDEX idx_user_balance (user_id, redeemed_at)
);
```

#### 21. Tenants Table (for Multi-Tenancy)

```sql
CREATE TABLE tenants (
  id BIGSERIAL PRIMARY KEY,
  
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  
  -- Subscription
  plan VARCHAR(50), -- starter, growth, pro, enterprise
  subscription_status VARCHAR(50) DEFAULT 'active',
  
  -- Billing
  monthly_fee DECIMAL(10, 2),
  api_key VARCHAR(255) UNIQUE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_slug (slug)
);

-- Row-Level Security Policy (PostgreSQL 12+)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON users
  USING (tenant_id = CURRENT_SETTING('app.current_tenant_id')::bigint)
  WITH CHECK (tenant_id = CURRENT_SETTING('app.current_tenant_id')::bigint);
```

---

## API DESIGN PATTERNS

### REST Endpoint Structure

```
Base URL: https://api.fitcore.app/v1

Gyms
├── GET    /gyms                          List gyms (paginated, filterable)
├── POST   /gyms                          Create gym
├── GET    /gyms/{gym_id}                 Get gym details
├── PUT    /gyms/{gym_id}                 Update gym
├── DELETE /gyms/{gym_id}                 Delete gym
├── GET    /gyms/{gym_id}/members         List members
├── GET    /gyms/{gym_id}/trainers        List trainers
├── GET    /gyms/{gym_id}/analytics       Gym analytics (revenue, members, etc.)
└── POST   /gyms/{gym_id}/invitations     Invite trainers/staff

Memberships
├── GET    /memberships                   List my memberships
├── POST   /gyms/{gym_id}/memberships     Create membership (buy plan)
├── GET    /memberships/{membership_id}   Get membership details
├── PUT    /memberships/{membership_id}   Update (pause, upgrade, etc.)
├── POST   /memberships/{membership_id}/renew Renew membership
└── DELETE /memberships/{membership_id}   Cancel membership

Trainers
├── GET    /trainers                      Search trainers
├── GET    /trainers/{trainer_id}         Get trainer profile
├── PUT    /trainers/{trainer_id}         Update my trainer profile
├── GET    /trainers/{trainer_id}/clients List my clients
├── POST   /trainers/{trainer_id}/clients Add client
└── GET    /trainers/{trainer_id}/earnings Get earnings

PT Sessions
├── GET    /pt-sessions                   List PT sessions
├── POST   /trainers/{trainer_id}/pt-sessions Book PT session
├── GET    /pt-sessions/{session_id}      Get session details
├── PUT    /pt-sessions/{session_id}      Update session (trainer logs work)
├── POST   /pt-sessions/{session_id}/complete Complete session
└── POST   /pt-sessions/{session_id}/cancel Cancel session

Workouts
├── GET    /workouts                      List my workouts
├── POST   /workouts                      Log workout
├── GET    /workouts/{workout_id}         Get workout details
├── PUT    /workouts/{workout_id}         Update workout
└── DELETE /workouts/{workout_id}         Delete workout

Body Metrics
├── GET    /metrics                       List my metrics
├── POST   /metrics                       Record metric
├── GET    /metrics/progress              Progress chart data
└── POST   /metrics/{metric_id}/photos    Add photos

Diet Plans
├── GET    /diet-plans                    List my diet plans
├── POST   /diet-plans                    Create/request diet plan
├── GET    /diet-plans/{plan_id}          Get plan details
├── PUT    /diet-plans/{plan_id}          Update plan
└── GET    /diet-plans/{plan_id}/adherence Adherence tracking

Food Logs
├── GET    /food-logs                     List my food logs
├── POST   /food-logs                     Log food
├── GET    /food-logs/{log_id}            Get log details
└── PUT    /food-logs/{log_id}            Update log

Supplements
├── GET    /supplements                   List supplements
├── GET    /supplements/{supplement_id}   Get supplement details
├── POST   /supplements/{supplement_id}/orders Order supplement
└── GET    /supplements/recommendations   Get AI recommendations

Supplement Orders
├── GET    /supplement-orders             List orders
├── GET    /supplement-orders/{order_id}  Get order details
├── POST   /supplement-orders/{order_id}/cancel Cancel order
└── GET    /supplement-orders/{order_id}/tracking Track order

Equipment
├── GET    /equipment                     List equipment
├── POST   /equipment                     Add equipment
├── GET    /equipment/{equipment_id}      Get details
├── PUT    /equipment/{equipment_id}      Update equipment
└── GET    /equipment/{equipment_id}/maintenance-history Service history

Maintenance Jobs
├── GET    /maintenance-jobs              List jobs (for technician)
├── POST   /maintenance-jobs              Create job request (gym)
├── POST   /maintenance-jobs/{job_id}/accept Accept job (technician)
├── PUT    /maintenance-jobs/{job_id}     Update job status
├── POST   /maintenance-jobs/{job_id}/complete Complete job
└── POST   /maintenance-jobs/{job_id}/rate Rate technician

Payments
├── POST   /payments                      Create payment intent
├── GET    /payments/{payment_id}         Get payment status
├── POST   /payments/{payment_id}/verify  Verify payment (webhook)
└── POST   /payments/{payment_id}/refund  Refund payment

Search
├── GET    /search/gyms                   Search gyms by location, goal
├── GET    /search/trainers               Search trainers
├── GET    /search/supplements            Search supplements
└── GET    /search/articles               Search fitness articles

Analytics
├── GET    /analytics/mymembership        My membership analytics
├── GET    /analytics/mygym               Gym owner analytics
├── GET    /analytics/mytraining          Trainer analytics
└── GET    /analytics/company             Company-wide analytics

Auth
├── POST   /auth/register                 User registration
├── POST   /auth/login                    Login
├── POST   /auth/logout                   Logout
├── POST   /auth/refresh-token            Refresh JWT
├── POST   /auth/google                   Google OAuth login
├── POST   /auth/apple                    Apple OAuth login
├── POST   /auth/password-reset           Request password reset
└── POST   /auth/password-reset/{token}   Reset password
```

### Request/Response Format

#### Example: Create Membership

**Request:**
```bash
POST /v1/gyms/123/memberships
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "plan_id": 456,
  "customer_id": 789,
  "payment_method": "upi"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": 999,
    "gym_id": 123,
    "customer_id": 789,
    "plan_id": 456,
    "start_date": "2026-06-19",
    "end_date": "2026-07-19",
    "status": "active",
    "price_paid": 1299,
    "payment_id": 888,
    "auto_renew": true,
    "created_at": "2026-06-19T10:30:00Z"
  },
  "message": "Membership created successfully"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": {
    "code": "PAYMENT_FAILED",
    "message": "Payment gateway returned error",
    "details": {
      "gateway_error": "Insufficient balance in UPI account"
    }
  }
}
```

### Pagination

```
GET /v1/gyms?page=1&limit=20&sort=-created_at&filter=city:jaipur,status:active

Response:
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 500,
    "total_pages": 25,
    "has_next": true,
    "has_prev": false
  }
}
```

### Authentication

```
Authorization Header:
Authorization: Bearer <JWT_TOKEN>

JWT Payload:
{
  "sub": "<user_id>",
  "tenant_id": "<tenant_id>",
  "roles": ["gym_owner"],
  "email": "john@gym.com",
  "iat": 1624000000,
  "exp": 1624086400  // 24 hours
}

Refresh Token:
POST /v1/auth/refresh-token
{
  "refresh_token": "<REFRESH_TOKEN>"
}
```

---

## DEVELOPMENT ROADMAP

### Phase 0: Discovery & Foundation (Weeks 1-4)

**Deliverables:**
- ✓ UI/UX wireframes for all 8 roles
- ✓ Database schema (PostgreSQL)
- ✓ API contracts (OpenAPI 3.1 spec)
- ✓ Design system (Figma)
- ✓ Infrastructure setup (AWS, GitHub, Razorpay sandbox)
- ✓ Project management setup (Jira, Linear)
- ✓ Team onboarding & tooling

**Team:** 3 people (PM, Designer, Tech Lead)

**Weekly Milestones:**
- Week 1: Wireframes finalized, database schema drafted
- Week 2: Database schema finalized, API spec completed, AWS infrastructure set up
- Week 3: Design system in Figma, frontend component library started
- Week 4: Team fully onboarded, local development environment ready

---

### Phase 1: MVP Core (Months 2-4)

**Goal:** Gym owner + customer can sign up and manage basic memberships

**Deliverables:**
1. **Authentication System**
   - JWT-based auth with refresh tokens
   - Email + password registration
   - Google & Apple OAuth
   - Forgot password flow

2. **Gym Management**
   - Gym profile creation
   - Member onboarding
   - Membership plan creation
   - Basic dashboard (active members, revenue this month)

3. **Membership & Billing**
   - Razorpay integration (UPI, cards, wallets)
   - Fixed plan subscription
   - Auto-renewal
   - Invoice generation

4. **Customer App**
   - Sign up with goal selection
   - Browse local gyms (GPS-based)
   - Buy membership
   - View membership status & days left

5. **Notifications**
   - SMS reminders (Twilio)
   - Email confirmations
   - Push notifications (Firebase)

6. **Analytics**
   - Basic gym dashboard (members, revenue, trends)
   - PostgreSQL queries only (no ClickHouse yet)

7. **Mobile App** (React Native)
   - Authentication
   - Gym discovery
   - Membership management
   - Home screen

**Tech Stack Used:**
- Backend: Node.js + NestJS, PostgreSQL, Redis
- Frontend: Next.js for web, React Native for mobile
- Payments: Razorpay (test mode)
- Notifications: Twilio SMS, Firebase

**Testing Coverage:** 60% unit tests, 20% integration tests

**Team:** 6 people
- 1 PM, 1 Designer, 2 Backend, 2 Frontend

**End-of-Phase Metrics:**
- 3 pilot gyms onboarded
- 100+ members using app
- 95%+ payment success rate
- <2 second page load time

---

### Phase 2: Marketplace Layer (Months 5-7)

**Goal:** Connect trainers, supplement companies, equipment manufacturers

**Deliverables:**
1. **Trainer Management**
   - Trainer profiles (certifications, specialisations)
   - PT session scheduling
   - Client portfolio
   - Earnings dashboard

2. **Supplement Marketplace**
   - Supplement company onboarding
   - Zero-inventory product showcase
   - Customer supplement ordering
   - Dropship order routing
   - Commission tracking

3. **Equipment & Maintenance**
   - Equipment inventory
   - Maintenance job board
   - Technician assignment
   - Job card completion

4. **Biometric Integration**
   - Suprema/ZKTeco device SDK integration
   - QR code entry fallback
   - Attendance logging

5. **Local SEO**
   - Google My Business sync
   - Schema.org markup
   - City × category landing pages

6. **Advanced Features**
   - Video consultation setup (Jitsi backend)
   - Nutritionist profiles
   - Diet plan basic builder

**Testing:** 70% unit, 40% integration, 20% E2E

**Team:** 8 people (add 1 Backend, 1 Frontend, 1 DevOps)

**End-of-Phase Metrics:**
- 10 pilot gyms, 2 supplement companies, 5 trainers
- 500+ app users
- 100 supplement orders processed
- 50 PT sessions booked

---

### Phase 3: AI & Intelligence (Months 8-10)

**Goal:** Smart retention, personalization, and analytics

**Deliverables:**
1. **AI/ML Models**
   - Churn prediction (XGBoost)
   - Workout recommendations (collaborative filtering)
   - Diet recommendations (LLM-based)
   - Offer generation (Bayesian optimization)

2. **Advanced Analytics**
   - ClickHouse data warehouse
   - Real-time MRR/ARR dashboards
   - Cohort analysis
   - Custom report builder

3. **Churn Prevention**
   - Auto-send renewal reminders with personalized offers
   - Win-back campaigns for lapsed members
   - Birthday offers
   - Monthly progress reports

4. **Recommendation Engine**
   - Gym recommendations for customers
   - Trainer recommendations
   - Supplement recommendations (by trainer, by goal)
   - Workout plan auto-generation

5. **White-Label**
   - Gym-branded mobile app builder
   - Custom domain support
   - Branded emails, SMS

**Testing:** 80% unit, 60% integration, 40% E2E, ML model evaluation

**Team:** 8 people (add 1 ML engineer)

**End-of-Phase Metrics:**
- 20 gyms, 500+ active members
- 40% improvement in renewal rate (with AI offers)
- 100+ workout recommendations generated
- 50,000+ events in ClickHouse
- <500ms API response time at p95

---

### Phase 4: Scale & Polish (Months 11-12)

**Goal:** Production-grade reliability and enterprise features

**Deliverables:**
1. **Scalability**
   - Kubernetes setup with auto-scaling
   - Database read replicas
   - Redis clustering
   - API rate limiting & caching

2. **Enterprise Features**
   - Franchise management (multi-branch)
   - Advanced RBAC
   - Audit logging
   - SLA tracking for support

3. **Video Consultations**
   - Agora.io integration
   - PT/nutritionist video bookings
   - Session recording

4. **Health Integrations**
   - Apple Health sync
   - Google Fit sync
   - Mi Band / Fitbit sync

5. **Multi-Language & Currency**
   - Spanish, Hindi, Gujarati support
   - USD, EUR, GBP currency support

6. **Legal & Compliance**
   - E-signature integration (DocuSign)
   - GDPR/DPDP compliance module
   - Data export & deletion

7. **Security Hardening**
   - Penetration testing
   - OWASP Top 10 remediation
   - SSL certificate pinning (mobile)

8. **Performance Optimization**
   - Lighthouse score >90
   - Mobile app <30MB
   - API response time <200ms at p99

**Testing:** 85% unit, 70% integration, 60% E2E, security testing

**Team:** 10 people (add QA, Security engineer)

**End-of-Phase Metrics:**
- 50 gyms, 3,000+ active members
- 4.5+ app store rating (1000+ reviews)
- 99.95% uptime
- <100ms API response time at p95
- Zero critical security vulnerabilities

---

### Phase 5: Expansion (Month 13+)

**Goal:** International expansion and advanced features

**Deliverables:**
1. **International Payments**
   - Stripe integration (Visa, Mastercard, ACH)
   - PayPal support
   - Local payment methods per country

2. **IoT Equipment Telemetry**
   - Smart treadmill/barbell integration
   - Predictive maintenance alerts
   - Usage analytics

3. **B2B Data Intelligence**
   - Industry benchmarks API
   - Anonymized insights for supplement/equipment companies
   - Subscription tier pricing

4. **Advanced Scheduling**
   - Group class scheduling with auto-waitlists
   - Trainer shift optimization (ML)
   - Facility capacity planning

5. **Marketplace Expansion**
   - Third-party app integrations (Shopify, WooCommerce)
   - Partner API programme
   - Custom integrations

6. **Regional Expansion**
   - South Asia (Pakistan, Bangladesh, Sri Lanka)
   - Southeast Asia (Thailand, Vietnam, Philippines)
   - Middle East (UAE, Saudi Arabia)

**Team:** 12+ people (Regional teams, partnerships)

---

## SECURITY & COMPLIANCE

### Authentication & Authorization

```typescript
// JWT Token Structure
{
  "sub": "user_123",                    // User ID
  "tenant_id": "gym_456",               // Gym/Company ID
  "roles": ["gym_owner"],               // User roles
  "email": "owner@gym.com",
  "permissions": ["read:members", "write:members"],
  "iat": 1624000000,                    // Issued at
  "exp": 1624086400,                    // Expires in 24h
  "refresh_exp": 1626678400             // Refresh expires in 30d
}

// Signing: RS256 (RSA public-private key pair)
// Key rotation: Every 30 days
// Token storage (mobile): Secure enclave (iOS), Keystore (Android)
// Token refresh: Automatic 15 mins before expiry
```

### Data Encryption

```typescript
// At-Rest Encryption
- Database: AES-256 for sensitive columns (passwords, SSNs, bank details)
- S3/R2: Default encryption enabled
- Backups: Encrypted with customer master key (CMK)

// In-Transit Encryption
- All API calls: TLS 1.3 minimum
- Internal services: mTLS (mutual TLS)
- Certificate pinning: Mobile apps pin public key

// Password Hashing
- Algorithm: bcrypt with salt rounds = 12
- Never store plain passwords
- Forgot password: Secure token (32 bytes random, 1-hour expiry)
```

### Multi-Tenancy Isolation

```sql
-- Row-Level Security (PostgreSQL)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_users ON users
  USING (tenant_id = CURRENT_SETTING('app.current_tenant_id')::bigint)
  WITH CHECK (tenant_id = CURRENT_SETTING('app.current_tenant_id')::bigint);

-- Set tenant before each request
SET app.current_tenant_id = '123';

-- If code tries to access another tenant, RLS blocks it
SELECT * FROM users; -- Only returns users where tenant_id = 123
```

### Compliance

**GDPR (EU)**
- Right to data access: Export all personal data as JSON/CSV
- Right to erasure: Full deletion with 30-day grace period
- Data processing agreement signed
- Privacy policy updated

**India DPDP Act 2023**
- Consent mechanism for data collection
- Purpose limitation (only use data for stated purpose)
- Data retention policy (delete after 3 years if inactive)
- Breach notification within 72 hours

**PCI-DSS**
- Never store raw card details
- Delegate to Razorpay & Stripe
- Use tokenization for recurring charges
- Annual compliance audit

### Security Checklist

```
[ ] OAuth 2.0 + JWT with RS256
[ ] Password hashing with bcrypt (12 rounds)
[ ] Rate limiting: 100 requests/min per API key
[ ] Input validation (Zod) on every endpoint
[ ] SQL injection prevention: Parameterized queries only
[ ] CSRF tokens for state-changing requests
[ ] CORS: Whitelist specific domains
[ ] OWASP Top 10 remediation
[ ] Security headers: CSP, X-Frame-Options, X-Content-Type-Options
[ ] Secrets management: AWS Secrets Manager (no hardcoding)
[ ] Dependency scanning: Snyk weekly
[ ] Code review: Mandatory for all PRs
[ ] Penetration testing: Quarterly
[ ] Security incident response plan: Documented
[ ] Audit logging: All sensitive actions logged
[ ] Data residency: Comply with local laws (India = Indian datacenters)
```

---

## RISK MITIGATION

### High-Risk Items

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| **Data breach / DPDP violation** | Medium | Critical | AES-256 encryption, TLS 1.3, quarterly VAPT, DPO hired |
| **Payment gateway downtime** | Low | High | Razorpay + Stripe fallback, circuit breaker pattern, idempotent APIs |
| **Biometric device vendor lock-in** | Medium | Medium | Abstract via adapter pattern, support 3+ vendors from day 1 |
| **Gym anchor churn** | Low | High | White-label offering, franchise tools, dedicated CSM for chains >500 members |
| **AI model accuracy issues** | Medium | Medium | Human-in-loop validation, trainer override always available, offline fallback |
| **Supplement company regulatory issues** | Medium | High | Mandatory FSSAI upload, automated cert checks, legal team review |
| **Scalability at 1M+ users** | Low (future) | High | K8s HPA, read replicas, Elasticsearch sharding, CDN for assets |
| **Field sales underperformance** | Medium | Medium | GPS verification, daily KPI dashboards, incentive engine |
| **Trainer off-platform deals** | High | Medium | Commission transparency, customer reviews on platform, legal terms |
| **GST compliance (multi-state India)** | High | Medium | Tax engine (Avalara), HSN code mapping, audit trail |

---

## GETTING STARTED

### Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/yourcompany/fitcore-pro.git
cd fitcore-pro

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local
# Edit .env.local with:
DATABASE_URL=postgres://localhost/fitcore_dev
REDIS_URL=redis://localhost:6379
RAZORPAY_KEY=<test_key>
JWT_SECRET=<random_key>

# 4. Start PostgreSQL & Redis
docker-compose up -d postgres redis

# 5. Run database migrations
npm run migrate

# 6. Seed sample data
npm run seed

# 7. Start backend server
npm run dev:backend
# Server runs on http://localhost:3000

# 8. Start frontend (in another terminal)
cd apps/web
npm run dev
# App runs on http://localhost:3001

# 9. Start mobile app (in another terminal)
cd apps/mobile
expo start
# Scan QR code with Expo app
```

### Project Structure

```
fitcore-pro/
├── apps/
│   ├── backend/              # NestJS API
│   │   ├── src/
│   │   │   ├── auth/         # Authentication module
│   │   │   ├── gyms/         # Gym management
│   │   │   ├── memberships/  # Membership & billing
│   │   │   ├── trainers/     # Trainer management
│   │   │   ├── bookings/     # PT sessions, class bookings
│   │   │   ├── payments/     # Payment processing
│   │   │   ├── supplements/  # Supplement marketplace
│   │   │   ├── equipment/    # Equipment & maintenance
│   │   │   ├── ai/           # AI/ML service calls
│   │   │   ├── notifications/# SMS, email, push
│   │   │   ├── search/       # Elasticsearch queries
│   │   │   ├── analytics/    # ClickHouse queries
│   │   │   ├── common/       # Shared utilities
│   │   │   └── main.ts       # Entry point
│   │   ├── test/             # Test files
│   │   ├── docker/           # Dockerfile
│   │   └── package.json
│   │
│   ├── web/                  # Next.js web app
│   │   ├── app/              # Next.js 14 app router
│   │   │   ├── (auth)/       # Auth pages (login, signup)
│   │   │   ├── (dashboard)/  # Dashboard layouts
│   │   │   │   ├── gym-owner/
│   │   │   │   ├── trainer/
│   │   │   │   └── admin/
│   │   │   ├── gyms/         # Gym discovery pages
│   │   │   └── api/          # API routes
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Utilities
│   │   ├── styles/           # CSS/Tailwind
│   │   └── package.json
│   │
│   └── mobile/               # React Native / Expo
│       ├── app/              # Expo router (similar to Next.js)
│       │   ├── (auth)/       # Auth screens
│       │   ├── (tabs)/       # Bottom tab navigation
│       │   │   ├── discover/
│       │   │   ├── gym/
│       │   │   ├── trainer/
│       │   │   └── profile/
│       │   └── index.tsx      # Root layout
│       ├── components/       # React Native components
│       ├── hooks/            # Custom hooks
│       ├── lib/              # Utilities
│       ├── assets/           # Images, fonts
│       └── package.json
│
├── services/
│   ├── ai-ml/                # Python FastAPI service
│   │   ├── models/           # ML models (pickle files)
│   │   ├── routes/
│   │   │   ├── churn.py
│   │   │   ├── recommendations.py
│   │   │   └── offers.py
│   │   ├── requirements.txt
│   │   └── main.py
│   │
│   └── biometric/            # Biometric device SDK wrapper
│       ├── suprema/
│       ├── zkteco/
│       └── hikvision/
│
├── infrastructure/
│   ├── k8s/                  # Kubernetes manifests
│   │   ├── backend.yaml
│   │   ├── postgres.yaml
│   │   ├── redis.yaml
│   │   └── ingress.yaml
│   ├── terraform/            # AWS infrastructure as code
│   │   ├── main.tf
│   │   ├── rds.tf            # PostgreSQL RDS
│   │   ├── elasticache.tf    # Redis cluster
│   │   └── eks.tf            # EKS cluster
│   └── docker-compose.yml    # Local dev environment
│
├── docs/
│   ├── API.md                # API documentation
│   ├── ARCHITECTURE.md       # System design
│   ├── DEPLOYMENT.md         # Deployment guide
│   └── CONTRIBUTING.md       # Contribution guidelines
│
├── .github/
│   └── workflows/            # GitHub Actions CI/CD
│       ├── test.yml          # Run tests on PR
│       ├── deploy-dev.yml    # Deploy to dev on main
│       └── deploy-prod.yml   # Manual deploy to production
│
├── .env.example              # Example environment variables
├── .gitignore
├── docker-compose.yml        # Postgres + Redis for local dev
├── README.md
└── package.json              # Root monorepo package.json
```

### Env Variables

```bash
# Backend (.env.local)
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgres://user:password@localhost:5432/fitcore_dev
DATABASE_POOL_SIZE=20

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRY=24h
REFRESH_TOKEN_EXPIRY=30d

# Payments
RAZORPAY_KEY=rzp_test_xxxxxxxxx
RAZORPAY_SECRET=xxxxxxxxxxx
STRIPE_SECRET=sk_test_xxxxxxxx
STRIPE_PUBLISHABLE=pk_test_xxxxxxx

# Notifications
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890

FIREBASE_PROJECT_ID=fitcore-pro
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Google Services
GOOGLE_MAPS_API_KEY=xxxxx
GOOGLE_OAUTH_CLIENT_ID=xxxxx
GOOGLE_OAUTH_CLIENT_SECRET=xxxxx

# AWS (Deployment)
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx

# Deployment
APP_URL=http://localhost:3000
WEB_URL=http://localhost:3001
```

### Running Tests

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests (Cypress)
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Deployment

```bash
# Deploy to staging (AWS ECS)
npm run deploy:staging

# Deploy to production
npm run deploy:production

# Check deployment status
npm run deploy:status

# Rollback last deployment
npm run deploy:rollback
```

---

## APPENDIX: Glossary

- **PAYG:** Pay-As-You-Go subscription model
- **PT:** Personal Training session
- **AMC:** Annual Maintenance Contract
- **GMB:** Google My Business
- **MRR:** Monthly Recurring Revenue
- **ARR:** Annual Recurring Revenue
- **LTV:** Lifetime Value of customer
- **CAC:** Customer Acquisition Cost
- **RLS:** Row-Level Security (PostgreSQL)
- **JWT:** JSON Web Token
- **OAuth:** Open Authentication standard
- **MLModel:** Machine Learning predictive model
- **ClickHouse:** Columnar time-series database
- **Elasticsearch:** Full-text search engine
- **Kubernetes:** Container orchestration platform
- **SLA:** Service Level Agreement

---

**Document Version:** 1.0  
**Last Updated:** June 2026  
**Status:** Production-Ready Architecture
