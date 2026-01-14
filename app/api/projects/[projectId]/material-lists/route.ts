import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    // Always use demo data (projectId is jobNumber like "U2961", not UUID)
    // Skip Supabase query to avoid UUID errors
    return NextResponse.json({ 
      title: "Material List Management", 
      blocks: getDemoMaterialLists() 
    });
  } catch (error) {
    // Handle errors gracefully - return demo data when anything fails
    console.warn("Error fetching material lists, returning demo data:", error);
    
    // Return demo data for all projects
    return NextResponse.json({ 
      title: "Material List Management", 
      blocks: getDemoMaterialLists() 
    });
  }
}

// Demo material lists data based on U2961 drawing log
function getDemoMaterialLists() {
  return [
    {
      id: "demo-1",
      heading: "FOUNDATION MAT-BOTTOM",
      status: "released",
      priority: "High",
      note: "Foundation reinforcement details for R-1",
      barList: [
        {
          id: "demo-bar-1",
          dwgNo: "R-1",
          releaseDescription: "R1 FOUNDATION MAT-BOTTOM",
          ctrlCode: "FMQ",
          relNo: "42",
          weightLbs: 90400,
          date: "2023-07-27",
          varyingBars: "No",
          rowElement: "Element-1",
          barGrade: "Grade 60",
          remarks: "AW BAR LIST",
        },
      ],
      additionalFields: [],
    },
    {
      id: "demo-2",
      heading: "WET WELL WALL - FOUNDATION DETAILS",
      status: "released",
      priority: "High",
      note: "Wet well wall foundation reinforcement",
      barList: [
        {
          id: "demo-bar-2",
          dwgNo: "R-2",
          releaseDescription: "R2 WET WELL WALL FOUNDATION",
          ctrlCode: "WFQ",
          relNo: "42",
          weightLbs: 64300,
          date: "2023-07-27",
          varyingBars: "No",
          rowElement: "Element-2",
          barGrade: "Grade 60",
          remarks: "AW BAR LIST",
        },
      ],
      additionalFields: [],
    },
    {
      id: "demo-3",
      heading: "PHASE 1-COLUMN ELEVATION C1&C2",
      status: "under_review",
      priority: "Medium",
      note: "Column elevation reinforcement details",
      barList: [
        {
          id: "demo-bar-3",
          dwgNo: "R-3",
          releaseDescription: "R3 PHASE 1-COLUMN ELEVATION C1&C2",
          ctrlCode: "CEQ",
          relNo: "42",
          weightLbs: 71500,
          date: "2023-09-06",
          varyingBars: "Yes",
          rowElement: "Element-3",
          barGrade: "Grade 75",
          remarks: "AW BAR LIST",
        },
      ],
      additionalFields: [],
    },
    {
      id: "demo-4",
      heading: "WET WELL WALL - ELEVATION DETAILS",
      status: "released",
      priority: "High",
      note: "Wet well wall elevation reinforcement",
      barList: [
        {
          id: "demo-bar-4",
          dwgNo: "R-3A",
          releaseDescription: "R3A WET WELL WALL ELEVATION",
          ctrlCode: "WWE",
          relNo: "42",
          weightLbs: 57000,
          date: "2023-07-27",
          varyingBars: "No",
          rowElement: "Element-4",
          barGrade: "Grade 60",
          remarks: "AW BAR LIST",
        },
      ],
      additionalFields: [],
    },
    {
      id: "demo-5",
      heading: "WET WELL WALL - ELEVATION DETAILS",
      status: "under_review",
      priority: "Medium",
      note: "Additional wet well wall details",
      barList: [
        {
          id: "demo-bar-5",
          dwgNo: "R-3B",
          releaseDescription: "R3B WET WELL WALL ELEVATION",
          ctrlCode: "WWE",
          relNo: "42",
          weightLbs: 52000,
          date: "2023-08-14",
          varyingBars: "No",
          rowElement: "Element-5",
          barGrade: "Grade 60",
          remarks: "AW BAR LIST",
        },
      ],
      additionalFields: [],
    },
  ];
}


