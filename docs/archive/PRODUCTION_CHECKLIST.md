# Production Deployment Checklist

This checklist ensures the MediPact backend is properly configured for production deployment.

## Environment Variables

### Required Variables
- [ ] `NODE_ENV=production`
- [ ] `OPERATOR_ID` - Hedera operator account ID (format: 0.0.xxxxx)
- [ ] `OPERATOR_KEY` - Hedera operator private key (ECDSA, HEX format)
- [ ] `PLATFORM_HEDERA_ACCOUNT_ID` - Platform account for receiving payments
- [ ] `JWT_SECRET` - At least 32 characters for JWT token signing
- [ ] `DATABASE_URL` - PostgreSQL connection string (if using PostgreSQL)
- [ ] `FRONTEND_URL` - Production frontend URL for CORS

### Optional but Recommended
- [ ] `HEDERA_NETWORK` - Set to 'testnet' or 'mainnet' (defaults based on NODE_ENV)
- [ ] `LOG_LEVEL` - Set to 'INFO' or 'WARN' for production (defaults to INFO)
- [ ] `PORT` - Server port (defaults to 3002)
- [ ] `AUTOMATIC_WITHDRAWAL_ENABLED` - Set to 'true' or 'false' (defaults to true)
- [ ] `AUTOMATIC_WITHDRAWAL_INTERVAL_MINUTES` - Withdrawal job interval (defaults to 1440 = daily)
- [ ] `EXCHANGE_RATE_UPDATE_INTERVAL_MINUTES` - Exchange rate cache duration (defaults to 5)
- [ ] `REVENUE_SPLITTER_ADDRESS` - Smart contract address for revenue distribution
- [ ] `CONSENT_MANAGER_ADDRESS` - Smart contract address for consent management

### Email/SMS Notifications (Optional)
- [ ] `EMAIL_HOST` - SMTP server host
- [ ] `EMAIL_PORT` - SMTP server port
- [ ] `EMAIL_USER` - SMTP username
- [ ] `EMAIL_PASS` - SMTP password
- [ ] `EMAIL_FROM` - Sender email address

## Security Configuration

### Database
- [ ] PostgreSQL is configured with SSL (production)
- [ ] Database credentials are stored securely (environment variables, not in code)
- [ ] Database backups are configured
- [ ] Connection pooling is enabled

### API Security
- [ ] CORS is configured to only allow production frontend URLs
- [ ] Rate limiting is enabled on all endpoints
- [ ] API keys are required for hospital/researcher endpoints
- [ ] JWT tokens are properly signed with strong secret
- [ ] Security headers are enabled (X-Content-Type-Options, X-Frame-Options, etc.)

### Data Protection
- [ ] Sensitive data (bank accounts, mobile money numbers) is encrypted at rest
- [ ] Encryption keys are stored securely (environment variables)
- [ ] PII is properly anonymized before sharing with researchers
- [ ] Patient consent is validated before data access

## Hedera Configuration

### Network
- [ ] `HEDERA_NETWORK` is set appropriately (testnet for testing, mainnet for production)
- [ ] Operator account has sufficient HBAR balance
- [ ] Platform account is configured and funded
- [ ] Smart contracts are deployed (if using)

### Accounts
- [ ] Patient accounts are created lazily (on first payment) to save costs
- [ ] Hospital accounts are created during registration
- [ ] Researcher accounts are created during registration

## Monitoring & Logging

### Logging
- [ ] Log level is set to INFO or WARN (not DEBUG) in production
- [ ] Logs are structured (JSON format) for log aggregation tools
- [ ] Sensitive data is not logged
- [ ] Error logs include context but not sensitive information

### Monitoring
- [ ] Health check endpoint (`/health`) is accessible
- [ ] Application metrics are collected (if using monitoring service)
- [ ] Error tracking is configured (if using error tracking service)
- [ ] Uptime monitoring is configured

## Background Jobs

### Automatic Withdrawals
- [ ] Automatic withdrawal job is enabled (`AUTOMATIC_WITHDRAWAL_ENABLED=true`)
- [ ] Withdrawal interval is configured appropriately
- [ ] Payment gateway integration is configured (if using)
- [ ] Withdrawal notifications are working

### Cleanup Jobs
- [ ] Expiration cleanup job is running (every 5 minutes)
- [ ] Temporary access records are properly cleaned up

### Exchange Rate Updates
- [ ] Exchange rate service is initialized on startup
- [ ] Exchange rate cache is working correctly
- [ ] Fallback rate is configured

## Testing

### Pre-Deployment
- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] End-to-end flow test passes
- [ ] Security tests pass

### Post-Deployment
- [ ] Health check returns healthy status
- [ ] Database connection is working
- [ ] Hedera connection is working
- [ ] API endpoints are accessible
- [ ] Rate limiting is working
- [ ] CORS is configured correctly

## Documentation

- [ ] API documentation is accessible at `/api-docs`
- [ ] Environment variables are documented
- [ ] Deployment process is documented
- [ ] Rollback procedure is documented

## Backup & Recovery

- [ ] Database backups are automated
- [ ] Backup restoration procedure is tested
- [ ] Disaster recovery plan is documented
- [ ] Environment variable backups are stored securely

## Performance

- [ ] Database connection pooling is configured
- [ ] Rate limits are appropriate for expected load
- [ ] Response times are acceptable
- [ ] Memory usage is monitored
- [ ] CPU usage is monitored

## Compliance

- [ ] HIPAA compliance measures are in place (if applicable)
- [ ] Data retention policies are configured
- [ ] Audit logging is enabled
- [ ] Consent management is working correctly

## Notes

- This deployment uses Hedera testnet and development free tier options
- Ensure all testnet/mainnet distinctions are clearly documented
- Monitor Hedera account balances regularly
- Keep operator keys secure and rotate if compromised

