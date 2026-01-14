import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { demoProjects } from "@/public/assets";

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

function buildFileTree(dirPath: string, basePath: string = "", assetBasePath: string = ""): FileNode[] {
  const items: FileNode[] = [];
  
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      // Skip hidden files
      if (entry.name.startsWith(".")) {
        continue;
      }

      const fullPath = path.join(dirPath, entry.name);
      const relativePath = basePath ? path.join(basePath, entry.name) : entry.name;
      const id = relativePath.replace(/\\/g, "/");
      
      if (entry.isDirectory()) {
        const children = buildFileTree(fullPath, relativePath, assetBasePath);
        items.push({
          id,
          name: entry.name,
          type: "folder",
          path: `${assetBasePath}/${relativePath.replace(/\\/g, "/")}`,
          children,
        });
      } else {
        const stats = fs.statSync(fullPath);
        const ext = path.extname(entry.name).toLowerCase();
        items.push({
          id,
          name: entry.name,
          type: "file",
          path: `${assetBasePath}/${relativePath.replace(/\\/g, "/")}`,
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

// Build project folder name from jobNumber and projectName
function buildProjectFolderName(jobNumber: string, projectName?: string): string {
  let projectFolder = jobNumber || '';
  if (projectName) {
    const sanitizedProjectName = projectName.trim();
    // Check if project folder already includes project name pattern
    if (!projectFolder.includes(sanitizedProjectName)) {
      // Check if it's a "PRO XXX_" format
      const proMatch = projectFolder.match(/^(PRO\s*\d+[_-])/i);
      if (proMatch) {
        projectFolder = `${proMatch[1]}${sanitizedProjectName}`;
      } else {
        // Add space after underscore for certain project formats (e.g., "U2961_ JMEUC PUMP STATION")
        projectFolder = `${projectFolder}_ ${sanitizedProjectName}`;
      }
    }
  }
  return projectFolder;
}

// Find the actual folder name in the file system (case-insensitive, handles spaces)
function findActualProjectFolder(assetsDir: string, jobNumber: string, projectName?: string): string | null {
  try {
    if (!fs.existsSync(assetsDir)) {
      return null;
    }
    
    const entries = fs.readdirSync(assetsDir, { withFileTypes: true });
    const jobNumberLower = jobNumber.toLowerCase();
    
    // First, try exact match with buildProjectFolderName
    const expectedFolder = buildProjectFolderName(jobNumber, projectName);
    const exactMatch = entries.find(
      (entry) => entry.isDirectory() && entry.name === expectedFolder
    );
    if (exactMatch) {
      return exactMatch.name;
    }
    
    // Try to find folder that starts with job number (case-insensitive)
    const matchingFolders = entries.filter(
      (entry) => entry.isDirectory() && entry.name.toLowerCase().startsWith(jobNumberLower)
    );
    
    if (matchingFolders.length === 1) {
      return matchingFolders[0].name;
    }
    
    // If multiple matches, try to find the one that includes project name
    if (projectName && matchingFolders.length > 0) {
      const projectNameLower = projectName.toLowerCase();
      const nameMatch = matchingFolders.find(
        (entry) => entry.name.toLowerCase().includes(projectNameLower)
      );
      if (nameMatch) {
        return nameMatch.name;
      }
    }
    
    // Return first match if found
    if (matchingFolders.length > 0) {
      return matchingFolders[0].name;
    }
    
    return null;
  } catch (error) {
    console.error("Error finding project folder:", error);
    return null;
  }
}

/**
 * GET /api/files/project/[projectId]
 * 
 * Returns file tree for a specific project folder from /public/assets/{projectFolder}
 * where projectFolder is built from jobNumber and projectName (e.g., "U2961_ JMEUC PUMP STATION")
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    
    // Decode the project ID (it might be URL encoded)
    const decodedProjectId = decodeURIComponent(projectId);
    
    // Find project in demo data to get project name
    const project = demoProjects.find(
      (p) => p.jobNumber === decodedProjectId || decodedProjectId.includes(p.jobNumber)
    );
    
    // Look in /public/assets/{projectFolder} instead of /public/assets/files/{projectId}
    const assetsDir = path.join(process.cwd(), "public", "assets");
    
    // Try to find the actual folder name in the file system
    // This handles cases where folder names might have different spacing or formatting
    const actualFolderName = findActualProjectFolder(assetsDir, decodedProjectId, project?.name);
    
    if (!actualFolderName) {
      // Fallback to building the folder name
      const projectFolderName = buildProjectFolderName(
        decodedProjectId,
        project?.name
      );
      const projectDir = path.join(assetsDir, projectFolderName);
      
      if (!fs.existsSync(projectDir)) {
        // Lazy evaluation: only compute available folders when error occurs
        let availableFolders = "assets directory not found";
        try {
          if (fs.existsSync(assetsDir)) {
            const dirs = fs.readdirSync(assetsDir).filter(f => {
              try {
                return fs.statSync(path.join(assetsDir, f)).isDirectory();
              } catch {
                return false;
              }
            });
            availableFolders = dirs.length > 0 ? dirs.join(", ") : "no directories found";
          }
        } catch {
          // Keep default message if directory read fails
        }
        
        return NextResponse.json(
          { 
            data: [],
            error: "Project directory not found",
            message: `The project folder "${projectFolderName}" does not exist at ${projectDir}. Available folders: ${availableFolders}.`
          },
          { status: 404 }
        );
      }
      
      // Use the fallback folder name
      const assetBasePath = `/assets/${projectFolderName}`;
      const fileTree = buildFileTree(projectDir, projectFolderName, assetBasePath);
      
      return NextResponse.json({ 
        data: fileTree,
        projectId: decodedProjectId,
        projectFolder: projectFolderName,
        count: fileTree.length,
        timestamp: new Date().toISOString(),
      });
    }
    
    // Use the actual folder name found in the file system
    // Guard against null/undefined to prevent Turbopack warnings
    if (!actualFolderName || typeof actualFolderName !== 'string') {
      return NextResponse.json(
        { 
          data: [],
          error: "Invalid project folder",
          message: "Could not determine project folder name."
        },
        { status: 400 }
      );
    }
    
    const projectDir = path.join(assetsDir, actualFolderName);
    
    // Check if it's actually a directory
    if (!fs.statSync(projectDir).isDirectory()) {
      return NextResponse.json(
        { 
          data: [],
          error: "Invalid project path",
          message: `"${actualFolderName}" is not a directory.`
        },
        { status: 400 }
      );
    }
    
    // Build asset base path for file URLs
    const assetBasePath = `/assets/${actualFolderName}`;
    const fileTree = buildFileTree(projectDir, actualFolderName, assetBasePath);
    
    return NextResponse.json({ 
      data: fileTree,
      projectId: decodedProjectId,
      projectFolder: actualFolderName,
      count: fileTree.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching project files:", error);
    return NextResponse.json(
      { 
        data: [],
        error: "Failed to fetch project files",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

