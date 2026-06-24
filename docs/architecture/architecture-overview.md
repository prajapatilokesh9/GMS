# FitCore Pro Phase 1 Architecture Documentation

This document provides the architecture overview for FitCore Pro Phase 1, including system context, container diagrams, and API flow documentation.

## Overview

FitCore Pro is a multi-sided fitness SaaS platform that connects gym owners with customers. The Phase 1 implementation includes the core platform components needed for gym onboarding, management, and operations.

## System Context Diagram

```mermaid
diagram RL
    direction LR
    
    subgraph "FitCore Pro Users"
        direction TB
        U1[End Users] -->|Web/Mobile App| F1[FitCore Pro Frontend]
        U2[Gym Owners] -->|Web Admin Portal| F1
        U3[Admin Staff] -->|Web Admin Portal| F1
    end
    
    subgraph "Frontend"
        F1[FitCore Pro Frontend] -->|HTTPS| F2[API Gateway]
    end
    
    subgraph "API Layer"
        F2 -->|HTTPS| A1[Backend API]
    end
    
    subgraph "Backend Services"
        A1 --> DB1[PostgreSQL Database]
        A1 --> C1[Redis Cache]
        A1 --> E1[BullMQ Event Bus]
        A1 --> S1[S3 Storage]
        A1 --> N1[Notification Service]
    end
    
    subgraph "Infrastructure"
        DB1 --> I1[AWS RDS]
        C1 --> I2[AWS ElastiCache]
        E1 --> I3[AWS MQ / Redis]
        S1 --> I4[AWS S3]
        N1 --> I5[AWS SNS/SQS]
    end
    
    subgraph "External Services"
        U1 --> Ext1[Third-party APIs]
        U2 --> Ext2[Payment Processors]
        U3 --> Ext3[Monitoring Tools]
    end
    
    style FitCore Pro Users fill:#f0f8ff,stroke:#333,stroke-width:2
    style Frontend fill:#e6f3ff,stroke:#333,stroke-width:2
    style API Layer fill:#cce7ff,stroke:#333,stroke-width:2
    style Backend Services fill:#99d6ff,stroke:#333,stroke-width:2
    style Infrastructure fill:#66c2ff,stroke:#333,stroke-width:2
    style External Services fill:#e6f3ff,stroke:#333,stroke-width:2
```

## Container Diagram

```mermaid
diagram TB
    direction TB
    
    subgraph "Frontend Layer"
        subgraph "FitCore Pro Web App"
            FE1[Next.js App]
            FE2[React Components]
            FE3[State Management]
            FE4[Authentication]
            FE5[API Client]
        end
    end
    
    subgraph "API Layer"
        subgraph "Backend Services"
            BE1[Express.js Server]
            BE2[Auth Service]
            BE3[Gym Service]
            BE4[Event Service]
            BE5[Notification Service]
            BE6[Document Service]
            BE7[User Service]
        end
        
        subgraph "Core Components"
            CC1[Database Layer]
            CC2[Cache Layer]
            CC3[Event Bus]
            CC4[Security Middleware]
            CC5[Rate Limiting]
            CC6[Validation]
        end
    end
    
    subgraph "Data Layer"
        subgraph "Primary Storage"
            DB1[PostgreSQL]
            DB2[Redis]
        end
        
        subgraph "Event Storage"
            E1[BullMQ Queues]
            E2[Event Logs]
        end
        
        subgraph "File Storage"
            F1[S3/MinIO]
            F2[Upload Directory]
        end
    end
    
    subgraph "External Integrations"
        Ext1[AWS Services]
        Ext2[Third-party APIs]
        Ext3[Monitoring Tools]
    end
    
    %% Frontend to API
    FE5 --> BE1
    FE4 --> BE1
    
    %% API Service Dependencies
    BE1 --> BE2
    BE1 --> BE3
    BE1 --> BE4
    BE1 --> BE5
    BE1 --> BE6
    BE1 --> BE7
    
    BE2 --> CC1
    BE2 --> CC2
    BE2 --> CC4
    BE2 --> CC5
    BE2 --> CC6
    
    BE3 --> CC1
    BE3 --> CC2
    BE3 --> BE4
    BE3 --> CC5
    BE3 --> CC6
    
    BE4 --> CC1
    BE4 --> CC3
    BE4 --> E1
    BE4 --> E2
    
    BE5 --> CC1
    BE5 --> CC2
    BE5 --> Ext1
    
    BE6 --> CC1
    BE6 --> F1
    
    BE7 --> CC1
    BE7 --> CC2
    BE7 --> CC4
    
    %% Data Layer Connections
    CC1 --> DB1
    CC2 --> DB2
    CC3 --> E1
    CC3 --> E2
    F1 --> F2
    
    %% External Integrations
    BE5 --> Ext1
    BE4 --> Ext2
    BE1 --> Ext3
    
    style Frontend Layer fill:#f0f8ff,stroke:#333,stroke-width:2
    style API Layer fill:#e6f3ff,stroke:#333,stroke-width:2
    style Data Layer fill:#cce7ff,stroke:#333,stroke-width:2
    style External Integrations fill:#e6f3ff,stroke:#333,stroke-width:2
```

## Component Details

### Frontend Components

#### FitCore Pro Web App
- **Next.js 16.2.9**: React framework for the web interface
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Styling framework
- **React Router**: Client-side routing
- **Axios**: HTTP client for API communication

#### Key Features
- **Authentication**: JWT-based auth with refresh tokens
- **Role-based Access Control**: Super Admin, Gym Owner, Staff, Customer roles
- **Multi-tenancy**: Tenant isolation at database and application level
- **Real-time Updates**: WebSocket support for live updates
- **Responsive Design**: Mobile-first approach

### Backend Services

#### Express.js Server
- **Framework**: Express.js for Node.js
- **TypeScript**: Type-safe server implementation
- **Middleware**: Helmet (security), CORS, Morgan (logging)
- **Error Handling**: Centralized error handling with AppError classes
- **Rate Limiting**: Custom rate limiting for API endpoints

#### Service Modules

##### Auth Service (`src/modules/auth/`)
- **User Registration**: Email/password registration with tenant creation
- **User Login**: JWT token generation and refresh mechanism
- **Password Recovery**: Secure password reset with tokens
- **Token Management**: Access and refresh token lifecycle
- **Session Management**: Login history and audit logging

##### Gym Service (`src/modules/gyms/`)
- **Gym CRUD**: Create, read, update, delete gym records
- **Gym Onboarding**: Document upload, verification workflow
- **Gym Management**: Staff assignment and role management
- **Gym Verification**: Admin approval/rejection with reasons
- **Multi-tenancy**: Tenant-scoped gym operations

##### Event Service (`src/modules/events/`)
- **Event Bus**: BullMQ integration for background jobs
- **Event Producers**: Domain event producers for all major operations
- **Event Consumers**: Workers for processing events asynchronously
- **Dead Letter Queue**: Failed job handling and reprocessing
- **Event Replay**: Event sourcing for audit and recovery

##### Notification Service (`src/modules/notifications/`)
- **Multi-channel**: Email, SMS, push notifications
- **Template System**: Configurable notification templates
- **Event-driven**: Real-time notification delivery
- **Delivery Tracking**: Read receipts and delivery status

##### Document Service (`src/modules/gym-documents/`)
- **File Upload**: Secure document upload with validation
- **Document Types**: Business license, ID proof, gym photos, utility bills
- **Document Workflow**: Upload → Review → Approve/Reject
- **Storage**: S3/MinIO integration for file storage

##### User Service (`src/modules/users/`)
- **Profile Management**: User profile updates and settings
- **Password Management**: Change password with validation
- **Role Management**: User role assignments and permissions
- **Audit Trail**: User activity logging

### Infrastructure Components

#### Database Layer
- **PostgreSQL 18**: Primary relational database with multi-tenancy support
- **Row-Level Security (RLS)**: Tenant isolation at database level
- **Connection Pooling**: Efficient database connection management
- **Backup Strategy**: Automated backups with point-in-time recovery

#### Cache Layer
- **Redis 7**: In-memory caching for session management and API responses
- **BullMQ**: Job queue management with Redis backend
- **Cache Invalidation**: Automatic cache invalidation on data changes

#### Event Bus
- **BullMQ**: Advanced job queue system with retry mechanisms
- **Dead Letter Queue**: Failed job handling and manual reprocessing
- **Event Replay**: Event sourcing for audit and recovery
- **Job Scheduling**: Scheduled and delayed job execution

#### Security Components
- **Helmet**: Security headers for HTTP protection
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Zod schema validation for all endpoints
- **Authentication**: JWT-based authentication with refresh tokens
- **Authorization**: Role-based access control with permissions

### API Documentation

#### API Structure
- **Base URL**: `https://api.fitcore.app/api/v1` (production)
- **Versioning**: RESTful API with version prefix
- **Authentication**: Bearer token in Authorization header
- **Response Format**: Standardized JSON response format

#### Key Endpoints

##### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

##### Gym Management
- `POST /gyms` - Create gym
- `GET /gyms` - List gyms
- `GET /gyms/{id}` - Get gym details
- `PATCH /gyms/{id}` - Update gym
- `PATCH /gyms/{id}/verify` - Verify gym

##### Document Management
- `POST /gyms/{id}/documents` - Upload document
- `GET /gyms/{id}/documents` - List documents
- `PATCH /gyms/{id}/documents/{docId}/status` - Update document status

##### User Management
- `GET /auth/me` - Get current user
- `PUT /users/me/change-password` - Change password
- `GET /auth/login-history` - Get login history
- `GET /roles` - Get roles

### Data Flow

#### User Registration Flow
1. User submits registration form
2. Frontend validates input
3. API validates and creates user
4. System creates tenant and assigns customer role
5. JWT tokens generated and returned
6. User redirected to dashboard

#### Gym Onboarding Flow
1. Gym owner creates gym profile
2. System generates unique gym slug
3. Gym uploads required documents
4. Documents reviewed by admin
5. Admin approves/rejects documents
6. Gym becomes active and visible to customers

#### Event Processing Flow
1. Domain event triggered (e.g., gym created)
2. Event published to BullMQ queue
3. Worker processes event asynchronously
4. Event stored in event log for audit
5. Related actions performed (e.g., notifications sent)

### Monitoring and Observability

#### Metrics
- **Application Metrics**: Request counts, response times, error rates
- **Business Metrics**: User signups, gym creations, document uploads
- **Infrastructure Metrics**: Database connections, cache hit rates, queue depths

#### Logging
- **Structured Logging**: JSON-formatted logs with correlation IDs
- **Log Levels**: DEBUG, INFO, WARN, ERROR, CRITICAL
- **Log Aggregation**: Centralized log collection and analysis
- **Audit Logging**: Complete audit trail of all operations

#### Alerting
- **CloudWatch Alarms**: System health monitoring
- **Error Rate Alerts**: High error rate detection
- **Performance Alerts**: Slow response time detection
- **Availability Alerts**: Service downtime detection

### Security Architecture

#### Authentication
- **JWT Tokens**: Access and refresh token pairs
- **Token Expiration**: Short-lived access tokens, long-lived refresh tokens
- **Token Validation**: JWT signature and claim validation
- **Token Refresh**: Secure token refresh mechanism

#### Authorization
- **Role-based Access Control**: Hierarchical permission system
- **Resource Scoping**: Tenant and gym-level access control
- **Permission Checking**: Middleware-based permission validation
- **RBAC Implementation**: Roles, permissions, and user-role mappings

#### Data Protection
- **Encryption**: AES-256 for data at rest, TLS 1.3 for data in transit
- **Access Control**: Principle of least privilege
- **Audit Logging**: Complete audit trail of all data access
- **Data Masking**: Sensitive data masking in logs and responses

### Deployment Architecture

#### Infrastructure as Code
- **Terraform**: Infrastructure provisioning and management
- **AWS Services**: RDS, ElastiCache, ECS, ALB, CloudFront
- **CI/CD Pipeline**: Automated testing, building, and deployment
- **Environment Management**: Development, staging, production

#### High Availability
- **Multi-AZ Deployment**: Cross-AZ redundancy
- **Load Balancing**: Application Load Balancer with health checks
- **Auto Scaling**: Horizontal pod autoscaling
- **Disaster Recovery**: Multi-region backup and failover

### Compliance and Standards

#### Security Standards
- **OWASP Top 10**: Web application security best practices
- **ISO 27001**: Information security management
- **GDPR**: Data protection and privacy
- **SOC 2**: Security, availability, and control objectives

#### Regulatory Compliance
- **Data Residency**: Geographic data storage requirements
- **Industry Standards**: Healthcare and fitness industry regulations
- **Accessibility**: WCAG 2.1 AA compliance
- **Data Retention**: Configurable data retention policies

## Architecture Evolution

### Phase 1 to Phase 2

The Phase 1 architecture is designed to be extensible for Phase 2:

1. **Database Extensions**: New tables for memberships, payments, trainers
2. **Service Extensions**: New services for marketplace, analytics, mobile
3. **API Extensions**: GraphQL support, webhook integrations
4. **Infrastructure Extensions**: Container orchestration, service mesh
5. **Feature Flags**: Gradual rollout of new features

### Technology Stack Decisions

#### Why Express.js over NestJS
- **Simplicity**: Easier to understand and maintain
- **Performance**: Lower overhead compared to NestJS
- **Flexibility**: More control over the application structure
- **Maturity**: Well-established ecosystem

#### Why PostgreSQL over MySQL
- **ACID Compliance**: Better transactional support
- **JSON Support**: Native JSON data type support
- **Advanced Features**: Window functions, CTEs, recursive queries
- **Multi-tenancy**: Better support for tenant isolation

#### Why BullMQ over other queue systems
- **BullMQ Native**: Built-in TypeScript support
- **Redis Integration**: Seamless Redis integration
- **Advanced Features**: Delayed jobs, retry mechanisms, dead letter queues
- **Performance**: High-performance job processing

## Conclusion

The FitCore Pro Phase 1 architecture provides a solid foundation for a multi-sided fitness SaaS platform. It balances simplicity with functionality, providing all the core features needed for gym onboarding and management while maintaining scalability and security.

The architecture is designed to be:
- **Modular**: Easy to extend and maintain
- **Secure**: Comprehensive security controls
- **Performant**: Optimized for high throughput
- **Observable**: Comprehensive monitoring and observability
- **Compliant**: Meets industry standards and regulations

This architecture supports the pilot program with 3 demo gyms and provides a clear path for scaling to enterprise-level deployments.
