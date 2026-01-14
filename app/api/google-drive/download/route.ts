import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DRIVE_API_KEY = process.env.GOOGLE_DRIVE_API_KEY;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    // If API key is not configured, redirect to Google Drive direct download
    if (!DRIVE_API_KEY) {
      const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      return NextResponse.redirect(downloadUrl);
    }

    // Use Google Drive API to get file content
    try {
      const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${DRIVE_API_KEY}`;
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/pdf',
        },
      });

      if (!response.ok) {
        // If API fails, fallback to direct download URL
        const fallbackUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
        return NextResponse.redirect(fallbackUrl);
      }
      
      const fileBuffer = await response.arrayBuffer();
      
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'inline',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } catch (apiError) {
      // If API call fails, redirect to direct download
      const fallbackUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      return NextResponse.redirect(fallbackUrl);
    }

  } catch (error: any) {
    // On any error, redirect to Google Drive direct download as fallback
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("fileId");
    if (fileId) {
      const fallbackUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      return NextResponse.redirect(fallbackUrl);
    }
    
    // If we can't get fileId, return error
    return NextResponse.json(
      { error: "File ID is required" },
      { status: 400 }
    );
  }
}

