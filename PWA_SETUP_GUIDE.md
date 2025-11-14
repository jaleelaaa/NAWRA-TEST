# PWA Setup Guide for NAWRA
## Progressive Web App Configuration & Deployment

This guide covers everything needed to set up, configure, and deploy the NAWRA Progressive Web App.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [PWA Configuration](#pwa-configuration)
4. [Testing PWA Features](#testing-pwa-features)
5. [Production Deployment](#production-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- Node.js 18+ (LTS recommended)
- npm or yarn
- Modern browser (Chrome/Edge/Firefox/Safari)
- HTTPS server for production (PWAs require HTTPS)

### Required Knowledge
- Basic understanding of Next.js
- Familiarity with service workers
- Understanding of PWA concepts

---

## Local Development Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Configuration

Create `.env.local` file:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# PWA Configuration (Optional - for push notifications)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key_here

# Public URL (leave empty for default)
PUBLIC_URL=
```

### 3. Generate PWA Icons

The project includes placeholder icons. For production, replace them:

```bash
# Generate placeholder icons (already done)
node scripts/generate-icons.js

# For production, replace files in public/icons/ with designed PNG icons
# Required sizes: 72, 96, 128, 144, 152, 180, 192, 384, 512
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

**Note:** Service worker may not work on `localhost` in some browsers. Use `127.0.0.1:3000` or test on production.

---

## PWA Configuration

### Manifest.json Configuration

File: `public/manifest.json`

```json
{
  "name": "NAWRA Library Management System",
  "short_name": "NAWRA",
  "description": "Library Management System...",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#2563eb",
  "background_color": "#ffffff",
  "icons": [...],
  "shortcuts": [...]
}
```

**Customization:**
- Update `name`, `short_name`, and `description`
- Change `theme_color` to match your brand
- Add custom shortcuts for quick actions
- Configure `orientation` if needed

### Service Worker Configuration

File: `public/sw.js`

**Cache Names:**
```javascript
const CACHE_NAME = 'nawra-v1';
const RUNTIME_CACHE = 'nawra-runtime-v1';
const API_CACHE = 'nawra-api-v1';
const IMAGE_CACHE = 'nawra-images-v1';
```

**Caching Strategies:**
- **API Requests:** Network-first, cache fallback
- **Images:** Cache-first, network fallback
- **Static Assets:** Cache-first
- **HTML Pages:** Network-first

**Customization:**
- Update cache version when deploying
- Modify `PRECACHE_URLS` for different routes
- Adjust cache strategies per your needs

### Metadata Configuration

File: `app/[locale]/layout.tsx`

```typescript
export const metadata: Metadata = {
  title: "NAWRA - Library Management System",
  manifest: "/manifest.json",
  themeColor: "#2563eb",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NAWRA",
  },
  // ... more metadata
};
```

---

## Testing PWA Features

### 1. Test Installation

**Chrome DevTools:**
1. Open DevTools (F12)
2. Go to "Application" tab
3. Click "Manifest" - check for errors
4. Click "Service Workers" - verify registration
5. Use "Install" button or address bar icon

**Lighthouse Audit:**
```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run PWA audit
lighthouse http://localhost:3000 --view --preset=pwa
```

### 2. Test Offline Functionality

**Method 1: Chrome DevTools**
1. Open DevTools → Application → Service Workers
2. Check "Offline" checkbox
3. Navigate the app - cached pages should load

**Method 2: Network Throttling**
1. Open DevTools → Network tab
2. Select "Offline" from throttling dropdown
3. Reload and test

### 3. Test on Real Devices

**Android (Chrome):**
1. Deploy to test server (HTTPS required)
2. Visit site on mobile Chrome
3. Menu → "Add to Home Screen"
4. Test installation and offline mode

**iOS (Safari):**
1. Visit site on mobile Safari
2. Share → "Add to Home Screen"
3. Test app opening and functionality

### 4. Test Barcode Scanner

**Requirements:**
- HTTPS (camera access requires secure context)
- Camera permission granted
- BarcodeDetector API support (Chrome/Edge)

**Test Steps:**
1. Click "Scan Barcode" button
2. Grant camera permission
3. Point at barcode
4. Verify detection and lookup

**Fallback Test:**
1. Switch to "Manual Entry" mode
2. Enter barcode number
3. Verify lookup works

---

## Production Deployment

### 1. Pre-Deployment Checklist

- [ ] Replace placeholder icons with designed PNG icons
- [ ] Update manifest.json with production URLs
- [ ] Set proper `start_url` in manifest
- [ ] Configure environment variables
- [ ] Update cache version in service worker
- [ ] Test on multiple devices and browsers
- [ ] Run Lighthouse audit (score > 90)
- [ ] Verify HTTPS is configured

### 2. Build for Production

```bash
cd frontend
npm run build
```

**Build Output:**
```
.next/
├── static/
├── server/
└── standalone/  (if output: 'standalone')
```

### 3. Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

**Vercel Configuration:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.yourdomain.com/api"
  }
}
```

### 4. Deploy to Other Platforms

**Netlify:**
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

**Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### 5. Configure HTTPS

**Vercel:** Automatic HTTPS
**Netlify:** Automatic HTTPS
**Custom Server:** Use Let's Encrypt or Cloudflare

### 6. Configure CDN (Optional)

- Use Cloudflare for global CDN
- Configure caching rules
- Enable image optimization
- Set up automatic compression

---

## Post-Deployment

### 1. Verify PWA Installation

Visit deployed URL and check:
- [ ] Manifest loads without errors
- [ ] Service worker registers successfully
- [ ] Install prompt appears (or can be triggered)
- [ ] App can be installed on desktop/mobile
- [ ] Offline mode works
- [ ] Icons display correctly

### 2. Monitor PWA Metrics

**Google Analytics:**
```typescript
// Track PWA installs
window.addEventListener('appinstalled', () => {
  gtag('event', 'pwa_install');
});

// Track service worker updates
if (registration.waiting) {
  gtag('event', 'pwa_update_available');
}
```

**Key Metrics to Monitor:**
- Installation rate
- Offline usage
- Service worker errors
- Cache hit rate
- Load times (online vs offline)

### 3. Update Strategy

**Version Updates:**
1. Update cache version in `sw.js`
2. Deploy new version
3. Service worker auto-updates
4. Users notified of new version

**Force Update:**
```typescript
// In PWAInitializer.tsx
import { updateServiceWorker } from '@/lib/pwa/serviceWorkerRegistration';

// Call when user clicks "Update Now"
updateServiceWorker();
```

---

## Push Notifications Setup

### 1. Generate VAPID Keys

```bash
# Install web-push
npm install -g web-push

# Generate VAPID keys
web-push generate-vapid-keys
```

**Output:**
```
Public Key: BKxxx...xxx
Private Key: xxx...xxx
```

### 2. Configure Environment

```bash
# .env.local
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BKxxx...xxx

# Backend .env
VAPID_PRIVATE_KEY=xxx...xxx
VAPID_PUBLIC_KEY=BKxxx...xxx
```

### 3. Subscribe Users

```typescript
import { subscribeToPushNotifications } from '@/lib/pwa/serviceWorkerRegistration';

// Request permission and subscribe
const subscription = await subscribeToPushNotifications();

// Send subscription to backend
await apiClient.post('/notifications/subscribe', subscription);
```

### 4. Send Push Notifications (Backend)

```python
# Python example using pywebpush
from pywebpush import webpush, WebPushException

subscription_info = {
    "endpoint": "https://...",
    "keys": {
        "p256dh": "...",
        "auth": "..."
    }
}

webpush(
    subscription_info=subscription_info,
    data=json.dumps({
        "title": "New Book Available",
        "body": "Check out the new arrivals!",
        "icon": "/icons/icon-192x192.png"
    }),
    vapid_private_key=VAPID_PRIVATE_KEY,
    vapid_claims={"sub": "mailto:admin@yourdomain.com"}
)
```

---

## Troubleshooting

### Service Worker Not Registering

**Symptoms:** SW doesn't register, console shows errors

**Solutions:**
1. Check HTTPS is enabled (required except localhost)
2. Verify `sw.js` is accessible at `/sw.js`
3. Check browser console for errors
4. Clear browser cache and reload
5. Verify `serviceWorkerRegistration.ts` is imported

**Debug:**
```typescript
navigator.serviceWorker.register('/sw.js')
  .then(reg => console.log('SW registered:', reg))
  .catch(err => console.error('SW registration failed:', err));
```

### App Not Installable

**Symptoms:** No install prompt, install button missing

**Solutions:**
1. Verify manifest is valid (DevTools → Application → Manifest)
2. Check all required manifest fields
3. Ensure service worker is registered
4. Verify HTTPS is enabled
5. Check icon sizes are correct
6. Wait 30+ seconds after first visit

**Required Criteria:**
- Valid manifest.json
- Service worker registered
- HTTPS enabled
- 192x192 and 512x512 icons
- start_url in manifest

### Offline Mode Not Working

**Symptoms:** Pages don't load when offline

**Solutions:**
1. Check service worker caching strategy
2. Verify assets are in precache list
3. Check cache names match
4. Clear all caches and re-register
5. Check Network tab for failed requests

**Debug:**
```javascript
// In service worker
console.log('Caching:', request.url);
console.log('Cache hit:', await caches.match(request));
```

### Barcode Scanner Not Working

**Symptoms:** Camera doesn't start, detection fails

**Solutions:**
1. Verify HTTPS is enabled
2. Grant camera permission
3. Check BarcodeDetector API support
4. Use manual entry fallback
5. Test on different devices/browsers

**Browser Support:**
- Chrome/Edge: Native BarcodeDetector API
- Firefox/Safari: Use manual entry

### Icons Not Displaying

**Symptoms:** Wrong icons or broken images

**Solutions:**
1. Check icon files exist in `public/icons/`
2. Verify icon paths in manifest.json
3. Clear browser cache
4. Check icon file format (PNG required)
5. Verify icon sizes match manifest

**Generate Icons:**
```bash
node scripts/generate-icons.js
# Replace placeholders with actual PNG icons
```

### Cache Not Clearing

**Symptoms:** Old content shows after update

**Solutions:**
1. Update cache version in sw.js
2. Unregister old service worker
3. Clear all site data in DevTools
4. Implement cache cleanup in activate event

**Force Clear:**
```typescript
// Send message to SW
navigator.serviceWorker.controller?.postMessage({
  type: 'CLEAR_CACHE'
});
```

---

## Best Practices

### 1. Performance

- Keep service worker file small
- Cache only essential resources
- Use appropriate cache strategies
- Implement cache cleanup
- Optimize images before caching

### 2. User Experience

- Show install prompt at right time
- Notify users of updates
- Provide offline feedback
- Handle errors gracefully
- Test on slow connections

### 3. Maintenance

- Version your caches
- Monitor service worker errors
- Update regularly
- Test on multiple devices
- Document changes

### 4. Security

- Always use HTTPS
- Validate cached resources
- Implement CSP headers
- Secure push notifications
- Audit dependencies

---

## Additional Resources

### Documentation
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [BarcodeDetector API](https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector)

### Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [PWA Builder](https://www.pwabuilder.com/)
- [Web Push Testing](https://web-push-codelab.glitch.me/)
- [Manifest Generator](https://app-manifest.firebaseapp.com/)

### Support
- GitHub Issues: [NAWRA Repository Issues](https://github.com/jaleelaaa/NAWRA-TEST/issues)
- Documentation: `PHASE_4_IMPLEMENTATION_COMPLETE.md`
- Contact: Your development team

---

## Checklist Summary

### Development
- [ ] Dependencies installed
- [ ] Environment configured
- [ ] Icons generated
- [ ] Service worker registered
- [ ] PWA features tested locally

### Pre-Production
- [ ] Production icons created
- [ ] Manifest customized
- [ ] VAPID keys generated (if using push)
- [ ] Environment variables set
- [ ] Lighthouse score > 90

### Production
- [ ] HTTPS configured
- [ ] CDN configured (optional)
- [ ] Deployed and accessible
- [ ] PWA installable
- [ ] Offline mode working
- [ ] Monitoring configured

### Post-Production
- [ ] User feedback collected
- [ ] Metrics monitored
- [ ] Regular updates scheduled
- [ ] Documentation updated

---

**Version:** 1.0
**Last Updated:** 2025-11-14
**Status:** Production Ready ✅
