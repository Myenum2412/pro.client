import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

type SidebarProjectItem = {
  id: string;
  name: string;
  type: "folder" | "file";
  path: string;
  children?: SidebarProjectItem[];
};

/**
 * Standard project folder structure
 * These folders will always appear for every project in the specified order
 */
const STANDARD_PROJECT_FOLDERS = [
  { name: "AE Commands", order: 1 },
  { name: "Contract Drawing", order: 2 },
  { name: "Documents", order: 3 },
  { name: "Approval Drawing", order: 4 },
  { name: "FFu", order: 5 },
  { name: "Take Order", order: 6 },
];

/**
 * Ensure standard folders are present in the children array
 */
function ensureStandardFolders(children: SidebarProjectItem[], projectPath: string): SidebarProjectItem[] {
  const foundFolders = new Map<string, SidebarProjectItem>();
  const existingFiles: SidebarProjectItem[] = [];
  const otherFolders: SidebarProjectItem[] = [];
  
  // Separate existing folders and files
  children.forEach((item) => {
    if (item.type === "folder") {
      foundFolders.set(item.name.toLowerCase(), item);
    } else {
      existingFiles.push(item);
    }
  });
  
  // Build final folders array with standard folders in correct order
  const finalFolders: SidebarProjectItem[] = [];
  const standardFolderNames = STANDARD_PROJECT_FOLDERS.map((f) => f.name.toLowerCase());
  
  // Add standard folders in order
  for (const standardFolder of STANDARD_PROJECT_FOLDERS) {
    const existingFolder = foundFolders.get(standardFolder.name.toLowerCase());
    
    if (existingFolder) {
      // Use existing folder (preserves its children)
      finalFolders.push(existingFolder);
      foundFolders.delete(standardFolder.name.toLowerCase());
    } else {
      // Create placeholder standard folder
      const relativePath = path.join(projectPath, standardFolder.name);
      const id = relativePath.replace(/\\/g, "/");
      
      finalFolders.push({
        id,
        name: standardFolder.name,
        type: "folder",
        path: `/assets/files/${relativePath.replace(/\\/g, "/")}`,
        children: [],
      });
    }
  }
  
  // Add other non-standard folders alphabetically
  const remainingFolders = Array.from(foundFolders.values())
    .filter((folder) => !standardFolderNames.includes(folder.name.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));
  
  finalFolders.push(...remainingFolders);
  
  // Sort files alphabetically
  existingFiles.sort((a, b) => a.name.localeCompare(b.name));
  
  return [...finalFolders, ...existingFiles];
}

/**
 * Recursively build file tree structure
 */
function buildFileTree(dirPath: string, basePath: string = "", maxDepth: number = 2): SidebarProjectItem[] {
  const items: SidebarProjectItem[] = [];
  const foundFolders = new Set<string>();
  
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      // Skip hidden files and system files
      if (entry.name.startsWith(".")) {
        continue;
      }

      // Skip RFI folders
      if (entry.name.toUpperCase().includes("RFI") || entry.name.toUpperCase() === "RFI") {
        continue;
      }

      const fullPath = path.join(dirPath, entry.name);
      const relativePath = basePath ? path.join(basePath, entry.name) : entry.name;
      const id = relativePath.replace(/\\/g, "/");
      
      if (entry.isDirectory()) {
        foundFolders.add(entry.name);
        // Only include children if we haven't exceeded max depth
        const children = maxDepth > 0 ? buildFileTree(fullPath, relativePath, maxDepth - 1) : [];
        
        items.push({
          id,
          name: entry.name,
          type: "folder",
          path: `/assets/files/${relativePath.replace(/\\/g, "/")}`,
          ...(children.length > 0 && { children }),
        });
      } else {
        items.push({
          id,
          name: entry.name,
          type: "file",
          path: `/assets/files/${relativePath.replace(/\\/g, "/")}`,
        });
      }
    }
  } catch {
    // Silently handle directory read errors
  }
  
  // If this is a project root level (basePath is empty or just project name), ensure standard folders exist
  if (!basePath || basePath.split(path.sep).length === 1) {
    const standardFolders: SidebarProjectItem[] = [];
    
    for (const standardFolder of STANDARD_PROJECT_FOLDERS) {
      // Check if folder exists (case-insensitive match)
      const folderExists = Array.from(foundFolders).some(
        (folder) => folder.toLowerCase() === standardFolder.name.toLowerCase()
      );
      
      if (!folderExists) {
        // Create placeholder folder entry
        const relativePath = basePath 
          ? path.join(basePath, standardFolder.name) 
          : standardFolder.name;
        const id = relativePath.replace(/\\/g, "/");
        
        standardFolders.push({
          id,
          name: standardFolder.name,
          type: "folder",
          path: `/assets/files/${relativePath.replace(/\\/g, "/")}`,
          children: [], // Empty folder
        });
      }
    }
    
    // Merge standard folders with existing items, maintaining order
    const allItems = [...items];
    
    // Insert standard folders in their correct positions
    for (const standardFolder of STANDARD_PROJECT_FOLDERS) {
      const existingIndex = allItems.findIndex(
        (item) => item.type === "folder" && 
        item.name.toLowerCase() === standardFolder.name.toLowerCase()
      );
      
      if (existingIndex === -1) {
        // Standard folder doesn't exist, add it
        const relativePath = basePath 
          ? path.join(basePath, standardFolder.name) 
          : standardFolder.name;
        const id = relativePath.replace(/\\/g, "/");
        
        allItems.splice(standardFolder.order - 1, 0, {
          id,
          name: standardFolder.name,
          type: "folder",
          path: `/assets/files/${relativePath.replace(/\\/g, "/")}`,
          children: [],
        });
      } else {
        // Standard folder exists, ensure it's in the correct position
        const existingItem = allItems[existingIndex];
        allItems.splice(existingIndex, 1);
        allItems.splice(standardFolder.order - 1, 0, existingItem);
      }
    }
    
    // Separate folders and files, then sort
    const folders = allItems.filter((item) => item.type === "folder");
    const files = allItems.filter((item) => item.type === "file");
    
    // Sort standard folders by order, then other folders alphabetically
    const standardFolderNames = STANDARD_PROJECT_FOLDERS.map((f) => f.name.toLowerCase());
    folders.sort((a, b) => {
      const aIsStandard = standardFolderNames.includes(a.name.toLowerCase());
      const bIsStandard = standardFolderNames.includes(b.name.toLowerCase());
      
      if (aIsStandard && bIsStandard) {
        const aOrder = STANDARD_PROJECT_FOLDERS.find(
          (f) => f.name.toLowerCase() === a.name.toLowerCase()
        )!.order;
        const bOrder = STANDARD_PROJECT_FOLDERS.find(
          (f) => f.name.toLowerCase() === b.name.toLowerCase()
        )!.order;
        return aOrder - bOrder;
      }
      
      if (aIsStandard) return -1;
      if (bIsStandard) return 1;
      
      return a.name.localeCompare(b.name);
    });
    
    files.sort((a, b) => a.name.localeCompare(b.name));
    
    return [...folders, ...files];
  }
  
  // For non-root levels, sort normally
  return items.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "folder" ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}

/**
 * GET /api/sidebar/projects
 * 
 * Returns top-level folders from /public/assets/files as projects,
 * with files inside each folder as children.
 */
export async function GET() {
  try {
    const filesDir = path.join(process.cwd(), "public", "assets", "files");
    
    // Check if directory exists
    if (!fs.existsSync(filesDir)) {
      return NextResponse.json(
        { 
          data: [],
          error: "Files directory not found",
          message: "The files directory does not exist. Please ensure /public/assets/files exists."
        },
        { status: 200 } // Return empty array instead of error
      );
    }
    
    // Read top-level entries only (these will be our "Projects")
    const entries = fs.readdirSync(filesDir, { withFileTypes: true });
    const projects: SidebarProjectItem[] = [];
    
    for (const entry of entries) {
      // Skip hidden files and system files
      if (entry.name.startsWith(".")) {
        continue;
      }

      // Skip RFI folders
      if (entry.name.toUpperCase().includes("RFI") || entry.name.toUpperCase() === "RFI") {
        continue;
      }

      const fullPath = path.join(filesDir, entry.name);
      const relativePath = entry.name;
      const id = relativePath.replace(/\\/g, "/");
      
      if (entry.isDirectory()) {
        // Build children (files and subfolders) for this project - allow deeper nesting
        const children = buildFileTree(fullPath, relativePath, 3); // Allow up to 3 levels deep for sidebar
        
        // Ensure standard folders are always present for each project
        const childrenWithStandardFolders = ensureStandardFolders(children, relativePath);
        
        projects.push({
          id,
          name: entry.name,
          type: "folder",
          path: `/assets/files/${relativePath.replace(/\\/g, "/")}`,
          ...(childrenWithStandardFolders.length > 0 && { children: childrenWithStandardFolders }),
        });
      } else {
        // Top-level files (if any) are also included
        projects.push({
          id,
          name: entry.name,
          type: "file",
          path: `/assets/files/${relativePath.replace(/\\/g, "/")}`,
        });
      }
    }
    
    // Sort projects: folders first, then files, both alphabetically
    const sortedProjects = projects.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "folder" ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
    
    return NextResponse.json({ 
      data: sortedProjects,
      count: sortedProjects.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching sidebar projects:", error);
    return NextResponse.json(
      { 
        data: [],
        error: "Failed to fetch projects",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

