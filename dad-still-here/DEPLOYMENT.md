# Dad, Still Here — Deployment Guide

Complete guide to deploying Dad, Still Here to production.

## Pre-Deployment Checklist

### Security
- [ ] All `.env` secrets are in production secret manager (not Git)
- [ ] HTTPS enforced on all routes
- [ ] Security headers configured (CSP, X-Frame-Options, etc.)
- [ ] CORS properly configured
- [ ] Rate limiting enabled on APIs
- [ ] Input validation on all user inputs
- [ ] SQL injection prevention (Prisma handles)
- [ ] XSS prevention (React handles)
- [ ] CSRF tokens implemented
- [ ] Database backups configured
- [ ] Error monitoring active (Sentry, etc.)

### Performance
- [ ] Images optimized (Next.js Image component)
- [ ] Code splitting verified
- [ ] Bundle size analyzed
- [ ] Caching headers configured
- [ ] CDN configured for static assets
- [ ] Database indexes created
- [ ] Query optimization completed
- [ ] Lighthouse scores reviewed

### Accessibility & SEO
- [ ] WCAG 2.2 AA compliance verified
- [ ] Sitemap.xml generated
- [ ] robots.txt configured
- [ ] Structured data verified (JSON-LD)
- [ ] Meta tags optimized
- [ ] Canonical URLs configured
- [ ] Social media preview working

### Data & Privacy
- [ ] Privacy Policy written and live
- [ ] Terms of Service written and live
- [ ] Cookie policy written and live
- [ ] GDPR compliance verified
- [ ] Data retention policy documented
- [ ] Audit logging enabled
- [ ] Privacy Center tested
- [ ] Data export working

### Testing
- [ ] All critical user flows tested manually
- [ ] Cross-browser testing completed
- [ ] Mobile testing completed
- [ ] Email delivery tested
- [ ] Database migrations tested
- [ ] Backup/restore procedures tested
- [ ] Admin functions tested
- [ ] Moderation workflow tested

---

## Deployment Platforms

### Option 1: Vercel (Recommended for Next.js)

**Advantages:**
- Optimized for Next.js
- Automatic deployments on Git push
- Edge functions support
- Built-in analytics
- One-click rollbacks

**Steps:**

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

2. **Connect Vercel**
   - Go to https://vercel.com/new
   - Select your GitHub repository
   - Configure project settings
   - Add environment variables in Vercel dashboard

3. **Deploy**
   - Vercel automatically deploys on Git push
   - Monitor deployment in Vercel dashboard
   - Set up custom domain in Settings

4. **Configure Database**
   - Connect PostgreSQL (Railway, Neon, or AWS RDS)
   - Add `DATABASE_URL` to Vercel environment variables
   - Run migrations: `npx prisma migrate deploy`

5. **Configure Email**
   - Set up SMTP service (SendGrid, Mailgun)
   - Add `EMAIL_*` variables to Vercel

**Environment Variables (in Vercel):**
```
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://dadstillhere.com
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_USER=...
EMAIL_SERVER_PASSWORD=...
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=dadstillhere-media
```

### Option 2: Railway

**Advantages:**
- Simple deployment
- Integrated database hosting
- GitHub integration
- Good documentation

**Steps:**

1. **Create Railway project**
   - Go to https://railway.app
   - Create new project
   - Connect GitHub repository

2. **Add PostgreSQL**
   - Add PostgreSQL plugin
   - Copy database URL
   - Add to environment variables

3. **Deploy**
   - Set environment variables
   - Push to Git
   - Railway automatically deploys

### Option 3: AWS (Self-Managed)

For teams with AWS expertise.

**Services:**
- **EC2:** Application server
- **RDS:** PostgreSQL database
- **S3:** Media storage
- **CloudFront:** CDN
- **Route 53:** DNS
- **ACM:** SSL certificates
- **CloudWatch:** Monitoring

---

## Database Migration (Production)

### 1. Back up existing database
```bash
pg_dump dadstillhere > backup-$(date +%Y%m%d).sql
```

### 2. Run migrations
```bash
npx prisma migrate deploy
```

### 3. Verify migration
```bash
npx prisma db seed  # If seed script exists
```

### 4. Monitor application
- Check application logs
- Monitor database performance
- Verify all features working

---

## Environment Variables (Production)

Create a `.env.production` file:

```env
# Core
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://dadstillhere.com/api

# Database
DATABASE_URL=postgresql://user:pass@host:5432/dadstillhere

# Auth
NEXTAUTH_URL=https://dadstillhere.com
NEXTAUTH_SECRET=<very-long-random-string>

# Email
EMAIL_SERVER_HOST=smtp.sendgrid.net
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=apikey
EMAIL_SERVER_PASSWORD=SG.xxx
EMAIL_FROM=noreply@dadstillhere.com

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET=dadstillhere-prod

# Analytics
NEXT_PUBLIC_ANALYTICS_ID=G-xxxxx
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# Security
ENCRYPTION_KEY=<32-char-hex-string>
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# Admin
ADMIN_EMAIL=admin@dadstillhere.com
```

---

## Post-Deployment

### 1. Verify Deployment
```bash
curl https://dadstillhere.com
# Should return homepage HTML
```

### 2. Test Critical Paths
- [ ] Homepage loads
- [ ] Write letter flow works
- [ ] Newsletter signup works
- [ ] Email delivery works
- [ ] Admin dashboard accessible
- [ ] Search functionality works

### 3. Monitor Performance
- [ ] Vercel Analytics
- [ ] Sentry error monitoring
- [ ] Database performance logs
- [ ] User session tracking

### 4. Set Up Monitoring Alerts
```
- Database disk space
- Error rate > 1%
- Response time > 2s
- API rate limit exceeded
```

### 5. Configure Backups
- Automatic database backups (daily)
- S3 cross-region replication
- Point-in-time recovery enabled

---

## Scaling Strategy

### Phase 1: Launch (MVP)
- Single Vercel instance
- PostgreSQL on Railway/Neon
- S3 for media
- Estimated capacity: 10k users

### Phase 2: Growth (10k-100k users)
- Vercel Edge Config for feature flags
- Database read replicas
- Caching layer (Redis)
- CDN configuration
- Background job processing (Bull + Redis)

### Phase 3: Scale (100k+ users)
- Multi-region deployment
- Database sharding
- Search service (Elasticsearch)
- Analytics warehouse (BigQuery)
- Microservices where needed

---

## Rollback Procedure

If deployment has critical issues:

### Vercel Rollback
1. Go to Vercel dashboard
2. Click "Deployments"
3. Find last stable deployment
4. Click "..."
5. Select "Promote to Production"

### Database Rollback
```bash
# If migration failed
npx prisma migrate resolve --rolled-back <migration-name>
# Or restore from backup
psql dadstillhere < backup-20240101.sql
```

---

## Monitoring & Maintenance

### Daily
- [ ] Check error logs
- [ ] Monitor database health
- [ ] Verify email delivery
- [ ] Check user reports

### Weekly
- [ ] Review performance metrics
- [ ] Analyze user analytics
- [ ] Check security alerts
- [ ] Review moderation queue

### Monthly
- [ ] Full system audit
- [ ] Performance optimization review
- [ ] Security patch updates
- [ ] Database maintenance

---

## Disaster Recovery

### If database is compromised
1. Stop all application instances
2. Restore from latest backup
3. Run database integrity check
4. Audit access logs
5. Update security credentials
6. Restart application

### If S3 bucket is compromised
1. Revoke AWS credentials
2. Scan bucket for malicious files
3. Restore from backup
4. Update IAM policies
5. Enable S3 versioning + MFA delete

---

## Support

For deployment issues:
- **Documentation:** https://docs.dadstillhere.com
- **Email:** support@dadstillhere.com
- **GitHub Issues:** Report bugs here

---

**Deployed with ❤️ for the words that still need a place to go.**
