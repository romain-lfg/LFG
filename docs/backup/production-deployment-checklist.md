# Production Deployment Checklist

Use this checklist to ensure a smooth production deployment of the LFG platform.

## Pre-Deployment

- [ ] All staging tests pass successfully
- [ ] Environment variables are configured correctly
- [ ] Database migrations are prepared
- [ ] Backup strategy is in place
- [ ] Rollback plan is documented
- [ ] Monitoring is configured
- [ ] SSL certificates are valid
- [ ] DNS records are configured
- [ ] Security audit is completed
- [ ] Performance testing is completed
- [ ] Load testing is completed
- [ ] User acceptance testing is completed

## Deployment Process

- [ ] Create production environment files
  ```bash
  cp backend/.env.production.template backend/.env.production
  cp frontend/.env.production.template frontend/.env.production
  ```

- [ ] Update production environment variables with actual values
  - Backend: `backend/.env.production`
  - Frontend: `frontend/.env.production`

- [ ] Backup the current production database (if exists)
  ```bash
  pg_dump -h production-db-host -U username -d lfg_production > lfg_production_backup_$(date +%Y%m%d).sql
  ```

- [ ] Run the deployment script
  ```bash
  ./scripts/deploy-all.sh
  ```

- [ ] Verify the deployment
  - [ ] Backend API is accessible
  - [ ] Frontend is accessible
  - [ ] Authentication flow works
  - [ ] Wallet connection works
  - [ ] Nillion integration works

## Post-Deployment

- [ ] Run end-to-end tests against production
  ```bash
  cd tests
  TEST_BASE_URL=https://lfg.example.com npm test
  ```

- [ ] Monitor the application
  - [ ] Check server logs
  - [ ] Review monitoring dashboards
  - [ ] Verify API response times
  - [ ] Check error rates

- [ ] Collect initial user feedback
  - [ ] Implement feedback form
  - [ ] Monitor support channels
  - [ ] Analyze user behavior

## Rollback Procedure (if needed)

- [ ] Assess the impact and determine if rollback is necessary
- [ ] If rollback is needed:
  ```bash
  # Restore previous backend version
  ssh user@production-server "cd /path/to/backend && git checkout previous-tag && npm install && npm run build && pm2 restart lfg-backend"
  
  # Restore previous frontend version
  ssh user@production-server "cd /path/to/frontend && git checkout previous-tag && npm install && npm run build && pm2 restart lfg-frontend"
  
  # Restore database if necessary
  psql -h production-db-host -U username -d lfg_production < lfg_production_backup_YYYYMMDD.sql
  ```

- [ ] Notify the team about the rollback
- [ ] Investigate and fix the issues
- [ ] Plan a new deployment

## Continuous Improvement

- [ ] Schedule regular reviews of:
  - [ ] Performance metrics
  - [ ] Error rates
  - [ ] User feedback
  - [ ] Security vulnerabilities

- [ ] Plan and implement improvements based on findings
- [ ] Regular security audits and updates
