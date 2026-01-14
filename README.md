# Proultima - Project Management Application

A comprehensive project management application built with Next.js, React, and TypeScript.

## Quick Start

### Prerequisites
- Node.js 20.x or higher
- npm 10.x or higher

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory with your configuration:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   ```

3. **Ensure assets folder exists:**
   The `public/assets/` folder (3GB) must be present with all project files. This folder is NOT bundled with the application and is served directly from the file system.

4. **Run development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## Important Notes

### Assets Folder
- The `public/assets/` folder contains **3GB** of project files
- Assets are **NOT bundled** with the application build
- Assets are served directly from the `public/` folder at runtime
- The assets folder is excluded from git (see `.gitignore`)

### Windows Installation
For detailed Windows installation instructions, see [WINDOWS_INSTALLATION_GUIDE.md](./WINDOWS_INSTALLATION_GUIDE.md)

## Project Structure

```
├── app/                    # Next.js app directory (routes)
├── components/             # React components
├── lib/                    # Utility libraries and helpers
├── public/                 # Static files
│   └── assets/            # Project assets (3GB - not bundled)
├── hooks/                  # Custom React hooks
└── supabase/               # Database migrations and schema
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Features

- Project management and tracking
- Drawing log and approval workflows
- RFI (Request for Information) management
- File management with multi-format support
- PDF viewing and annotation
- Billing and invoice management
- Real-time updates

## Technology Stack

- **Framework**: Next.js 16
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **State Management**: TanStack Query
- **PDF Processing**: PDF.js, pdf-lib
- **Type Safety**: TypeScript

## Configuration

### Next.js Configuration
The application uses Next.js with Turbopack for faster builds. Configuration is in `next.config.ts`.

### Assets Serving
Assets in `public/assets/` are served statically at `/assets/` URL path. No bundling or optimization is applied to these files.

## Troubleshooting

### Assets Not Loading
- Verify `public/assets/` folder exists
- Check file permissions
- Ensure paths match the expected structure

### Build Errors
- Clear `.next` folder: `rm -rf .next` (Linux/Mac) or `rmdir /s .next` (Windows)
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Port Already in Use
Set a custom port:
```bash
PORT=3001 npm run dev
```

## License

Private - All rights reserved
