/**
 * Local Data Fallback Utility
 * Provides fallback data from @public/assets.ts when API fails
 */

import { 
  demoDrawings, 
  demoInvoices, 
  demoSubmissions, 
  demoChangeOrders, 
  demoProjects 
} from "@/public/assets";
import { createPaginatedResponse } from "@/lib/api/pagination";
import { resolvePdfPath, normalizePdfPath, type ModuleType } from "@/lib/utils/pdf-path-resolver";

type SectionKey =
  | "drawings_yet_to_return"
  | "drawings_yet_to_release"
  | "drawing_log"
  | "invoice_history"
  | "upcoming_submissions"
  | "change_orders"
  | "rfi_submissions";

// Map project ID to job number (using demo projects)
function getJobNumberFromProjectId(projectId: string): string | null {
  // Try to find project by ID or job number
  const project = demoProjects.find(
    (p) => p.jobNumber === projectId || projectId.includes(p.jobNumber)
  );
  return project?.jobNumber || projectId; // Fallback to projectId if not found
}

// Generate a stable ID from drawing data
function generateDrawingId(jobNumber: string, dwgNo: string, section: string): string {
  return `${jobNumber}-${section}-${dwgNo}`.replace(/[^a-zA-Z0-9-]/g, '-');
}

export function getLocalSectionData<T>(
  projectId: string,
  section: SectionKey,
  page = 1,
  pageSize = 20
): { data: T[]; pagination: any } | null {
  try {
    const jobNumber = getJobNumberFromProjectId(projectId);
    if (!jobNumber) {
      return null;
    }

    const project = demoProjects.find((p) => p.jobNumber === jobNumber);
    if (!project) {
      return null;
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
      const filteredDrawings = demoDrawings.filter(
        (d) => d.jobNumber === jobNumber && d.section === targetSection
      );

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
        const dwgNo = d.dwgNo;
        const drawingId = generateDrawingId(jobNumber, dwgNo, section);
        
        // Resolve PDF path using intelligent path resolver
        const resolvedPdfPath = resolvePdfPath(
          projectId,
          section as ModuleType,
          {
            id: drawingId,
            dwgNo,
            jobNo: jobNumber,
            status: d.status,
            description: d.description,
          },
          (d as any).pdfPath
        );
        
        return {
          id: drawingId,
          dwgNo,
          status: d.status || null,
          description: d.description || "",
          elements: (d as any).elements || "",
          totalWeightTons: d.totalWeightTons || 0,
          latestSubmittedDate: d.latestSubmittedDate || "",
          releaseStatus: d.releaseStatus || "",
          pdfPath: normalizePdfPath(resolvedPdfPath) || normalizePdfPath((d as any).pdfPath || `/assets/${jobNumber}/Drawing-Log/${dwgNo}.pdf`),
        };
      });

      const paginated = createPaginatedResponse(mappedDrawings, page, pageSize);
      return paginated as { data: T[]; pagination: any };
    }

    if (section === "invoice_history") {
      const filteredInvoices = demoInvoices.filter((inv) => inv.jobNumber === jobNumber);
      filteredInvoices.sort((a, b) => b.invoiceNo.localeCompare(a.invoiceNo));

      const mappedInvoices = filteredInvoices.map((inv, index) => {
        const invoiceId = `inv-${jobNumber}-${inv.invoiceNo}-${index}`;
        
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

      const paginated = createPaginatedResponse(mappedInvoices, page, pageSize);
      return paginated as { data: T[]; pagination: any };
    }

    if (section === "upcoming_submissions") {
      const filteredSubmissions = demoSubmissions.filter((s) => s.jobNumber === jobNumber);
      filteredSubmissions.sort((a, b) => {
        const dateA = new Date(a.submissionDate || 0).getTime();
        const dateB = new Date(b.submissionDate || 0).getTime();
        return dateB - dateA;
      });

      const mapSubmissionType = (type: string | null | undefined): string => {
        if (!type) return "For Approval (APP)";
        const upperType = type.toUpperCase().trim();
        if (upperType === "APP" || upperType.includes("APPROVAL")) return "For Approval (APP)";
        if (upperType.includes("MATERIAL")) return "Material List";
        if (upperType === "RFI" || upperType.includes("RFI")) return "For Approval (APP)";
        if (upperType === "ENQUIRY" || upperType.includes("ENQUIRY")) return "For Approval (APP)";
        if (upperType === "SUBMITTAL" || upperType.includes("SUBMITTAL")) return "Material List";
        return "For Approval (APP)";
      };

      const mappedSubmissions = filteredSubmissions.map((s, index) => {
        const submissionId = `sub-${jobNumber}-${s.drawingNo}-${index}`;
        
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

      const paginated = createPaginatedResponse(mappedSubmissions, page, pageSize);
      return paginated as { data: T[]; pagination: any };
    }

    if (section === "change_orders") {
      const filteredChangeOrders = demoChangeOrders.filter((co) => co.jobNumber === jobNumber);
      filteredChangeOrders.sort((a, b) => {
        const dateA = new Date(a.date || 0).getTime();
        const dateB = new Date(b.date || 0).getTime();
        return dateB - dateA;
      });

      const mappedChangeOrders = filteredChangeOrders.map((co, index) => {
        const changeOrderId = `co-${jobNumber}-${co.changeOrderId}-${index}`;
        
        let coNumber = String(co.changeOrderId || "").trim();
        coNumber = coNumber.replace(/^CO\s*#?\s*/i, "").trim();
        if (!coNumber) {
          coNumber = String(index + 1).padStart(3, '0');
        }
        const formattedChangeOrderId = `${jobNumber} - CO #${coNumber}`;
        const sequentialNumber = String(100 + index + 1).padStart(3, '0');
        
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
          undefined
        );
        
        return {
          id: changeOrderId,
          changeOrderId: formattedChangeOrderId,
          description: co.description,
          hours: co.hours,
          date: co.date,
          status: co.status,
          pdfPath: normalizePdfPath(resolvedPdfPath),
        };
      });

      const paginated = createPaginatedResponse(mappedChangeOrders, page, pageSize);
      return paginated as { data: T[]; pagination: any };
    }

    if (section === "rfi_submissions") {
      const filteredRfis = demoSubmissions.filter(
        (s) => s.jobNumber === jobNumber && s.submissionType === "RFI"
      );

      filteredRfis.sort((a, b) => {
        const dateA = new Date(a.submissionDate || 0).getTime();
        const dateB = new Date(b.submissionDate || 0).getTime();
        return dateB - dateA;
      });

      const rfiRows = filteredRfis.map((s, index) => {
        const rfiId = `rfi-${jobNumber}-${s.drawingNo}-${index}`;
        const proRfiNo = `${jobNumber}_RFI#${String(index + 1).padStart(3, '0')}`;

        const resolvedPdfPath = resolvePdfPath(
          projectId,
          "rfi_submissions",
          {
            id: rfiId,
            rfiNo: proRfiNo,
            rfi_no: proRfiNo,
            proRfiNo: proRfiNo,
            jobNo: jobNumber,
            drawingNo: s.drawingNo,
          },
          undefined
        );
        
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
          projectId: projectId,
          proRfiNo: proRfiNo,
          placingDrawingReference: s.drawingNo || "",
          contractDrawingReference: "",
          question: s.workDescription || "",
          pdfPath: normalizePdfPath(resolvedPdfPath),
        };
      });

      const paginated = createPaginatedResponse(rfiRows, page, pageSize);
      return paginated as { data: T[]; pagination: any };
    }

    return null;
  } catch (error) {
    console.error("Error getting local section data:", error);
    return null;
  }
}
