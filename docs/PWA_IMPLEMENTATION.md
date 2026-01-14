# Progressive Web App (PWA) Implementation

This document describes the PWA implementation for the Proultima application, enabling installation on Windows desktop and mobile devices.

## Features

### ✅ Core PWA Features

1. **Web App Manifest** (`app/manifest.ts` & `public/manifest.webmanifest`)
   - Complete manifest configuration
   - App icons (192x192, 512x512, Apple touch icon)
   - Standalone display mode
   - App shortcuts (Dashboard, Projects, Submissions)
   - Theme color: #10b981 (emerald green)

2. **Service Worker** (`public/sw.js`)
   - Caching strategies:
     - **Cache-first**: Static assets (images, fonts, CSS, JS)
     - **Network-first**: API requests with cache fallback
     - **Network-first with offline fallback**: HTML pages
   - Background caching
   - Offline support
   - Automatic cache updates

3. **Offline Support**
   - Custom offline page (`app/offline/page.tsx`)
   - Graceful degradation when offline
   - Cached API responses available offline

4. **Install Prompt**
   - Automatic install prompt component (`components/pwa/pwa-install-prompt.tsx`)
   - Respects user dismissal (7-day cooldown)
   - Works on Chrome, Edge, and other Chromium-based browsers

5. **Service Worker Registration**
   - Automatic registration in production (`components/pwa/service-worker-register.tsx`)
   - Update detection and notification
   - Background sync support (ready for future enhancements)

## Installation

### For Users (Windows Desktop)

1. **Using Chrome/Edge:**
   - Visit the application in Chrome or Edge
   - Look for the install icon in the address bar (or wait for the install prompt)
   - Click "Install" or the install icon
   - The app will be added to your Start Menu and can be launched like a native app

2. **Manual Installation:**
   - Click the three-dot menu (⋮) in Chrome/Edge
   - Select "Install Proultima" or "Apps" → "Install this site as an app"
   - Follow the prompts

### For Developers

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start the production server:**
   ```bash
   npm start
   ```

3. **Test PWA features:**
   - Open Chrome DevTools (F12)
   - Go to "Application" tab
   - Check "Service Workers" section
   - Check "Manifest" section
   - Use "Lighthouse" to audit PWA compliance

## PWA Audit Checklist

### ✅ Installability
- [x] Valid Web App Manifest
- [x] Service Worker registered
- [x] HTTPS (required for production)
- [x] Icons provided (192x192 and 512x512)
- [x] Start URL configured
- [x] Display mode: standalone

### ✅ Performance
- [x] Static assets cached
- [x] API responses cached with network-first strategy
- [x] Offline fallback page
- [x] Fast load times

### ✅ Best Practices
- [x] Service Worker scope configured
- [x] Cache versioning implemented
- [x] Offline support
- [x] Install prompt with user-friendly UI

## File Structure

```
app/
  ├── manifest.ts              # Next.js manifest route
  ├── viewport.ts              # Viewport and theme color configuration
  ├── offline/
  │   └── page.tsx             # Offline fallback page
  └── layout.tsx               # Root layout with PWA components

components/
  └── pwa/
      ├── service-worker-register.tsx  # Service worker registration
      └── pwa-install-prompt.tsx       # Install prompt component

public/
  ├── sw.js                    # Service worker script
  ├── manifest.webmanifest     # Static manifest file
  ├── android-chrome-192x192.png
  ├── android-chrome-512x512.png
  ├── apple-touch-icon.png
  ├── favicon.ico
  ├── favicon-16x16.png
  └── favicon-32x32.png

next.config.ts                 # Next.js config with PWA headers
```

## Caching Strategies

### Static Assets (Cache-First)
- Images, fonts, CSS, JS files
- Cached immediately on first load
- Served from cache, updated in background

### API Requests (Network-First)
- All `/api/*` routes
- Network request first, cache on success
- Fallback to cache if network fails
- Returns error response if both fail

### HTML Pages (Network-First with Offline Fallback)
- All page routes
- Network request first, cache on success
- Fallback to cached version if offline
- Shows offline page if no cache available

## Service Worker Lifecycle

1. **Install**: Caches static assets
2. **Activate**: Cleans up old caches
3. **Fetch**: Intercepts requests and applies caching strategies
4. **Update**: Detects new service worker versions and prompts update

## Testing PWA Features

### Test Offline Mode
1. Open Chrome DevTools (F12)
2. Go to "Network" tab
3. Check "Offline" checkbox
4. Refresh the page
5. Verify offline page appears or cached content loads

### Test Service Worker
1. Open Chrome DevTools (F12)
2. Go to "Application" tab
3. Click "Service Workers" in sidebar
4. Verify service worker is registered and active
5. Use "Update" and "Unregister" buttons to test

### Test Install Prompt
1. Clear site data (Application → Clear storage)
2. Visit the site
3. Wait for install prompt (or check address bar for install icon)
4. Click install and verify app appears in Start Menu

### Lighthouse Audit
1. Open Chrome DevTools (F12)
2. Go to "Lighthouse" tab
3. Select "Progressive Web App" category
4. Click "Generate report"
5. Verify all PWA checks pass

## Browser Support

- ✅ Chrome/Edge (Windows, macOS, Linux, Android)
- ✅ Firefox (with limitations)
- ✅ Safari (iOS 11.3+, macOS)
- ⚠️ Internet Explorer (not supported)

## Future Enhancements

- [ ] Background sync for offline actions
- [ ] Push notifications
- [ ] Share target API
- [ ] File system access API
- [ ] Periodic background sync

## Troubleshooting

### Service Worker Not Registering
- Ensure you're running in production mode (`npm run build && npm start`)
- Check browser console for errors
- Verify `/sw.js` is accessible
- Check HTTPS is enabled (required for production)

### Install Prompt Not Showing
- Clear browser cache and site data
- Ensure manifest is valid
- Check all required icons are present
- Verify service worker is registered

### Offline Mode Not Working
- Check service worker is active
- Verify assets are being cached
- Check browser console for errors
- Test with DevTools offline mode

## Notes

- Service worker only registers in **production mode** (`NODE_ENV === "production"`)
- Development mode does not register service worker to allow for hot reloading
- Cache versioning is handled via `CACHE_NAME` constant in `sw.js`
- Update cache version to force cache refresh
