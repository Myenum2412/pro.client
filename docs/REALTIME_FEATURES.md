# Real-Time Data Rendering System

## Overview

The Files page now features a comprehensive real-time data rendering system that automatically updates the UI without requiring page refreshes. This provides a seamless, modern user experience with instant feedback.

## Key Features

### 1. **Auto-Refresh Polling** ✅
- Automatically fetches latest data from Google Drive every 30 seconds
- Configurable refresh interval
- Can be toggled on/off by the user
- Smart change detection (only updates UI when data actually changes)

### 2. **Manual Refresh** ✅
- Users can manually trigger a refresh at any time
- Visual feedback with spinning refresh icon
- Prevents duplicate requests with abort controller

### 3. **Real-Time Notifications** ✅
- Toast notifications for all important events:
  - ✅ Success: Files updated, operations completed
  - ❌ Error: Failed operations, API errors
  - ℹ️ Info: Settings changed, status updates
  - ⏳ Loading: Long-running operations
- Auto-dismiss after 5 seconds (configurable)
- Persistent notifications for loading states
- Smooth slide-in/out animations

### 4. **Connection Status Indicator** ✅
- Real-time connection status (Connected/Disconnected)
- Visual indicator with color coding:
  - 🟢 Green: Connected and working
  - 🔴 Red: Disconnected or error
- Last updated timestamp with relative time display

### 5. **Skeleton Loaders** ✅
- Beautiful loading states for:
  - File tree (left sidebar)
  - File grid (main content area)
  - File details (preview area)
- Prevents layout shift during loading
- Smooth transitions between loading and loaded states

### 6. **Optimistic UI Updates** ✅
- Instant visual feedback for user actions
- Hover effects and transitions
- Smooth animations for state changes

### 7. **Smart Caching & Request Management** ✅
- Abort controller to cancel pending requests
- Prevents duplicate simultaneous requests
- Efficient change detection
- No-cache headers for fresh data

## Architecture

### Custom Hooks

#### `useRealtimeFiles`
Located: `hooks/use-realtime-files.ts`

Main hook for managing real-time file data:
```typescript
const {
  files,           // Current file tree data
  isLoading,       // Initial loading state
  error,           // Error state
  lastUpdated,     // Timestamp of last update
  refresh,         // Manual refresh function
  isRefreshing,    // Background refresh state
} = useRealtimeFiles({
  autoRefresh: true,
  refreshInterval: 30000,
  onUpdate: (files) => { /* callback */ },
  onError: (error) => { /* callback */ },
});
```

**Features:**
- Automatic polling with configurable interval
- Request cancellation on unmount
- Smart change detection
- Error handling and recovery
- Callback support for updates and errors

#### `useNotifications`
Located: `hooks/use-notifications.ts`

Hook for managing toast notifications:
```typescript
const {
  notifications,        // Array of active notifications
  removeNotification,   // Remove by ID
  success,             // Show success notification
  error,               // Show error notification
  info,                // Show info notification
  loading,             // Show loading notification
} = useNotifications();
```

### Components

#### `RealtimeStatusBar`
Located: `components/files/realtime-status-bar.tsx`

Status bar showing:
- Connection status (Connected/Disconnected)
- Last updated time (relative)
- Auto-refresh toggle button
- Manual refresh button

#### `NotificationContainer` & `NotificationToast`
Located: `components/files/notification-toast.tsx`

Toast notification system with:
- Multiple notification types (success, error, info, loading)
- Auto-dismiss functionality
- Manual dismiss button
- Smooth animations
- Color-coded by type

#### Skeleton Loaders
Located: `components/files/skeleton-loader.tsx`

Three skeleton variants:
- `FileTreeSkeleton`: For file tree sidebar
- `FileGridSkeleton`: For grid view
- `FileDetailsSkeleton`: For detail view

## User Experience Flow

### Initial Load
1. User navigates to `/files`
2. Skeleton loaders display immediately
3. Data fetches from Google Drive API
4. UI smoothly transitions from skeleton to real data
5. Status bar shows "Connected" and last updated time

### Auto-Refresh (Every 30 seconds)
1. Background fetch starts (no UI blocking)
2. Status bar shows spinning refresh icon
3. Data compares with current state
4. If changed:
   - UI updates instantly
   - Success notification appears
   - "Last updated" time refreshes
5. If unchanged:
   - No UI update
   - No notification (silent)

### Manual Refresh
1. User clicks "Refresh" button
2. Info notification: "Refreshing..."
3. Refresh icon spins
4. Data fetches
5. UI updates
6. Success notification: "Files Updated"

### Error Handling
1. API request fails
2. Status bar shows "Disconnected"
3. Error notification appears with message
4. File tree shows error state with "Retry" button
5. User can retry manually

### Auto-Refresh Toggle
1. User clicks "Auto-refresh ON/OFF" button
2. Setting toggles immediately
3. Info notification confirms change
4. Badge updates in status bar
5. Polling starts/stops accordingly

## Configuration

### Refresh Interval
Default: 30 seconds

To change, modify in `file-management-client.tsx`:
```typescript
const { files } = useRealtimeFiles({
  refreshInterval: 60000, // 60 seconds
});
```

### Notification Duration
Default: 5 seconds

To change, modify in notification calls:
```typescript
success("Title", "Message", 10000); // 10 seconds
```

### Recursion Depth (API)
Default: 3 levels deep

To change, modify in `app/api/google-drive/files/route.ts`:
```typescript
if (depth > 5) { // Increase to 5 levels
  return [];
}
```

## Performance Considerations

### Optimizations Implemented
1. **Request Cancellation**: Aborts pending requests when new ones start
2. **Change Detection**: Only updates UI when data actually changes
3. **Debouncing**: Prevents rapid successive refreshes
4. **Lazy Loading**: Components load only when needed
5. **Efficient Re-renders**: React hooks minimize unnecessary renders

### API Rate Limiting
- Google Drive API has rate limits
- 30-second interval is safe for most use cases
- For high-traffic apps, consider increasing to 60+ seconds
- Monitor Google Cloud Console for quota usage

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

### Potential Additions
1. **WebSocket Support**: Real-time push updates instead of polling
2. **Service Worker**: Background sync even when tab is inactive
3. **Offline Mode**: Cache data for offline access
4. **Progressive Loading**: Load folders on-demand instead of all at once
5. **File Upload Progress**: Real-time upload progress bars
6. **Collaborative Indicators**: Show when others are viewing/editing
7. **Change Notifications**: Highlight newly added/modified files

### WebSocket Implementation (Future)
```typescript
// Example structure for WebSocket support
const socket = new WebSocket('wss://api.example.com/files');

socket.onmessage = (event) => {
  const update = JSON.parse(event.data);
  if (update.type === 'file_added') {
    // Update UI instantly
  }
};
```

## Troubleshooting

### Files Not Auto-Refreshing
1. Check if auto-refresh is enabled (status bar)
2. Check browser console for errors
3. Verify Google Drive API key is valid
4. Check network tab for failed requests

### Notifications Not Showing
1. Check browser notification permissions
2. Verify `NotificationContainer` is rendered
3. Check z-index conflicts with other elements

### Performance Issues
1. Reduce refresh interval (increase to 60s+)
2. Limit folder recursion depth in API
3. Check Google Drive API quota
4. Monitor network requests in DevTools

## Testing

### Manual Testing Checklist
- [ ] Initial load shows skeleton loaders
- [ ] Data loads and displays correctly
- [ ] Auto-refresh works every 30 seconds
- [ ] Manual refresh button works
- [ ] Auto-refresh toggle works
- [ ] Notifications appear and dismiss
- [ ] Connection status updates correctly
- [ ] Last updated time is accurate
- [ ] Error states display properly
- [ ] Retry button works after errors

### Automated Testing (Future)
```typescript
// Example test structure
describe('Real-time Files', () => {
  it('should auto-refresh every 30 seconds', async () => {
    // Test implementation
  });
  
  it('should show notifications on update', async () => {
    // Test implementation
  });
});
```

## API Endpoints

### GET `/api/google-drive/files`
Fetches file tree from Google Drive.

**Response:**
```json
{
  "data": [...],
  "message": "Files loaded from Google Drive",
  "driveUrl": "https://drive.google.com/drive/folders/..."
}
```

**Headers:**
- `Cache-Control: no-store` (always fetch fresh data)

## Summary

The real-time data rendering system provides:
- ✅ **Automatic updates** every 30 seconds
- ✅ **Manual refresh** on demand
- ✅ **Real-time notifications** for all events
- ✅ **Connection status** indicator
- ✅ **Skeleton loaders** for smooth UX
- ✅ **Optimistic UI** updates
- ✅ **Smart caching** and request management
- ✅ **Error handling** and recovery

This creates a modern, responsive, and user-friendly file management experience! 🚀

