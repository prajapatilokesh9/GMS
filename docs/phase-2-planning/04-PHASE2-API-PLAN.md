# Phase 2 API Expansion Plan

## Module Inventory

| Module | Path Prefix | Phase 1 Foundation |
|--------|-------------|-------------------|
| Membership & Billing | `/memberships` | Auth, Gym, RBAC |
| Supplement Marketplace | `/supplements` | Auth, Gym, Payments |
| Personal Training | `/pt-sessions` | Auth, Gym, Trainer |
| Equipment & AMC | `/equipment` | Auth, Gym |
| Nutritionist | `/nutrition` | Auth, User, Gym |
| Maintenance | `/maintenance` | Auth, Gym, Events |
| AI/ML | `/ai` | Auth, Events, Analytics |
| Loyalty & Growth | `/loyalty` | Auth, User, Gym |
| Company Staff | `/staff` | Auth, RBAC, Gym |

## Endpoint Inventory

### Membership & Billing (`/memberships`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/memberships` | List my memberships |
| POST | `/gyms/{id}/memberships` | Purchase plan |
| GET | `/memberships/{id}` | Get details |
| PUT | `/memberships/{id}` | Pause/upgrade/cancel |
| POST | `/memberships/{id}/renew` | Manual renew |
| GET | `/memberships/{id}/invoices` | Invoice history |

### Supplements (`/supplements`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/supplements` | Browse catalogue (filter: goal, brand) |
| GET | `/supplements/{id}` | Product details |
| POST | `/supplements/{id}/order` | Place order |
| GET | `/orders` | My orders |
| GET | `/orders/{id}` | Order details + tracking |
| POST | `/orders/{id}/return` | Return request |

### PT Sessions (`/pt-sessions`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/pt-sessions` | List sessions |
| POST | `/trainers/{id}/pt-sessions` | Book session |
| GET | `/pt-sessions/{id}` | Session details |
| PUT | `/pt-sessions/{id}` | Log exercises (trainer) |
| POST | `/pt-sessions/{id}/complete` | Complete session |
| POST | `/pt-sessions/{id}/cancel` | Cancel |

### Equipment (`/equipment`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/equipment` | List gym equipment |
| POST | `/equipment` | Add equipment |
| GET | `/equipment/{id}` | Details + AMC status |
| PUT | `/equipment/{id}` | Update |
| POST | `/equipment/{id}/service` | Request service |
| GET | `/equipment/{id}/amc` | AMC details |

### Maintenance (`/maintenance`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/maintenance/jobs` | Job board (technician) |
| POST | `/maintenance/jobs` | Create job (gym) |
| GET | `/maintenance/jobs/{id}` | Job card |
| PUT | `/maintenance/jobs/{id}` | Update status |
| POST | `/maintenance/jobs/{id}/complete` | Submit job card |
| GET | `/maintenance/technicians` | Technician directory |

### Nutrition (`/nutrition`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/nutrition/plans` | My diet plans |
| POST | `/nutrition/plans` | Create plan (nutritionist) |
| GET | `/nutrition/plans/{id}` | Plan details |
| POST | `/nutrition/consultations` | Book consultation |
| POST | `/nutrition/food-logs` | Log meal |
| GET | `/nutrition/food-logs` | My logs |

### AI/ML (`/ai`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ai/recommendations` | Personalised (workout/diet/supp) |
| GET | `/ai/churn-risk` | My churn probability |
| GET | `/ai/offers` | Personalised discounts |
| POST | `/ai/recommendations/{id}/act` | Track engagement |

### Loyalty (`/loyalty`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/loyalty/points` | Balance + history |
| GET | `/loyalty/leaderboard` | Gym leaderboard |
| POST | `/loyalty/refer` | Referral link |
| GET | `/loyalty/badges` | My badges |

### Company Staff (`/staff`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/staff/territory` | Area dashboard (manager) |
| POST | `/staff/visits` | Log visit (field officer) |
| GET | `/staff/nps` | NPS surveys |
| GET | `/staff/commissions` | Commission calc |

## Auth & RBAC Requirements

| Module | Required Role | Permission |
|--------|---------------|------------|
| Memberships | customer, gym_owner | `membership:read`, `membership:create` |
| Supplements | customer, gym_owner | `supplement:read`, `supplement:order` |
| PT Sessions | trainer, customer | `pt:read`, `pt:book`, `pt:log` |
| Equipment | gym_owner, technician | `equipment:read`, `equipment:manage` |
| Maintenance | gym_owner, technician | `maintenance:read`, `maintenance:dispatch` |
| Nutrition | nutritionist, customer | `nutrition:read`, `nutrition:plan` |
| AI | customer, gym_owner | `ai:read` (scoped to tenant) |
| Loyalty | customer, gym_owner | `loyalty:read`, `loyalty:manage` |
| Staff | area_manager, field_officer | `staff:read`, `staff:manage` |

### Auth Patterns
- JWT Bearer token (RS256) on all endpoints
- Tenant isolation via `tenant_id` in token payload
- Rate limiting: 100 req/min per API key
- OAuth 2.0 (Google/Apple) for customer login