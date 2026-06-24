# FitCore Pro Performance Baseline (k6 Tests)

This directory contains k6 performance test scripts for validating Phase 1 performance requirements.

## Performance Targets

Based on the FITCORE PRO Blueprint, Phase 1 performance requirements:

| Endpoint Category | Target p95 Latency | Target p99 Latency | Concurrent Users |
|-------------------|-------------------|-------------------|-----------------|
| Auth endpoints (login, register) | <500ms | <1s | 50 |
| Gym CRUD endpoints (create, list) | <300ms | <1s | 50 |

## Test Coverage

The performance test suite covers the following critical user paths:

1. **User Registration** - `POST /api/v1/auth/register`
2. **User Login** - `POST /api/v1/auth/login`
3. **Gym Creation** - `POST /api/v1/gyms`
4. **List Gyms** - `GET /api/v1/gyms`
5. **Get User Profile** - `GET /api/v1/auth/me`
6. **Change Password** - `PUT /api/v1/users/me/change-password`
7. **Get Login History** - `GET /api/v1/auth/login-history`
8. **Get Roles** - `GET /api/v1/roles`
9. **Get My Gyms** - `GET /api/v1/gyms/my`
10. **Forgot Password** - `POST /api/v1/auth/forgot-password`

## Test Configuration

### Stages
- **Ramp Up**: 2 minutes to reach 50 concurrent users
- **Steady State**: 5 minutes at 50 concurrent users
- **Ramp Down**: 2 minutes to 0 users

### Thresholds
- **Auth endpoints**: p95 < 500ms, p99 < 1000ms
- **Gym endpoints**: p95 < 300ms, p99 < 1000ms
- **Failure rate**: < 10%

## Prerequisites

1. **k6 installed**: `https://k6.io/docs/getting-started/installation/`
2. **FitCore Pro backend running**: `http://localhost:4000/api/v1`
3. **Test environment configured**: Set `BASE_URL` environment variable if not using localhost

## Running Tests

### Basic Usage
```bash
# Run the performance test
k6 run test-fitcore-performance.js

# Run with output to console
k6 run --out console test-fitcore-performance.js

# Run with HTML report
k6 run --out html(test) test-fitcore-performance.js
```

### Environment Variables
```bash
# Override base URL (if backend is on a different host/port)
BASE_URL=https://api-staging.fitcore.app/api/v1 k6 run test-fitcore-performance.js
```

### Advanced Options
```bash
# Run with specificvus
k6 run --vus 100 --duration 10m test-fitcore-performance.js

# Run with output to file
k6 run --out json=results.json test-fitcore-performance.js

# Run with thresholds only (no output)
k6 run --quiet test-fitcore-performance.js
```

## Test Results Interpretation

### Success Criteria
- All endpoint response times meet or exceed p95 targets
- Failure rate stays below 10%
- No errors in the test execution

### Performance Metrics
- **p95**: 95th percentile response time (95% of requests are faster)
- **p99**: 99th percentile response time (99% of requests are faster)
- **Failure rate**: Percentage of failed requests

### Common Issues and Solutions

#### Slow Auth Response (>500ms)
- Check database connection pool size
- Verify Redis is running and responsive
- Look for slow queries in the auth service

#### Slow Gym Response (>300ms)
- Check for N+1 queries in gym service
- Verify index usage on gym tables
- Monitor database connection utilization

#### High Failure Rate (>10%)
- Check backend logs for errors
- Verify authentication token handling
- Check for rate limiting issues

## Integration with CI/CD

### GitHub Actions
Add to your `.github/workflows/` directory:

```yaml
name: Performance Tests
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install k6
        run: sudo apt-get update && sudo apt-get install -y k6
      - name: Run Performance Tests
        env:
          BASE_URL: ${{ secrets.STAGING_API_URL }}
        run: |
          k6 run infrastructure/k6/test-fitcore-performance.js
```

### Dockerized k6
For production-like testing, use Docker:

```dockerfile
FROM k6:latest

WORKDIR /scripts
COPY infrastructure/k6/ ./

CMD ["k6", "run", "test-fitcore-performance.js"]
```

## Reporting

### k6 Output Formats
- **Console**: Human-readable output
- **HTML**: Interactive web-based reports
- **JSON**: Machine-readable for CI/CD integration
- **JUnit**: Test results compatible with CI systems

### Key Metrics to Monitor
1. **Response Time Distribution**: Histogram of all response times
2. **Error Rate**: Percentage of failed requests over time
3. **Requests per Second**: Throughput metrics
4. **Active VUs**: Number of concurrent virtual users

## Maintenance

### Updating Test Scenarios
To add new endpoints or modify existing tests:

1. Add new HTTP request checks in the test script
2. Update threshold values if targets change
3. Adjust sleep times to simulate realistic user behavior
4. Add new test data generation as needed

### Monitoring Test Health
```bash
# Check for test failures in CI
k6 run --out json=results.json test-fitcore-performance.js

# Parse results for alerts
jq '.summary.failed' results.json
```

## Troubleshooting

### k6 Not Found
```bash
# Install k6 on Ubuntu
apt-get update
apt-get install -y k6

# Install k6 on macOS
brew install k6

# Install k6 on Windows (Chocolatey)
choco install k6
```

### Connection Errors
```bash
# Check if backend is running
curl -v http://localhost:4000/api/v1/health

# Check backend logs
docker logs fitcore-backend
```

### Permission Denied
```bash
# Ensure k6 has permission to access network resources
chmod +x k6
```

## Compliance with Blueprint

This test suite validates the following Blueprint acceptance criteria:

- **AC-S3-03**: E2E test passes: register → login → create gym → view gym
- **AC-S3-04**: Zero critical or high-severity vulnerabilities in dependencies
- **AC-S3-05**: Auth endpoints p95 <500ms under 50 concurrent users
- **AC-S3-06**: Gym CRUD endpoints p95 <300ms under 50 concurrent users

## License

This performance test script is part of the FitCore Pro project and is licensed under the same terms as the main codebase.
