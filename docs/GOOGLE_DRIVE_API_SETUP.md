# 🚀 Google Drive API Setup - Complete Guide

You've added the API key! Now follow these steps to complete the setup.

## ✅ Step 1: API Key (DONE)

You've already added `GOOGLE_DRIVE_API_KEY` to your `.env.local` file. ✓

## 📋 Step 2: Make Folder Publicly Accessible

The Google Drive folder must be accessible with your API key. Here's how:

### Option A: Make Folder Public (Recommended for Development)

1. **Open the Google Drive folder**:
   - Go to: https://drive.google.com/drive/folders/1xWJribcaXEQI7oUe6zPxrL5mXYFc5kOD

2. **Share the folder**:
   - Right-click on the folder (or click the folder and press Share button)
   - Click "Share" or "Get link"

3. **Change access**:
   - Click "Change to anyone with the link"
   - Set permission to **"Viewer"**
   - Click "Done"

4. **Verify**:
   - The link should now show "Anyone with the link can view"

### Option B: Share with Service Account (More Secure for Production)

If you want more security:

1. Create a service account in Google Cloud Console
2. Download the service account JSON key
3. Share the Drive folder with the service account email
4. Update the API to use service account credentials

(See `docs/GOOGLE_DRIVE_SETUP.md` for detailed service account setup)

## 🔧 Step 3: Verify API Key Restrictions

Make sure your API key can access the Drive API:

1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Click on your API key
3. Under "API restrictions":
   - Select "Restrict key"
   - Make sure **"Google Drive API"** is checked
4. Under "Application restrictions":
   - For development: Select "None"
   - For production: Add your domain to "HTTP referrers"
5. Click "Save"

## 🎯 Step 4: Test the Integration

1. **Restart your dev server** (if not already done):
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

2. **Navigate to the Files page**:
   - Go to: http://localhost:3000/files

3. **You should see**:
   - Three project folders in the file tree
   - All subfolders and files loaded from Google Drive
   - Click folders to browse
   - Click PDFs to preview
   - Click other files to open in Drive

## ❌ Troubleshooting

### Error: "Google Drive API key not configured"
- Make sure `GOOGLE_DRIVE_API_KEY` is in `.env.local`
- Restart the dev server after adding the key

### Error: "Failed to fetch file tree from Google Drive"
**Most common cause: Folder is not publicly accessible**

1. Check if the folder is shared:
   - Open: https://drive.google.com/drive/folders/1xWJribcaXEQI7oUe6zPxrL5mXYFc5kOD
   - Look for "Anyone with the link" in sharing settings

2. Check API key restrictions:
   - Go to Google Cloud Console
   - Verify Drive API is enabled
   - Check API key has Drive API access

3. Check browser console:
   - Open DevTools (F12)
   - Look for detailed error messages
   - Check Network tab for API responses

### Error: "403 Forbidden"
- API key doesn't have permission to access the folder
- Make sure folder is set to "Anyone with the link can view"
- Or share folder with service account email

### Error: "404 Not Found"
- Folder ID might be incorrect
- Verify the folder exists and you have access

### Files Not Loading
1. Check browser console for errors
2. Verify API key is correct
3. Make sure folder is publicly accessible
4. Check Google Cloud Console for API quota usage

## 📊 Current Configuration

**Folder ID**: `1xWJribcaXEQI7oUe6zPxrL5mXYFc5kOD`

**Folder URL**: https://drive.google.com/drive/folders/1xWJribcaXEQI7oUe6zPxrL5mXYFc5kOD

**Expected Folders**:
- PRO 042_U2524_Valley View Business Park Tilt Panels
- PRO 043_U2532_Mid Way South Logistic Centre Panels
- PRO 2124-25_U3223P_PANATTONI LEHIGH 309 BUILDING B TILT PANELS

## 🔐 Security Notes

### For Development:
- Public folder access is fine
- API key with IP restrictions is acceptable

### For Production:
- Use service account with OAuth 2.0
- Restrict API key to your domain
- Don't commit `.env.local` to version control
- Monitor API usage in Google Cloud Console

## ✨ Features Once Working

- ✅ **Full file tree** - All folders and files loaded
- ✅ **Nested navigation** - Browse through subfolders
- ✅ **PDF preview** - View PDFs in-app
- ✅ **File metadata** - Names, sizes, types
- ✅ **Direct links** - Open files in Google Drive
- ✅ **Search** - Find files quickly
- ✅ **Real-time** - Always shows current Drive contents

## 🆘 Still Having Issues?

1. **Check the server logs**:
   - Look at the terminal where `npm run dev` is running
   - Check for error messages from Google Drive API

2. **Test the API directly**:
   ```
   https://www.googleapis.com/drive/v3/files?q='1xWJribcaXEQI7oUe6zPxrL5mXYFc5kOD'+in+parents&key=YOUR_API_KEY
   ```
   - Replace `YOUR_API_KEY` with your actual key
   - Open in browser to see if it works

3. **Verify folder access**:
   - Open the folder in an incognito window
   - If you can't access it, it's not public

---

**Most Important**: Make sure the Google Drive folder is set to "Anyone with the link can view" ✅

