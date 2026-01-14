# Windows Installation Guide - Proultima

This guide will help you install and run Proultima on Windows manually (without Chrome/Chromium).

## Prerequisites

### 1. Install Node.js (LTS Version)
1. Download Node.js LTS from: https://nodejs.org/
2. Choose the Windows Installer (.msi) for your system (64-bit recommended)
3. Run the installer and follow the setup wizard
4. **Important**: Check "Add to PATH" during installation
5. Verify installation by opening PowerShell/Command Prompt and running:
   ```powershell
   node --version
   npm --version
   ```
   You should see version numbers (e.g., v20.x.x and 10.x.x)

### 2. Install Git (Optional but Recommended)
1. Download Git from: https://git-scm.com/download/win
2. Run the installer with default settings
3. Verify installation:
   ```powershell
   git --version
   ```

## Installation Steps

### Step 1: Navigate to Project Directory
Open PowerShell or Command Prompt and navigate to your project folder:
```powershell
cd C:\Users\amarn\app.client.proultima
```

### Step 2: Install Dependencies
Install all required npm packages:
```powershell
npm install
```
This may take 5-10 minutes depending on your internet speed.

### Step 3: Verify Assets Folder
Ensure your `public/assets/` folder exists with all your files (3GB). The folder structure should be:
```
public/
  assets/
    U2524_Valley View Business Park Tilt Panels/
    U2961_ JMEUC PUMP STATION/
    ... (other project folders)
```

**Important**: The assets folder is NOT bundled with the application. It must be present in the `public/` folder for the app to work.

### Step 4: Configure Environment Variables
1. Create a `.env.local` file in the project root (if it doesn't exist)
2. Add your environment variables (database URLs, API keys, etc.)
3. Example:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   ```

### Step 5: Build the Application
Build the production version:
```powershell
npm run build
```
This will create an optimized production build in the `.next/` folder.

**Note**: The build process does NOT include the assets folder. Assets are served directly from `public/assets/` at runtime.

### Step 6: Start the Application

#### Option A: Development Mode (Recommended for Testing)
```powershell
npm run dev
```
The app will be available at: http://localhost:3000

#### Option B: Production Mode
```powershell
npm start
```
The app will be available at: http://localhost:3000

## Running as a Windows Service (Optional)

To run the application as a Windows service that starts automatically:

### Using PM2 (Recommended)
1. Install PM2 globally:
   ```powershell
   npm install -g pm2
   ```

2. Install PM2 Windows Service:
   ```powershell
   pm2 install pm2-windows-service
   pm2-service-install
   ```

3. Start your app with PM2:
   ```powershell
   pm2 start npm --name "proultima" -- start
   pm2 save
   ```

4. The app will now start automatically on Windows boot.

### Using NSSM (Alternative)
1. Download NSSM from: https://nssm.cc/download
2. Extract and run `nssm.exe install Proultima`
3. Configure:
   - Path: `C:\Program Files\nodejs\node.exe`
   - Startup directory: `C:\Users\amarn\app.client.proultima`
   - Arguments: `npm start`
4. Start the service from Windows Services

## Important Notes

### Assets Folder Size
- The `public/assets/` folder is **3GB** and is **NOT** bundled with the application
- Assets are served directly from the file system at runtime
- Make sure the assets folder is always present in the `public/` directory
- Do NOT commit the assets folder to git (it's already in `.gitignore`)

### Port Configuration
- Default port: **3000**
- To change the port, set the `PORT` environment variable:
  ```powershell
  $env:PORT=3001
  npm start
  ```

### Firewall Configuration
If you want to access the app from other devices on your network:
1. Open Windows Firewall
2. Allow incoming connections on port 3000 (or your custom port)
3. Access the app using: `http://YOUR_IP_ADDRESS:3000`

## Troubleshooting

### Issue: "node is not recognized"
**Solution**: Node.js is not in your PATH. Reinstall Node.js and ensure "Add to PATH" is checked.

### Issue: "npm install" fails
**Solution**: 
- Check your internet connection
- Try clearing npm cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

### Issue: Assets not loading (404 errors)
**Solution**: 
- Verify `public/assets/` folder exists
- Check file permissions (ensure files are readable)
- Verify the path in your code matches the actual folder structure

### Issue: Port 3000 already in use
**Solution**: 
- Change the port: `$env:PORT=3001 npm start`
- Or find and stop the process using port 3000:
  ```powershell
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```

### Issue: Build fails
**Solution**:
- Ensure all dependencies are installed: `npm install`
- Check for TypeScript errors: `npm run lint`
- Clear Next.js cache: Delete `.next` folder and rebuild

## File Structure
```
app.client.proultima/
├── public/
│   └── assets/          # 3GB - NOT bundled, served directly
│       ├── U2524_.../
│       ├── U2961_.../
│       └── ...
├── app/                # Next.js app directory
├── components/         # React components
├── lib/                # Utility libraries
├── .env.local         # Environment variables (create if needed)
├── package.json        # Dependencies
├── next.config.ts     # Next.js configuration
└── tsconfig.json       # TypeScript configuration
```

## Production Deployment Checklist

- [ ] Node.js installed and verified
- [ ] All dependencies installed (`npm install`)
- [ ] Assets folder present in `public/assets/` (3GB)
- [ ] Environment variables configured (`.env.local`)
- [ ] Application builds successfully (`npm run build`)
- [ ] Application runs locally (`npm start`)
- [ ] All assets load correctly (no 404 errors)
- [ ] Windows service configured (if needed)

## Support

For issues or questions:
1. Check the console logs for error messages
2. Verify all prerequisites are installed
3. Ensure the assets folder structure matches the expected format
4. Check that environment variables are properly configured
