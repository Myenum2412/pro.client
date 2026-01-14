import { NextResponse } from "next/server"
import path from "path"
import { promises as fs } from "fs"

type AssetNode = {
  name: string
  path: string
  type: "file" | "folder"
  children?: AssetNode[]
}

async function buildTree(dirPath: string, baseUrl: string): Promise<AssetNode[]> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true })

  const nodes = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(dirPath, entry.name)
      const urlPath = path.posix.join(baseUrl, entry.name)

      if (entry.isDirectory()) {
        const children = await buildTree(entryPath, urlPath)
        return {
          name: entry.name,
          path: urlPath,
          type: "folder" as const,
          children,
        }
      }

      return {
        name: entry.name,
        path: urlPath,
        type: "file" as const,
      }
    })
  )

  return nodes
}

export async function GET() {
  try {
    const rootDir = path.join(process.cwd(), "public", "assets")
    const tree = await buildTree(rootDir, "/assets")
    return NextResponse.json({ tree })
  } catch (error) {
    console.error("Failed to read assets directory", error)
    return NextResponse.json({ tree: [], error: "Failed to load assets" }, { status: 500 })
  }
}
