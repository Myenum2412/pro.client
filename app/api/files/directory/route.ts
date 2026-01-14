import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

type FileNode = {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  children?: FileNode[];
  extension?: string;
  size?: number;
};

function buildFileTree(dirPath: string, basePath: string = ""): FileNode[] {
  const items: FileNode[] = [];
  
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.join(basePath, entry.name);
      const id = relativePath.replace(/\\/g, "/");
      
      if (entry.isDirectory()) {
        const children = buildFileTree(fullPath, relativePath);
        items.push({
          id,
          name: entry.name,
          type: "folder",
          path: relativePath.replace(/\\/g, "/"),
          children,
        });
      } else {
        const stats = fs.statSync(fullPath);
        const ext = path.extname(entry.name).toLowerCase();
        items.push({
          id,
          name: entry.name,
          type: "file",
          path: relativePath.replace(/\\/g, "/"),
          extension: ext,
          size: stats.size,
        });
      }
    }
  } catch (error) {
    console.error("Error reading directory:", error);
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
    const filesDir = path.join(process.cwd(), "public", "assets", "files");
    
    // Check if directory exists
    if (!fs.existsSync(filesDir)) {
      return NextResponse.json(
        { error: "Files directory not found" },
        { status: 404 }
      );
    }
    
    const fileTree = buildFileTree(filesDir);
    
    return NextResponse.json({ data: fileTree });
  } catch (error) {
    console.error("Error fetching file tree:", error);
    return NextResponse.json(
      { error: "Failed to fetch file tree" },
      { status: 500 }
    );
  }
}

