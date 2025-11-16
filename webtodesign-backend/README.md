# WebToDesign Backend API

> Express + Puppeteer backend for converting websites to Figma-ready snapshots

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

Server runs on `http://localhost:3000`

## API Endpoints

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-16T12:00:00.000Z",
  "version": "1.0.0",
  "uptime": 123456,
  "memory": {
    "used": 45,
    "total": 100
  }
}
```

### GET /convert

Convert a single URL to Figma snapshot.

**Parameters:**
- `url` (required) - Website URL to convert
- `width` (optional, default: 1440) - Viewport width
- `height` (optional, default: 900) - Viewport height
- `fullPage` (optional, default: false) - Capture full page scroll
- `includeImages` (optional, default: true) - Include image elements

**Example:**
```bash
curl "http://localhost:3000/convert?url=https://example.com&width=1440&height=900"
```

**Response:**
```json
{
  "success": true,
  "snapshot": {
    "url": "https://example.com",
    "title": "Example Domain",
    "viewport": {
      "name": "1440x900",
      "width": 1440,
      "height": 900
    },
    "elements": [...],
    "colors": ["#1a1a1a", "#ffffff"],
    "fonts": [
      { "family": "Inter", "weights": ["400", "700"] }
    ],
    "metadata": {
      "capturedAt": "2025-11-16T12:00:00.000Z",
      "userAgent": "..."
    }
  },
  "duration": 2345
}
```

### POST /batch-convert

Convert multiple URLs in one request.

**Body:**
```json
{
  "urls": [
    "https://example.com",
    "https://example.org"
  ],
  "viewport": {
    "width": 1440,
    "height": 900
  }
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "url": "https://example.com",
      "success": true,
      "snapshot": {...}
    },
    {
      "url": "https://example.org",
      "success": true,
      "snapshot": {...}
    }
  ]
}
```

## Environment Variables

See `.env.example` for all configuration options.

Key variables:
- `PORT` - Server port (default: 3000)
- `CORS_ORIGINS` - Allowed CORS origins (comma-separated)
- `PUPPETEER_TIMEOUT` - Page load timeout in ms (default: 30000)

## Deployment

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Add environment variables in Vercel dashboard.

### Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway up
```

### Docker

```dockerfile
FROM node:20-slim

# Install Chromium dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    ca-certificates \
    --no-install-recommends

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

## Security

- ✅ URL validation (blocks private IPs, localhost)
- ✅ Timeout protection (30s default)
- ✅ CORS configuration
- ✅ Input sanitization
- 🔒 TODO: Rate limiting (add in production)
- 🔒 TODO: API key authentication (add in production)

## Performance

- Browser instance reused across requests
- Page instances created per request and cleaned up
- Memory monitoring via /health endpoint
- Configurable timeouts

## Troubleshooting

**Puppeteer won't start:**
- Make sure Chrome/Chromium is installed
- On Linux, install dependencies: `apt-get install -y chromium`
- Check `--no-sandbox` flag is set

**Timeouts:**
- Increase `PUPPETEER_TIMEOUT`
- Check network connectivity
- Try smaller viewport sizes

**Memory issues:**
- Monitor via `/health` endpoint
- Restart server periodically
- Reduce concurrent requests

## License

MIT
