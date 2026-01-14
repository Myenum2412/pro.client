# Google Drive Integration Setup

This guide explains how to set up Google Drive integration for the Files page.

## Prerequisites

1. A Google Cloud Platform account
2. Access to the Google Drive folder you want to integrate

## Setup Steps

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

### 2. Enable Google Drive API

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google Drive API"
3. Click on it and press **Enable**

### 3. Create API Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy the generated API key
4. (Optional but recommended) Click **Restrict Key** and:
   - Under "API restrictions", select "Restrict key"
   - Choose "Google Drive API" from the dropdown
   - Under "Application restrictions", you can restrict by HTTP referrers (websites)

### 4. Configure Your Application

Add the following to your `.env.local` file:

```env
GOOGLE_DRIVE_API_KEY=your_api_key_here
```

### 5. Make Google Drive Folder Public (or Accessible)

For the API key to work, the Google Drive folder must be:

**Option A: Public Access (Recommended for this setup)**
1. Open your Google Drive folder
2. Right-click and select "Share"
3. Click "Change to anyone with the link"
4. Set permission to "Viewer"
5. Copy the folder ID from the URL

**Option B: Service Account (More Secure)**
- Create a service account in Google Cloud Console
- Share the Drive folder with the service account email
- Use OAuth 2.0 instead of API key

### 6. Update Folder ID (if different)

The current folder ID is hardcoded in `app/api/google-drive/files/route.ts`:

```typescript
const FOLDER_ID = "1xWJribcaXEQI7oUe6zPxrL5mXYFc5kOD";
```

To use a different folder:
1. Get the folder ID from the Google Drive URL
2. Update the `FOLDER_ID` constant in the file

## Current Integration

The application uses the following Google Drive folder:
- **Folder URL**: https://drive.google.com/drive/folders/1xWJribcaXEQI7oUe6zPxrL5mXYFc5kOD
- **Folder ID**: `1xWJribcaXEQI7oUe6zPxrL5mXYFc5kOD`

This folder contains:
- PRO 042_U2524_Valley View Business Park Tilt Panels
- PRO 043_U2532_Mid Way South Logistic Centre Panels
- PRO 2124-25_U3223P_PANATTONI LEHIGH 309 BUILDING B TILT PANELS

## API Endpoints

### GET /api/google-drive/files
Fetches the complete file tree from Google Drive.

**Response:**
```json
{
  "data": [
    {
      "id": "file_id",
      "name": "File Name",
      "type": "file" | "folder",
      "path": "path/to/file",
      "extension": ".pdf",
      "size": 123456,
      "driveId": "google_drive_file_id",
      "webViewLink": "https://drive.google.com/...",
      "children": []
    }
  ]
}
```

### GET /api/google-drive/download?fileId={fileId}
Downloads a file from Google Drive (used for PDF preview).

**Parameters:**
- `fileId`: The Google Drive file ID

**Response:**
- Binary file content with appropriate headers

## Features

- ✅ Recursive folder structure loading
- ✅ File metadata (name, size, type)
- ✅ PDF preview integration
- ✅ Automatic file type detection
- ✅ Sorted display (folders first, then alphabetically)

## Limitations

- API key has usage quotas (check Google Cloud Console)
- Files must be accessible with the API key (public or shared)
- Large folders may take time to load (recursive fetching)

## Troubleshooting

### Error: "Google Drive API key not configured"
- Make sure `GOOGLE_DRIVE_API_KEY` is set in `.env.local`
- Restart your development server after adding the key

### Error: "Failed to fetch file tree"
- Check if the folder is publicly accessible
- Verify the folder ID is correct
- Check API key restrictions in Google Cloud Console

### PDF Preview Not Working
- Ensure the file has public access or is shared
- Check browser console for CORS errors
- Verify the API key has Google Drive API enabled

## Security Notes

⚠️ **Important Security Considerations:**

1. **API Key Exposure**: Never commit `.env.local` to version control
2. **Public Access**: Making files public means anyone with the link can view them
3. **Rate Limits**: Google Drive API has quotas - monitor usage in Google Cloud Console
4. **Production**: Consider using OAuth 2.0 with service accounts for production

## Alternative: Service Account Setup (More Secure)

For production environments, consider using a service account:

1. Create a service account in Google Cloud Console
2. Download the JSON key file
3. Share the Drive folder with the service account email
4. Use `@googleapis/drive` npm package with service account credentials
5. Store credentials securely (not in code)

This approach provides better security and doesn't require making files public.

