# Production Deployment Guide

This guide outlines the steps to deploy the LFG platform to production after successful staging verification.

## Prerequisites

- Successful deployment and testing in the staging environment
- Production environment access credentials
- SSL certificates for production domains
- Database backup strategy in place

## Pre-Deployment Checklist

- [ ] All tests pass in the staging environment
- [ ] Security audit completed
- [ ] Performance testing completed
- [ ] Database migration scripts tested
- [ ] Rollback plan documented
- [ ] Monitoring and alerting configured
- [ ] SSL certificates valid and installed
- [ ] DNS records configured
- [ ] Firewall rules updated
- [ ] Backup strategy in place

## Deployment Steps

### 1. Prepare Environment Files

1. Create backend environment file:
   ```bash
   cp backend/.env.production.template backend/.env.production
   ```

2. Edit `backend/.env.production` with the appropriate values for the production environment:
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=postgresql://username:password@production-db-host:5432/lfg_production
   PRIVY_APP_ID=your_production_privy_app_id
   PRIVY_APP_SECRET=your_production_privy_app_secret
   PRIVY_PUBLIC_KEY=your_production_privy_public_key
   JWT_SECRET=your_production_jwt_secret
   LOG_LEVEL=info
   ```

3. Create frontend environment file:
   ```bash
   cp frontend/.env.production.template frontend/.env.production
   ```

4. Edit `frontend/.env.production` with the appropriate values for the production environment:
   ```
   NEXT_PUBLIC_API_URL=https://api.lfg.example.com
   NEXT_PUBLIC_PRIVY_APP_ID=your_production_privy_app_id
   NEXT_PUBLIC_ENVIRONMENT=production
   ```

### 2. Database Preparation

1. Backup the current production database (if it exists):
   ```bash
   pg_dump -h production-db-host -U username -d lfg_production > lfg_production_backup_$(date +%Y%m%d).sql
   ```

2. Apply any pending migrations:
   ```bash
   cd backend
   npm run migrate:production
   ```

### 3. Deploy to Production

Use the deployment script we created earlier:

```bash
./scripts/deploy-all.sh
```

This script will:
- Check for required environment files
- Deploy the backend
- Deploy the frontend
- Run post-deployment tests

### 4. Post-Deployment Verification

1. Run end-to-end tests against production:
   ```bash
   cd tests
   TEST_BASE_URL=https://lfg.example.com npm test
   ```

2. Manually verify critical flows:
   - Authentication
   - Wallet connection
   - Bounty creation and matching
   - User profile management

3. Monitor the application for any errors or performance issues:
   - Check server logs
   - Review monitoring dashboards
   - Verify API response times

## Monitoring and Alerting

1. Configure production monitoring:
   - Set up log aggregation (e.g., ELK stack, Datadog)
   - Configure performance monitoring
   - Set up error tracking (e.g., Sentry)
   - Configure uptime monitoring

2. Set up alerting for critical issues:
   - Server downtime
   - High error rates
   - Slow response times
   - Database issues

## Rollback Procedure

If critical issues are found in production:

1. Assess the impact and determine if a rollback is necessary
2. If rollback is needed:
   ```bash
   # Restore previous backend version
   ssh user@production-server "cd /path/to/backend && git checkout previous-tag && npm install && npm run build && pm2 restart lfg-backend"
   
   # Restore previous frontend version
   ssh user@production-server "cd /path/to/frontend && git checkout previous-tag && npm install && npm run build && pm2 restart lfg-frontend"
   
   # Restore database if necessary
   psql -h production-db-host -U username -d lfg_production < lfg_production_backup_YYYYMMDD.sql
   ```

3. Notify the team about the rollback
4. Investigate and fix the issues
5. Plan a new deployment

## User Feedback Collection

1. Implement feedback collection mechanisms:
   - In-app feedback form
   - User surveys
   - Support ticketing system

2. Monitor user feedback channels:
   - Support tickets
   - Social media mentions
   - App store reviews

3. Analyze feedback and prioritize improvements

## Continuous Improvement

1. Regular review of:
   - Performance metrics
   - Error rates
   - User feedback
   - Security vulnerabilities

2. Plan and implement improvements based on findings

3. Regular security audits and updates
