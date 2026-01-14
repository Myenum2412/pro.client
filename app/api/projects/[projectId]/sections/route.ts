import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { parsePaginationParams, createPaginatedResponse } from "@/lib/api/pagination";
import { resolvePdfPath, normalizePdfPath, type ModuleType } from "@/lib/utils/pdf-path-resolver";
import { demoDrawings, demoInvoices, demoSubmissions, demoChangeOrders, demoProjects } from "@/public/assets";
import rfiJmrucData from "@/components/rfi-jmruc.json";

export const dynamic = "force-dynamic";
export const revalidate = 0; // Disable caching

type SectionKey =
  | "drawings_yet_to_return"
  | "drawings_yet_to_release"
  | "drawing_log"
  | "invoice_history"
  | "upcoming_submissions"
  | "change_orders"
  | "rfi_submissions";

function isSectionKey(value: string | null): value is SectionKey {
  return (
    value === "drawings_yet_to_return" ||
    value === "drawings_yet_to_release" ||
    value === "drawing_log" ||
    value === "invoice_history" ||
    value === "upcoming_submissions" ||
    value === "change_orders" ||
    value === "rfi_submissions"
  );
}

// Map project ID to job number (using demo projects)
function getJobNumberFromProjectId(projectId: string): string | null {
  // For demo purposes, we'll use a simple mapping
  // In a real app, you'd query the database, but here we'll use the demo projects
  const project = demoProjects.find((p) => p.jobNumber === projectId || projectId.includes(p.jobNumber));
  return project?.jobNumber || projectId; // Fallback to projectId if not found
}

// Generate a stable ID from drawing data
function generateDrawingId(jobNumber: string, dwgNo: string, section: string): string {
  return `${jobNumber}-${section}-${dwgNo}`.replace(/[^a-zA-Z0-9-]/g, '-');
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  let projectId: string = "";
  let section: string | null = null;
  let page = 1;
  let pageSize = 20;
  
  try {
    const resolvedParams = await params;
    projectId = resolvedParams.projectId;
    const { searchParams } = new URL(request.url);
    section = searchParams.get("section");
    const pagination = parsePaginationParams(searchParams);
    page = pagination.page;
    pageSize = pagination.pageSize;

    if (!isSectionKey(section)) {
      return NextResponse.json({ message: "Invalid section" }, { status: 400 });
    }

    // Get job number from project ID
    // Project ID can be either a UUID or a job number
    let jobNumber = getJobNumberFromProjectId(projectId);
    
    // Find project in demo data
    let project = demoProjects.find((p) => p.jobNumber === jobNumber);
    
    // If project not found by ID, try using projectId directly as jobNumber
    if (!project && projectId) {
      project = demoProjects.find((p) => p.jobNumber === projectId);
      if (project) {
        jobNumber = project.jobNumber;
      }
    }
    
    // If still not found, return empty data instead of error
    if (!project || !jobNumber) {
      const emptyPaginated = createPaginatedResponse([], page, pageSize);
      return NextResponse.json(emptyPaginated);
    }

    if (
      section === "drawings_yet_to_return" ||
      section === "drawings_yet_to_release" ||
      section === "drawing_log"
    ) {
      // Filter drawings from demo data by job number and section
      const sectionMap: Record<string, string> = {
        "drawing_log": "drawing_log",
        "drawings_yet_to_release": "released_drawings",
        "drawings_yet_to_return": "drawings_yet_to_return",
      };
      
      const targetSection = sectionMap[section];
      let filteredDrawings = demoDrawings.filter(
        (d) => d.jobNumber === jobNumber && d.section === targetSection
      );
      
      // For drawings_yet_to_release section, only show entries with status "APP"
      if (section === "drawings_yet_to_release") {
        // If no entries in released_drawings section, use drawing_log entries with status "APP"
        if (filteredDrawings.length === 0) {
          filteredDrawings = demoDrawings.filter(
            (d) => d.jobNumber === jobNumber && d.section === "drawing_log" && d.status === "APP"
          );
        } else {
          // Filter to only show APP status entries
          filteredDrawings = filteredDrawings.filter((d) => d.status === "APP");
        }
      }

      // Sort by drawing number (ascending) for drawing_log, otherwise by date (descending)
      if (section === "drawing_log") {
        filteredDrawings.sort((a, b) => {
          // Sort by drawing number in ascending order (R-1, R-2, R-3, R-3A, etc.)
          const dwgNoA = a.dwgNo || "";
          const dwgNoB = b.dwgNo || "";
          return dwgNoA.localeCompare(dwgNoB, undefined, { numeric: true, sensitivity: 'base' });
        });
      } else {
        // Sort by latest submitted date (descending) for other sections
        filteredDrawings.sort((a, b) => {
          const dateA = new Date(a.latestSubmittedDate || 0).getTime();
          const dateB = new Date(b.latestSubmittedDate || 0).getTime();
          return dateB - dateA;
        });
      }

      const mappedDrawings = filteredDrawings.map((d) => {
        const dwgNo = d.dwgNo || '';
        const drawingId = generateDrawingId(jobNumber, dwgNo, section || '');
        
        // First, try to find actual file in "05 Approval Drawings" folder (supports all formats)
        let actualFilePath: string | null = null;
        
        // Build project folder name - handle different formats:
        // - "U2961_ JMEUC PUMP STATION" (with space after underscore)
        // - "U2524_Valley View Business Park Tilt Panels" (no space after underscore)
        let projectFolder = jobNumber;
        if (project.name) {
          const sanitizedProjectName = project.name.trim();
          // Check if it's a "PRO XXX_" format (e.g., "PRO 042_U2524_...")
          const proMatch = jobNumber.match(/^(PRO\s*\d+[_-])/i);
          if (proMatch) {
            projectFolder = `${proMatch[1]}${sanitizedProjectName}`;
          } else {
            // For U2961 format: use space after underscore
            // For U2524 format: no space after underscore
            // Try to detect which format to use based on project name or job number
            if (jobNumber === "U2961") {
              projectFolder = `${jobNumber}_ ${sanitizedProjectName}`;
            } else {
              // Default: no space after underscore (U2524 format)
              projectFolder = `${jobNumber}_${sanitizedProjectName}`;
            }
          }
        }
        
        // Try to find the actual folder name in the file system (handles case variations)
        const assetsDir = path.join(process.cwd(), "public", "assets");
        let actualProjectFolder: string | null = null;
        
        if (fs.existsSync(assetsDir)) {
          try {
            const entries = fs.readdirSync(assetsDir, { withFileTypes: true });
            const projectFolderLower = projectFolder.toLowerCase();
            
            // Try exact match first
            const exactMatch = entries.find(
              (entry) => entry.isDirectory() && entry.name.toLowerCase() === projectFolderLower
            );
            if (exactMatch) {
              actualProjectFolder = exactMatch.name;
            } else {
              // Try case-insensitive match
              const caseMatch = entries.find(
                (entry) => entry.isDirectory() && entry.name.toLowerCase() === projectFolderLower
              );
              if (caseMatch) {
                actualProjectFolder = caseMatch.name;
              } else {
                // Try to find folder starting with job number
                const jobNumberLower = jobNumber.toLowerCase();
                const matchingFolders = entries.filter(
                  (entry) => entry.isDirectory() && entry.name.toLowerCase().startsWith(jobNumberLower)
                );
                if (matchingFolders.length === 1) {
                  actualProjectFolder = matchingFolders[0].name;
                } else if (matchingFolders.length > 0 && project.name) {
                  // If multiple matches, find one that includes project name
                  const projectNameLower = project.name.toLowerCase();
                  const nameMatch = matchingFolders.find(
                    (entry) => entry.name.toLowerCase().includes(projectNameLower)
                  );
                  if (nameMatch) {
                    actualProjectFolder = nameMatch.name;
                  }
                }
              }
            }
          } catch (error) {
            console.error("Error finding project folder:", error);
          }
        }
        
        // Use actual folder name if found, otherwise use constructed name
        const finalProjectFolder = actualProjectFolder || projectFolder;
        const approvalDrawingsPath = path.join(
          process.cwd(),
          "public",
          "assets",
          finalProjectFolder,
          "05 Approval Drawings"
        );
        
        // Search for files matching the drawing number (supports all file formats)
        if (fs.existsSync(approvalDrawingsPath)) {
          try {
            const files = fs.readdirSync(approvalDrawingsPath, { withFileTypes: true });
            const dwgNoUpper = dwgNo.toUpperCase();
            const jobNumberUpper = jobNumber.toUpperCase();
            
            // Find files matching the drawing number (supports all file formats)
            const matchingFiles = files.filter((file) => {
              if (file.isDirectory()) return false;
              const fileName = file.name.toUpperCase();
              
              // Match patterns: {jobNumber}_{dwgNo}_*, {dwgNo}_*, *_{dwgNo}_*, or {dwgNo}.{ext}
              // Also handle variations like R-11, R_11, R11
              const dwgNoVariations = [
                dwgNoUpper,
                dwgNoUpper.replace(/-/g, '_'),
                dwgNoUpper.replace(/_/g, '-'),
                dwgNoUpper.replace(/[-_]/g, ''),
              ];
              
              for (const dwgNoVar of dwgNoVariations) {
                if (fileName.includes(`${jobNumberUpper}_${dwgNoVar}_`) ||
                    fileName.startsWith(`${jobNumberUpper}_${dwgNoVar}_`) ||
                    fileName.startsWith(`${dwgNoVar}_`) ||
                    fileName.includes(`_${dwgNoVar}_`) ||
                    fileName.startsWith(`${dwgNoVar}.`)) {
                  return true;
                }
              }
              
              return false;
            });
            
            // Sort: PDFs first, then files with "APP", then by revision (highest first)
            if (matchingFiles.length > 0) {
              matchingFiles.sort((a, b) => {
                const aName = a.name.toUpperCase();
                const bName = b.name.toUpperCase();
                
                const aIsPdf = aName.endsWith('.PDF');
                const bIsPdf = bName.endsWith('.PDF');
                if (aIsPdf !== bIsPdf) return aIsPdf ? -1 : 1;
                
                const aHasApp = aName.includes('APP');
                const bHasApp = bName.includes('APP');
                if (aHasApp !== bHasApp) return aHasApp ? -1 : 1;
                
                const aRevMatch = aName.match(/APP\s*(\d+)/);
                const bRevMatch = bName.match(/APP\s*(\d+)/);
                if (aRevMatch && bRevMatch) {
                  return parseInt(bRevMatch[1], 10) - parseInt(aRevMatch[1], 10);
                }
                
                return a.name.localeCompare(b.name);
              });
              
              actualFilePath = matchingFiles[0].name;
            }
          } catch (error) {
            console.error("Error searching approval drawings folder:", error);
          }
        }
        
        // Use found file path or resolve using path resolver
        let finalPdfPath: string | null = null;
        if (actualFilePath) {
          // Properly encode path segments - encode each part separately to handle spaces and special characters
          // Split path into segments and encode each segment separately for proper URL encoding
          const pathSegments = [
            finalProjectFolder,
            '05 Approval Drawings',
            actualFilePath
          ];
          const encodedPath = pathSegments.map(segment => encodeURIComponent(segment)).join('/');
          finalPdfPath = `/assets/${encodedPath}`;
        } else {
          // Resolve PDF path using intelligent path resolver
          const resolvedPdfPath = resolvePdfPath(
            projectId,
            section as ModuleType,
            {
              id: drawingId,
              dwgNo,
              jobNo: jobNumber,
              job_number: jobNumber,
              projectNumber: jobNumber,
              project_number: jobNumber,
              projectName: project.name,
              project_name: project.name,
              status: d.status,
              description: d.description,
            },
            (d as any).pdfPath
          );
          finalPdfPath = resolvedPdfPath;
        }
        
        return {
          id: drawingId,
          dwgNo,
          status: d.status || null,
          description: d.description || "",
          elements: (d as any).elements || "",
          totalWeightTons: d.totalWeightTons || 0,
          latestSubmittedDate: d.latestSubmittedDate || "",
          releaseStatus: d.releaseStatus || "",
          pdfPath: normalizePdfPath(finalPdfPath) || normalizePdfPath((d as any).pdfPath || `/assets/${jobNumber}/Drawing-Log/${dwgNo}.pdf`),
        };
      });

      // Return paginated response
      const paginated = createPaginatedResponse(mappedDrawings, page, pageSize);
      return NextResponse.json(paginated);
    }

    if (section === "invoice_history") {
      // Filter invoices by project number from demo data
      const filteredInvoices = demoInvoices.filter((inv) => inv.jobNumber === jobNumber);

      // Sort by invoice number (descending)
      filteredInvoices.sort((a, b) => b.invoiceNo.localeCompare(a.invoiceNo));

      const mappedInvoices = filteredInvoices.map((inv, index) => {
        const invoiceId = `inv-${jobNumber}-${inv.invoiceNo}-${index}`;
        
        // Resolve PDF path for invoices
        const resolvedPdfPath = resolvePdfPath(
          projectId,
          "invoice_history",
          {
            id: invoiceId,
            invoiceId: inv.invoiceNo,
            invoice_id: inv.invoiceNo,
            jobNo: jobNumber,
            projectNumber: inv.jobNumber,
          },
          undefined
        );
        
        return {
          id: invoiceId,
          invoiceNo: inv.invoiceNo,
          projectNo: inv.jobNumber,
          contractor: project.contractorName,
          projectName: project.name,
          billedTonnage: inv.billedTonnage || 0,
          unitPriceOrLumpSum: inv.unitPriceOrLumpSum || "$0",
          tonsBilledAmount: inv.tonsBilledAmount || 0,
          billedHoursCo: inv.billedHoursCo || 0,
          coPrice: inv.coPrice || 0,
          coBilledAmount: inv.coBilledAmount || 0,
          totalAmountBilled: inv.totalAmountBilled || 0,
          pdfPath: normalizePdfPath(resolvedPdfPath),
        };
      });

      // Return paginated response
      const paginated = createPaginatedResponse(mappedInvoices, page, pageSize);
      return NextResponse.json(paginated);
    }

    if (section === "upcoming_submissions") {
      // Filter submissions by project from demo data
      const filteredSubmissions = demoSubmissions.filter((s) => s.jobNumber === jobNumber);

      // Sort by submission date (descending)
      filteredSubmissions.sort((a, b) => {
        const dateA = new Date(a.submissionDate || 0).getTime();
        const dateB = new Date(b.submissionDate || 0).getTime();
        return dateB - dateA;
      });

      // Map submission types to new format
      const mapSubmissionType = (type: string | null | undefined): string => {
        if (!type) return "For Approval (APP)";
        
        const upperType = type.toUpperCase().trim();
        
        // Map legacy types to new format
        if (upperType === "APP" || upperType.includes("APPROVAL") || upperType.includes("FOR APPROVAL")) {
          return "For Approval (APP)";
        }
        if (upperType.includes("MATERIAL") || upperType.includes("MATERIAL LIST") || upperType === "MATERIAL LIST") {
          return "Material List";
        }
        
        // Map other common types
        if (upperType === "RR" || upperType === "R&R" || upperType.includes("REVIEW")) {
          return "For Approval (APP)"; // Map R&R to For Approval
        }
        if (upperType === "FFU" || upperType.includes("FIELD USE")) {
          return "For Approval (APP)"; // Map FFU to For Approval
        }
        if (upperType === "RFI" || upperType.includes("RFI")) {
          return "For Approval (APP)"; // Map RFI to For Approval
        }
        if (upperType === "ENQUIRY" || upperType.includes("ENQUIRY")) {
          return "For Approval (APP)"; // Map Enquiry to For Approval
        }
        if (upperType === "SUBMITTAL" || upperType.includes("SUBMITTAL")) {
          return "Material List"; // Map Submittal to Material List
        }
        
        // If already in new format, return as is
        if (type === "For Approval (APP)" || type === "Material List") {
          return type;
        }
        
        // Default: map unknown types to "For Approval (APP)"
        return "For Approval (APP)";
      };

      const mappedSubmissions = filteredSubmissions.map((s, index) => {
        const submissionId = `sub-${jobNumber}-${s.drawingNo}-${index}`;
        
        // Resolve PDF path for submissions
        const resolvedPdfPath = resolvePdfPath(
          projectId,
          "upcoming_submissions",
          {
            id: submissionId,
            drawingNo: s.drawingNo,
            drawing_number: s.drawingNo,
            jobNo: jobNumber,
            submissionType: s.submissionType,
          },
          undefined
        );
        
        return {
          id: submissionId,
          proultimaPm: s.proultimaPm || "PROULTIMA PM",
          jobNo: jobNumber,
          projectName: project.name,
          submissionType: mapSubmissionType(s.submissionType),
          workDescription: s.workDescription || "",
          drawingNo: s.drawingNo || "",
          submissionDate: s.submissionDate,
          pdfPath: normalizePdfPath(resolvedPdfPath),
        };
      });

      // Return paginated response with no-cache headers
      const paginated = createPaginatedResponse(mappedSubmissions, page, pageSize);
      return NextResponse.json(paginated, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    }

    // change_orders - Fetch from demo data
    if (section === "change_orders") {
      // Filter change orders by project from demo data
      const filteredChangeOrders = demoChangeOrders.filter((co) => co.jobNumber === jobNumber);

      // Sort by CO number in ascending order (001, 002, 003, etc.)
      filteredChangeOrders.sort((a, b) => {
        // Extract CO number from changeOrderId (e.g., "U2961_CO#001" -> "001")
        const extractCoNumber = (coId: string): number => {
          const match = coId.match(/#(\d+)$/);
          return match ? parseInt(match[1], 10) : 0;
        };
        const coNumA = extractCoNumber(a.changeOrderId || "");
        const coNumB = extractCoNumber(b.changeOrderId || "");
        return coNumA - coNumB;
      });

      const mappedChangeOrders = filteredChangeOrders.map((co, index) => {
        const changeOrderId = `co-${jobNumber}-${co.changeOrderId}-${index}`;
        
        // Format change order ID as "U2961 - CO #001"
        // Extract CO number from changeOrderId (e.g., "U2961_CO#001" -> "001")
        let coNumber = String(co.changeOrderId || "").trim();
        const match = coNumber.match(/#(\d+)$/);
        if (match) {
          coNumber = match[1].padStart(3, '0');
        } else {
          // Fallback: try to extract number from end of string
          coNumber = coNumber.replace(/^.*[#_](\d+)$/, "$1").padStart(3, '0');
          if (coNumber === "000") {
            coNumber = String(index + 1).padStart(3, '0');
          }
        }
        const formattedChangeOrderId = `${jobNumber} - CO #${coNumber}`;
        
        // Calculate sequential number
        const sequentialNumber = String(100 + index + 1).padStart(3, '0');
        
        // Resolve PDF path for change orders
        // Use pdfPath from data if it exists, otherwise resolve dynamically
        const existingPdfPath = (co as any).pdfPath;
        const resolvedPdfPath = resolvePdfPath(
          projectId,
          "change_orders",
          {
            id: changeOrderId,
            changeOrderId: formattedChangeOrderId,
            change_order_id: co.changeOrderId,
            sequentialNumber: sequentialNumber,
            sequential_number: sequentialNumber,
            jobNo: jobNumber,
            job_number: jobNumber,
            projectNumber: jobNumber,
            project_number: jobNumber,
            projectName: project.name,
            project_name: project.name,
            drawingNo: co.description,
          },
          existingPdfPath
        );
        
        return {
          id: changeOrderId,
          changeOrderId: formattedChangeOrderId,
          description: co.description,
          hours: co.hours,
          date: co.date,
          status: co.status,
          pdfPath: normalizePdfPath(resolvedPdfPath),
          revisedFor: (co as any).revisedFor || co.description || "",
          receivedDate: (co as any).receivedDate || co.date || "",
          weight: (co as any).weight || null,
        };
      });

      // Return paginated response
      const paginated = createPaginatedResponse(mappedChangeOrders, page, pageSize);
      return NextResponse.json(paginated);
    }

    // rfi_submissions - Fetch RFI submissions from demo data
    if (section === "rfi_submissions") {
      // RFI file URLs for JMEUC PUMP STATION (U2961) - from external file storage JSON file
      // Build RFI file map from JSON data
      const rfiFileMap: Array<{
        rfiNumber: string;
        keywords: string[];
        url: string;
        fileName: string;
      }> = (rfiJmrucData as Array<{ name: string; url: string; key: string }>).map((file) => {
        // Extract RFI number from filename (e.g., "PRO RFI 002_GROUT POCKET.pdf" -> "002")
        const rfiMatch = file.name.match(/PRO\s*RFI[_\s]*(\d+)/i);
        const rfiNumber = rfiMatch ? rfiMatch[1] : "";
        
        // Extract keywords from filename (remove "PRO RFI XXX_" prefix and ".pdf" suffix)
        const nameWithoutPrefix = file.name
          .replace(/^PRO\s*RFI[_\s]*\d+[_\s]*/i, "")
          .replace(/\.(pdf|PDF)$/i, "")
          .trim();
        
        // Split by underscores and common separators to create keywords
        const keywords: string[] = [];
        const parts = nameWithoutPrefix.split(/[_\-\s]+/).filter(p => p.length > 0);
        
        // Add individual words as keywords
        parts.forEach(part => {
          if (part.length > 2) {
            keywords.push(part.toUpperCase());
          }
        });
        
        // Add full phrases (common patterns)
        if (nameWithoutPrefix.includes("GROUT POCKET")) {
          keywords.push("GROUT POCKET");
        }
        if (nameWithoutPrefix.includes("BLOCK OUT FOR GATE")) {
          keywords.push("BLOCK OUT FOR GATE");
        }
        if (nameWithoutPrefix.includes("WET WELL")) {
          keywords.push("WET WELL", "WET WELL WALL", "WALL OPENING");
        }
        if (nameWithoutPrefix.includes("PHASE 2 PLATFORM") || nameWithoutPrefix.includes("PLATFORM LEVEL")) {
          keywords.push("PHASE 2 PLATFORM", "PHASE 2 PLATFORM LEVEL", "CJ LOCATION", "PLATFORM SLAB", "PLATFORM LEVEL");
        }
        if (nameWithoutPrefix.includes("PHASE 1 CONCRETE FILL") || nameWithoutPrefix.includes("PFASE 1 CONCRETE FILL")) {
          keywords.push("PHASE 1 CONCRETE FILL", "PFASE 1 CONCRETE FILL", "REINFORCEMENT DETAILS", "CONCRETE FILL REINFORCEMENT");
        }
        if (nameWithoutPrefix.includes("STAIRWAY WALL") || nameWithoutPrefix.includes("BEAM")) {
          keywords.push("PHASE 2 STAIRWAY", "STAIRWAY WALL", "BEAM", "STAIRWAY WALL & BEAM");
        }
        if (nameWithoutPrefix.includes("FOUNDATION") || nameWithoutPrefix.includes("MAT FOOTING")) {
          keywords.push("FOUNDATION", "FOUNDATION WALL", "MAT FOOTING", "DOWELS", "MAT FOOTING & DOWELS");
        }
        if (nameWithoutPrefix.includes("COLUMN FOUNDATION")) {
          keywords.push("COLUMN FOUNDATION", "TO ROOF", "COLUMN FOUNDATION TO ROOF");
        }
        if (nameWithoutPrefix.includes("VALVE ROOM")) {
          keywords.push("VALVE ROOM", "VALVE ROOM SLAB", "Phase ll", "Phase II");
        }
        
        return {
          rfiNumber,
          keywords: [...new Set(keywords)], // Remove duplicates
          url: file.url,
          fileName: file.name,
        };
      });

      // Filter RFI submissions from demo data (submissions with type "RFI")
      const filteredRfis = demoSubmissions.filter(
        (s) => s.jobNumber === jobNumber && s.submissionType === "RFI"
      );

      // Sort by submission date (descending)
      filteredRfis.sort((a, b) => {
        const dateA = new Date(a.submissionDate || 0).getTime();
        const dateB = new Date(b.submissionDate || 0).getTime();
        return dateB - dateA;
      });

      // Map submissions to the expected format
      const rfiRows = filteredRfis.map((s, index) => {
        const rfiId = `rfi-${jobNumber}-${s.drawingNo}-${index}`;
        
        // Generate RFI No
        const proRfiNo = `${jobNumber}_RFI#${String(index + 1).padStart(3, '0')}`;

        // Check if we have a URL for this RFI (only for U2961 - JMEUC PUMP STATION)
        let rfiUrl: string | undefined = undefined;
        
        if (jobNumber === "U2961") {
          const workDesc = (s.workDescription || "").toUpperCase().trim();
          
          // Try to find matching URL by keywords (case-insensitive matching)
          // Use a scoring system to find the best match
          let bestMatch: { score: number; url: string } | null = null;
          
          for (const fileInfo of rfiFileMap) {
            let matchScore = 0;
            
            // Check if any keyword matches the work description
            for (const keyword of fileInfo.keywords) {
              const upperKeyword = keyword.toUpperCase();
              
              // Exact match gets highest score
              if (workDesc === upperKeyword) {
                matchScore = 100;
                break;
              }
              
              // Contains match gets medium score
              if (workDesc.includes(upperKeyword) || upperKeyword.includes(workDesc)) {
                matchScore = Math.max(matchScore, 50);
              }
              
              // Partial word match gets lower score
              const workWords = workDesc.split(/\s+/);
              const keywordWords = upperKeyword.split(/\s+/);
              const commonWords = workWords.filter(w => keywordWords.includes(w));
              if (commonWords.length > 0) {
                matchScore = Math.max(matchScore, commonWords.length * 10);
              }
            }
            
            // Update best match if this is better
            if (matchScore > 0 && (!bestMatch || matchScore > bestMatch.score)) {
              bestMatch = { score: matchScore, url: fileInfo.url };
            }
          }
          
          // Use the best match if found
          if (bestMatch && bestMatch.score >= 10) {
            rfiUrl = bestMatch.url;
          }
        }

        // For U2524, search for RFI files in local file system
        let actualRfiFilePath: string | null = null;
        let finalProjectFolderForRfi: string | null = null;
        if (jobNumber === "U2524") {
          // Build project folder name (U2524 format: no space after underscore)
          let projectFolder = jobNumber;
          if (project.name) {
            const sanitizedProjectName = project.name.trim();
            projectFolder = `${jobNumber}_${sanitizedProjectName}`;
          }
          
          // Try to find the actual folder name in the file system
          const assetsDir = path.join(process.cwd(), "public", "assets");
          let actualProjectFolder: string | null = null;
          
          if (fs.existsSync(assetsDir)) {
            try {
              const entries = fs.readdirSync(assetsDir, { withFileTypes: true });
              const projectFolderLower = projectFolder.toLowerCase();
              
              // Try exact match first
              const exactMatch = entries.find(
                (entry) => entry.isDirectory() && entry.name.toLowerCase() === projectFolderLower
              );
              if (exactMatch) {
                actualProjectFolder = exactMatch.name;
              } else {
                // Try to find folder starting with job number
                const jobNumberLower = jobNumber.toLowerCase();
                const matchingFolders = entries.filter(
                  (entry) => entry.isDirectory() && entry.name.toLowerCase().startsWith(jobNumberLower)
                );
                if (matchingFolders.length === 1) {
                  actualProjectFolder = matchingFolders[0].name;
                } else if (matchingFolders.length > 0 && project.name) {
                  // If multiple matches, find one that includes project name
                  const projectNameLower = project.name.toLowerCase();
                  const nameMatch = matchingFolders.find(
                    (entry) => entry.name.toLowerCase().includes(projectNameLower)
                  );
                  if (nameMatch) {
                    actualProjectFolder = nameMatch.name;
                  }
                }
              }
            } catch (error) {
              console.error("Error finding project folder for RFI:", error);
            }
          }
          
          // Use actual folder name if found, otherwise use constructed name
          finalProjectFolderForRfi = actualProjectFolder || projectFolder;
          const rfiFolderPath = path.join(
            process.cwd(),
            "public",
            "assets",
            finalProjectFolderForRfi,
            "04 Documents",
            "RFI's",
            "PRO_RFI's"
          );
          
          // Extract RFI number from work description (e.g., "Pro_RFI_002" -> "002")
          const workDesc = (s.workDescription || "").trim();
          const rfiNumberMatch = workDesc.match(/PRO[_\s]*RFI[_\s]*(\d+)/i);
          const rfiNumber = rfiNumberMatch ? rfiNumberMatch[1] : String(index + 1).padStart(3, '0');
          
          // Search for RFI files (supports all formats)
          if (fs.existsSync(rfiFolderPath)) {
            try {
              // First, check for files directly in PRO_RFI's folder
              const files = fs.readdirSync(rfiFolderPath, { withFileTypes: true });
              const rfiNumberUpper = rfiNumber.toUpperCase();
              
              // Find files matching the RFI number (e.g., PRO_RFI_002.pdf, PRO_RFI_002.PDF, etc.)
              // Supports all file formats: PDF, DWG, DXF, CAD, images, etc.
              const matchingFiles = files.filter((file) => {
                if (file.isDirectory()) return false;
                const fileName = file.name.toUpperCase();
                
                // Match patterns: PRO_RFI_002*, PRO RFI 002*, PRO_RFI_002.*, etc.
                return fileName.includes(`PRO_RFI_${rfiNumberUpper}`) ||
                       fileName.includes(`PRO RFI ${rfiNumberUpper}`) ||
                       fileName.startsWith(`PRO_RFI_${rfiNumberUpper}`) ||
                       fileName.startsWith(`PRO RFI ${rfiNumberUpper}`) ||
                       fileName.match(new RegExp(`PRO[_\s]*RFI[_\s]*${rfiNumberUpper}`, 'i'));
              });
              
              // Also check in subdirectories (e.g., "05202019 PRO_RFI_003/PRO_RFI_003.pdf")
              const subdirs = files.filter((file) => file.isDirectory());
              for (const subdir of subdirs) {
                const subdirPath = path.join(rfiFolderPath, subdir.name);
                try {
                  const subdirFiles = fs.readdirSync(subdirPath, { withFileTypes: true });
                  const subdirMatchingFiles = subdirFiles.filter((file) => {
                    if (file.isDirectory()) return false;
                    const fileName = file.name.toUpperCase();
                    return fileName.includes(`PRO_RFI_${rfiNumberUpper}`) ||
                           fileName.includes(`PRO RFI ${rfiNumberUpper}`) ||
                           fileName.startsWith(`PRO_RFI_${rfiNumberUpper}`) ||
                           fileName.startsWith(`PRO RFI ${rfiNumberUpper}`) ||
                           fileName.match(new RegExp(`PRO[_\s]*RFI[_\s]*${rfiNumberUpper}`, 'i'));
                  });
                  
                  // Add subdirectory files to matching files list
                  subdirMatchingFiles.forEach((file) => {
                    matchingFiles.push({
                      ...file,
                      name: `${subdir.name}/${file.name}`,
                    } as any);
                  });
                } catch (error) {
                  console.error(`Error reading subdirectory ${subdir.name}:`, error);
                }
              }
              
              // Sort: PDFs first, then alphabetical (supports all formats)
              if (matchingFiles.length > 0) {
                matchingFiles.sort((a, b) => {
                  const aName = a.name.toUpperCase();
                  const bName = b.name.toUpperCase();
                  
                  const aIsPdf = aName.endsWith('.PDF');
                  const bIsPdf = bName.endsWith('.PDF');
                  if (aIsPdf !== bIsPdf) return aIsPdf ? -1 : 1;
                  
                  return a.name.localeCompare(b.name);
                });
                
                actualRfiFilePath = matchingFiles[0].name;
              }
            } catch (error) {
              console.error("Error searching RFI folder:", error);
            }
          }
        }

        // Resolve PDF path for RFI submissions (use URL if available, otherwise use local file, otherwise resolve path)
        let resolvedPdfPath: string | null = null;
        if (rfiUrl) {
          // Use the external URL directly (for U2961)
          resolvedPdfPath = rfiUrl;
        } else if (actualRfiFilePath && jobNumber === "U2524" && finalProjectFolderForRfi) {
          // Use the local file path found (for U2524)
          // Use the project folder already found above
          resolvedPdfPath = `/assets/${encodeURIComponent(finalProjectFolderForRfi)}/04 Documents/RFI's/PRO_RFI's/${encodeURIComponent(actualRfiFilePath)}`;
        } else {
          // Fallback to local path resolution
          resolvedPdfPath = resolvePdfPath(
            projectId,
            "rfi_submissions",
            {
              id: rfiId,
              rfiNo: proRfiNo,
              rfi_no: proRfiNo,
              proRfiNo: proRfiNo,
              jobNo: jobNumber,
              job_number: jobNumber,
              projectNumber: jobNumber,
              project_number: jobNumber,
              projectName: project.name,
              project_name: project.name,
              drawingNo: s.drawingNo,
            },
            undefined
          );
        }
        
        return {
          id: rfiId,
          rfiNo: proRfiNo,
          projectName: project.name,
          jobNo: jobNumber,
          client: "",
          impactedElement: "",
          drawingReference: s.drawingNo || "",
          date: s.submissionDate,
          status: "OPEN",
          // Additional fields for editing
          projectId: projectId,
          proRfiNo: proRfiNo,
          placingDrawingReference: s.drawingNo || "",
          contractDrawingReference: "",
          question: s.workDescription || "",
          pdfPath: normalizePdfPath(resolvedPdfPath),
        };
      });

      // Return paginated response
      const paginated = createPaginatedResponse(rfiRows, page, pageSize);
      return NextResponse.json(paginated);
    }

    // Fallback for unknown sections
    const paginated = createPaginatedResponse([], page, pageSize);
    return NextResponse.json(paginated);
  } catch (error) {
    console.error("Error fetching project sections:", error);
    // Return empty data instead of error to prevent UI failures
    // Try fallback to local data if we have the required parameters
    if (projectId && section && isSectionKey(section)) {
      try {
        const { getLocalSectionData } = await import("@/lib/utils/local-data-fallback");
        const localData = getLocalSectionData(projectId, section, page, pageSize);
        if (localData) {
          return NextResponse.json(localData);
        }
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
      }
    }
    // Final fallback: return empty data
    const emptyPaginated = createPaginatedResponse([], page, pageSize);
    return NextResponse.json(emptyPaginated);
  }
}
