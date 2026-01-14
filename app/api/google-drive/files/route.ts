import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type FileNode = {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  children?: FileNode[];
  extension?: string;
  size?: number;
  mimeType?: string;
  webViewLink?: string;
  webContentLink?: string;
  driveId?: string;
};

// Google Drive configuration
const DRIVE_API_KEY = process.env.GOOGLE_DRIVE_API_KEY;
const FOLDER_ID = "1xWJribcaXEQI7oUe6zPxrL5mXYFc5kOD";

async function fetchGoogleDriveFiles(folderId: string): Promise<any[]> {
  try {
    const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${DRIVE_API_KEY}&fields=files(id,name,mimeType,size,webViewLink,webContentLink,thumbnailLink)&pageSize=1000`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Google Drive API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error("Error fetching from Google Drive:", error);
    throw error;
  }
}

async function buildFileTree(folderId: string, basePath: string = "", depth: number = 0): Promise<FileNode[]> {
  // Limit recursion depth to prevent too many API calls
  if (depth > 3) {
    return [];
  }

  const items: FileNode[] = [];
  
  try {
    const files = await fetchGoogleDriveFiles(folderId);
    
    for (const file of files) {
      const isFolder = file.mimeType === "application/vnd.google-apps.folder";
      const relativePath = basePath ? `${basePath}/${file.name}` : file.name;
      
      if (isFolder) {
        // Recursively fetch folder contents
        const children = await buildFileTree(file.id, relativePath, depth + 1);
        items.push({
          id: file.id,
          name: file.name,
          type: "folder",
          path: relativePath,
          children,
          driveId: file.id,
          webViewLink: file.webViewLink,
        });
      } else {
        // Get file extension
        const ext = file.name.includes('.') 
          ? '.' + file.name.split('.').pop()?.toLowerCase() 
          : '';
        
        items.push({
          id: file.id,
          name: file.name,
          type: "file",
          path: relativePath,
          extension: ext,
          size: parseInt(file.size || "0"),
          mimeType: file.mimeType,
          driveId: file.id,
          webViewLink: file.webViewLink,
          webContentLink: file.webContentLink,
        });
      }
    }
  } catch (error) {
    console.error("Error building file tree:", error);
  }
  
  return items.sort((a, b) => {
    // Folders first, then files
    if (a.type !== b.type) {
      return a.type === "folder" ? -1 : 1;
    }
    // Alphabetical within each type
    return a.name.localeCompare(b.name);
  });
}

export async function GET() {
  try {
    if (!DRIVE_API_KEY) {
      return NextResponse.json(
        { error: "Google Drive API key not configured. Please add GOOGLE_DRIVE_API_KEY to your .env.local file." },
        { status: 500 }
      );
    }
    
    console.log("Fetching files from Google Drive folder:", FOLDER_ID);
    const fileTree = await buildFileTree(FOLDER_ID);
    console.log(`Successfully fetched ${fileTree.length} items from Google Drive`);
    
    const response = NextResponse.json({ 
      data: fileTree,
      message: "Files loaded from Google Drive",
      driveUrl: `https://drive.google.com/drive/folders/${FOLDER_ID}`,
      timestamp: new Date().toISOString(),
    });

    // Set cache control headers for real-time updates
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    
    return response;
  } catch (error: any) {
    console.error("Error fetching Google Drive file tree:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch file tree from Google Drive" },
      { status: 500 }
    );
  }
}

