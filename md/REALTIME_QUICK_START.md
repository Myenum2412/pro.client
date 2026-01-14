# 🚀 Real-Time Files - Quick Start Guide

## What's New?

Your Files page now updates automatically without page refreshes! Here's what you get:

### ✨ Key Features

1. **Auto-Refresh** - Files update every 30 seconds automatically
2. **Manual Refresh** - Click the refresh button anytime
3. **Live Notifications** - See updates, errors, and status changes
4. **Connection Status** - Know if you're connected to Google Drive
5. **Smooth Loading** - Beautiful skeleton loaders while data loads
6. **No Interruptions** - Browse files while updates happen in background

## 🎯 How to Use

### Status Bar (Top of Files Page)

```
[🟢 Connected] [Updated 5s ago] [Auto-refresh: 30s] [Auto-refresh ON] [🔄 Refresh]
```

**Controls:**
- **Auto-refresh ON/OFF** - Toggle automatic updates
- **Refresh Button** - Manually refresh files anytime

### Notifications (Top Right)

You'll see toast notifications for:
- ✅ **Success**: "Files Updated - Loaded 25 items from Google Drive"
- ❌ **Error**: "Update Failed - Connection error"
- ℹ️ **Info**: "Auto-refresh Enabled - Files will refresh every 30 seconds"
- ⏳ **Loading**: "Refreshing... - Fetching latest files"

### Connection Status

- 🟢 **Green "Connected"** = Everything working
- 🔴 **Red "Disconnected"** = API error or no connection

### Last Updated Time

Shows when files were last refreshed:
- "Just now" (< 10 seconds)
- "30s ago" (< 1 minute)
- "5m ago" (< 1 hour)
- "2h ago" (< 24 hours)
- Or exact time for older updates

## 📋 Common Scenarios

### Scenario 1: Someone Adds Files to Google Drive

**What happens:**
1. Within 30 seconds, auto-refresh kicks in
2. You see notification: "Files Updated"
3. New files appear instantly in the tree
4. No page reload needed! ✨

### Scenario 2: You Want Fresh Data NOW

**What to do:**
1. Click the **"Refresh"** button
2. See "Refreshing..." notification
3. Files update immediately
4. Done! 🎉

### Scenario 3: Working on Something, Don't Want Interruptions

**What to do:**
1. Click **"Auto-refresh ON"** to turn it OFF
2. See notification: "Auto-refresh Disabled"
3. Work without interruptions
4. Click **"Refresh"** manually when ready

### Scenario 4: Connection Lost

**What happens:**
1. Status shows 🔴 "Disconnected"
2. Error notification appears
3. File tree shows "Failed to load files" with **Retry** button
4. Click **Retry** to reconnect

## ⚙️ Settings

### Change Auto-Refresh Interval

Default: 30 seconds

To change, edit `components/files/file-management-client.tsx`:

```typescript
const { files } = useRealtimeFiles({
  refreshInterval: 60000, // Change to 60 seconds
});
```

### Disable Auto-Refresh by Default

```typescript
const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false); // Change to false
```

### Change Notification Duration

Default: 5 seconds

```typescript
success("Title", "Message", 10000); // Change to 10 seconds
```

## 🔧 Troubleshooting

### Files Not Auto-Updating

**Check:**
1. Is auto-refresh ON? (Check status bar)
2. Are you connected? (🟢 Green status)
3. Is your API key valid? (Check `.env.local`)
4. Any errors in browser console? (Press F12)

**Fix:**
- Click **"Auto-refresh OFF"** then **"Auto-refresh ON"** to restart
- Click **"Refresh"** to manually update
- Check your Google Drive API key

### Notifications Not Showing

**Check:**
1. Are notifications blocked in browser?
2. Is another element covering them?
3. Any console errors?

**Fix:**
- Check browser notification settings
- Inspect element (F12) to check z-index
- Reload page

### Too Many API Requests

**Symptoms:**
- Google Drive API quota exceeded
- 429 "Too Many Requests" errors

**Fix:**
- Increase refresh interval to 60+ seconds
- Turn off auto-refresh when not needed
- Check Google Cloud Console quota

### Slow Performance

**Symptoms:**
- Page feels sluggish
- Updates take long time

**Fix:**
- Reduce folder recursion depth in API
- Increase refresh interval
- Check network speed
- Clear browser cache

## 🎨 UI Components

### Status Bar
- Shows connection status
- Last updated time
- Auto-refresh toggle
- Manual refresh button

### Notifications
- Auto-dismiss after 5 seconds
- Color-coded by type
- Manual dismiss with X button
- Stacks multiple notifications

### Skeleton Loaders
- File tree skeleton (sidebar)
- File grid skeleton (main area)
- File details skeleton (preview)

## 📊 Performance

### Optimizations
- ✅ Request cancellation (no duplicate requests)
- ✅ Smart change detection (only update when needed)
- ✅ Efficient re-renders (React hooks)
- ✅ Lazy loading (components load on demand)
- ✅ Cache headers (always fresh data)

### Best Practices
- Keep refresh interval ≥ 30 seconds
- Turn off auto-refresh when not needed
- Monitor API quota in Google Cloud Console
- Use manual refresh for immediate updates

## 🔐 Security

- API key stored in `.env.local` (never exposed to client)
- All requests server-side (Next.js API routes)
- No sensitive data in browser
- HTTPS required for production

## 📱 Mobile Support

Works perfectly on:
- ✅ iOS Safari
- ✅ Chrome Mobile
- ✅ Firefox Mobile
- ✅ Edge Mobile

**Mobile-specific features:**
- Touch-friendly buttons
- Responsive notifications
- Optimized for small screens

## 🚀 Next Steps

1. **Test it out**: Go to `/files` and watch it auto-update
2. **Toggle auto-refresh**: See how it affects updates
3. **Add files to Google Drive**: Watch them appear automatically
4. **Check notifications**: See real-time feedback

## 📚 Learn More

- **Full Documentation**: See `docs/REALTIME_FEATURES.md`
- **API Documentation**: See `docs/GOOGLE_DRIVE_SETUP.md`
- **Component Details**: Check individual component files

## 💡 Tips & Tricks

1. **Keep auto-refresh ON** for monitoring files
2. **Turn it OFF** when editing or focused work
3. **Use manual refresh** for immediate updates
4. **Watch the status bar** for connection issues
5. **Check notifications** for important updates

## ❓ FAQ

**Q: Does auto-refresh work when tab is inactive?**
A: Yes, but browser may throttle it. Consider WebSocket for true real-time.

**Q: Can I change the refresh interval?**
A: Yes, edit `refreshInterval` in `file-management-client.tsx`.

**Q: Does it work offline?**
A: No, requires internet connection. Offline mode is a future enhancement.

**Q: Will it drain my API quota?**
A: 30-second interval is safe. Monitor in Google Cloud Console.

**Q: Can I get instant updates (< 30s)?**
A: Use manual refresh for instant. WebSocket support is planned for future.

---

**Enjoy your real-time file management experience! 🎉**

If you encounter any issues, check the troubleshooting section or open an issue.

