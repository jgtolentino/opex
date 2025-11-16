# WebToDesign - Production Deployment Guide

**Version**: 1.0.0
**Date**: November 16, 2025
**Status**: Production Ready

---

## Overview

This guide covers deploying the complete WebToDesign system to production:
1. Backend API (Express + Puppeteer)
2. Figma Plugin
3. Monitoring & Maintenance

---

## Prerequisites

- **Node.js** 20+ installed
- **npm** or **pnpm** package manager
- **Git** for version control
- **Vercel/Railway/Render** account (for backend hosting)
- **Figma** account (for plugin publishing)

---

## Part 1: Backend Deployment

### Option A: Deploy to Vercel (Recommended)

**Why Vercel?**
- Puppeteer support out-of-the-box
- Serverless functions
- Auto-scaling
- Free tier available
- Simple setup

**Steps:**

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Navigate to backend
cd webtodesign-backend

# 3. Create vercel.json
cat > vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.ts"
    }
  ]
}
EOF

# 4. Deploy
vercel

# 5. Set environment variables
vercel env add CORS_ORIGINS
# Enter: https://www.figma.com

vercel env add NODE_ENV
# Enter: production

# 6. Deploy to production
vercel --prod
```

**Your backend URL**: `https://webtodesign-backend.vercel.app`

### Option B: Deploy to Railway

```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
cd webtodesign-backend
railway init

# 4. Deploy
railway up

# 5. Set environment variables
railway variables set CORS_ORIGINS="https://www.figma.com"
railway variables set NODE_ENV="production"
```

### Option C: Docker Deployment

```dockerfile
# Dockerfile
FROM node:20-slim

# Install Chromium
RUN apt-get update && apt-get install -y \
    chromium \
    ca-certificates \
    fonts-liberation \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

EXPOSE 3000

CMD ["npm", "start"]
```

Deploy:
```bash
docker build -t webtodesign-backend .
docker run -p 3000:3000 -e CORS_ORIGINS="https://www.figma.com" webtodesign-backend
```

---

## Part 2: Plugin Configuration

### Update Backend URL

Edit `webtodesign-plugin/src/config.ts`:

```typescript
export function getBackendUrl(): string {
  const PRODUCTION_BACKEND_URL = 'https://your-backend-url.vercel.app'  // ← UPDATE THIS

  const isProduction = typeof process !== 'undefined' && process.env.NODE_ENV === 'production'
  return isProduction ? PRODUCTION_BACKEND_URL : 'http://localhost:3000'
}
```

### Build Plugin for Production

```bash
cd webtodesign-plugin

# Install dependencies
npm install

# Run tests
npm test

# Build
NODE_ENV=production npm run build

# Verify dist/ folder contains:
# - code.js
# - ui.html
```

---

## Part 3: Figma Plugin Publishing

### 1. Prepare Plugin Manifest

Ensure `manifest.json` has:
```json
{
  "name": "WebToDesign",
  "id": "webtodesign-html-figma-converter",
  "api": "1.0.0",
  "main": "dist/code.js",
  "ui": "dist/ui.html",
  "editorType": ["figma"],
  "networkAccess": {
    "allowedDomains": ["your-backend-url.vercel.app"],
    "reasoning": "This plugin needs to fetch websites from backend API"
  }
}
```

### 2. Test in Figma

1. Open Figma Desktop
2. **Plugins** → **Development** → **Import plugin from manifest**
3. Select `webtodesign-plugin/manifest.json`
4. Test import with real URLs
5. Verify backend connection works

### 3. Publish to Figma Community

1. In Figma, go to **Plugins** → **Development** → **Publish new plugin**
2. Fill in:
   - **Name**: WebToDesign
   - **Description**: Convert any website to editable Figma designs with auto-layout, design tokens, and structured layers
   - **Tags**: productivity, import, design-systems, automation
   - **Screenshots**: (capture plugin in action)
3. Submit for review

**Review Process**: 3-5 business days

---

## Part 4: Environment Variables

### Backend Required Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `production` | Environment |
| `CORS_ORIGINS` | `https://www.figma.com` | Allowed origins |
| `PUPPETEER_TIMEOUT` | `30000` | Page load timeout (ms) |

### Plugin Configuration

Update these in `src/config.ts`:
- `BACKEND_URL` - Production backend URL
- `TIMEOUT` - API timeout (60000 recommended)
- `RETRY_ATTEMPTS` - Number of retries (3 recommended)

---

## Part 5: Monitoring & Maintenance

### Health Monitoring

Set up uptime monitoring:

**Option 1: UptimeRobot** (free)
```
Monitor URL: https://your-backend-url.vercel.app/health
Interval: 5 minutes
Alert contacts: your-email@example.com
```

**Option 2: Custom script**
```bash
#!/bin/bash
# health-check.sh
curl -f https://your-backend-url.vercel.app/health || echo "Backend down!" | mail -s "WebToDesign Alert" admin@example.com
```

### Log Monitoring

**Vercel**: View logs in Vercel dashboard → Your Project → Logs

**Railway**: `railway logs`

**Docker**: `docker logs -f container-name`

### Performance Monitoring

Track key metrics:
- **Response time**: Target <30s for average websites
- **Success rate**: Should be >90%
- **Error rate**: Track common errors (bot protection, timeouts)
- **Memory usage**: Monitor for leaks

---

## Part 6: Security Checklist

### Backend Security

✅ **URL Validation**: Block localhost, private IPs (implemented)
✅ **CORS**: Whitelist Figma domains only (implemented)
✅ **Timeouts**: Prevent long-running requests (implemented)
✅ **Rate Limiting**: Add rate limiting middleware (TODO)
✅ **API Authentication**: Add API keys for production (TODO)

**Add Rate Limiting**:
```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})

app.use('/convert', limiter)
```

### Plugin Security

✅ **No Secrets in Code**: Backend URL is config only
✅ **Input Validation**: URLs validated before API calls
✅ **Error Handling**: No stack traces exposed to users

---

## Part 7: Scaling Considerations

### Backend Scaling

**Small Scale (<1000 imports/day)**:
- Vercel free tier or Railway hobby plan
- Single instance is sufficient

**Medium Scale (1000-10,000 imports/day)**:
- Vercel Pro or Railway Pro
- Enable caching for repeated URLs
- Add Redis for session management

**Large Scale (>10,000 imports/day)**:
- Dedicated infrastructure (AWS/GCP)
- Load balancer + multiple instances
- CDN for static assets
- Database for usage tracking

### Plugin Scaling

- Figma handles plugin distribution
- No backend needed for plugin delivery
- Monitor Figma Community stats

---

## Release Checklist

### Pre-Release

- [ ] All tests passing (`npm test` in both plugin and backend)
- [ ] CI/CD pipeline green
- [ ] Backend deployed and `/health` returning healthy
- [ ] Plugin built with production backend URL
- [ ] Tested real website imports (3-5 different sites)
- [ ] Error handling tested (invalid URLs, timeouts, bot protection)
- [ ] Documentation updated (README, QUICKSTART)

### Backend Deployment

- [ ] Environment variables set correctly
- [ ] CORS configured for Figma domains
- [ ] Health check endpoint accessible
- [ ] Test `/convert` endpoint with sample URL
- [ ] Monitoring/alerts configured

### Plugin Release

- [ ] Manifest updated with correct backend URL
- [ ] Screenshots captured for Figma Community
- [ ] Description and tags finalized
- [ ] Tested in Figma Desktop and Web
- [ ] Submitted to Figma for review

### Post-Release

- [ ] Monitor error rates for first 24 hours
- [ ] Check backend logs for issues
- [ ] Respond to Figma review feedback
- [ ] Announce release (Twitter, blog, etc.)
- [ ] Monitor user feedback in Figma Community

---

## Troubleshooting

### Backend Issues

**"Browser failed to launch"**
- Ensure Chromium is installed
- Check `PUPPETEER_EXECUTABLE_PATH`
- On Vercel, use `@sparticuz/chromium` package

**"Timeout errors"**
- Increase `PUPPETEER_TIMEOUT`
- Check target site's load time
- Consider above-the-fold-only imports

**"High memory usage"**
- Restart backend periodically
- Limit concurrent conversions
- Reduce max page height

### Plugin Issues

**"Backend unavailable"**
- Check `BACKEND_URL` in config.ts
- Test `/health` endpoint manually
- Verify CORS settings

**"Import failed"**
- Check browser console for errors
- Test same URL in backend directly
- Verify Figma plugin permissions

---

## Support & Resources

- **Documentation**: `README.md`, `QUICKSTART.md`
- **GitHub Issues**: https://github.com/jgtolentino/opex/issues
- **Figma Community**: (link after publishing)
- **Email**: jake@example.com

---

## Maintenance Schedule

**Daily**:
- Monitor error logs
- Check uptime status

**Weekly**:
- Review usage metrics
- Check for dependency updates

**Monthly**:
- Security audit
- Performance optimization review
- Dependency updates (`npm audit`, `npm outdated`)

**Quarterly**:
- Major version bumps
- Feature releases
- User feedback review

---

## Cost Estimates

### Free Tier (Getting Started)

- **Backend**: Vercel Free (100GB bandwidth, 100 hours runtime)
- **Monitoring**: UptimeRobot Free
- **Total**: $0/month
- **Limits**: ~500-1000 imports/month

### Production Tier

- **Backend**: Vercel Pro ($20/month) or Railway Pro ($20/month)
- **Monitoring**: Better Uptime ($15/month)
- **CDN**: Cloudflare Free
- **Total**: ~$20-35/month
- **Capacity**: 10,000-50,000 imports/month

---

**This guide provides everything needed to deploy WebToDesign to production securely and reliably. Happy shipping! 🚀**
