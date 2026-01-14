import { NextResponse } from "next/server";
import { parsePaginationParams, createPaginatedResponse } from "@/lib/api/pagination";
import { demoInvoices, demoProjects } from "@/public/assets";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { page = 1, pageSize = 20 } = parsePaginationParams(searchParams);

    // Always use demo data from assets.ts
    const invoiceRows = demoInvoices.map((inv, index) => {
      // Find project name from demoProjects
      const project = demoProjects.find((p) => p.jobNumber === inv.jobNumber);
      const projectName = project?.name || `Project ${inv.jobNumber}`;
      const contractorName = project?.contractorName || "Demo Contractor";

      // Assign status based on index to have mix of paid and unpaid
      // First 30% are paid, rest are unpaid (Pending, Overdue, Draft)
      const statusOptions = ["Pending", "Overdue", "Draft", "Pending", "Overdue"];
      const status = index < Math.floor(demoInvoices.length * 0.3) 
        ? "Paid" 
        : statusOptions[index % statusOptions.length];

      return {
        id: `demo-invoice-${index + 1}`,
        invoiceNo: inv.invoiceNo,
        projectNo: inv.jobNumber,
        contractor: contractorName,
        projectName: projectName,
        billedTonnage: inv.billedTonnage,
        unitPriceOrLumpSum: inv.unitPriceOrLumpSum,
        tonsBilledAmount: inv.tonsBilledAmount,
        billedHoursCo: inv.billedHoursCo,
        coPrice: inv.coPrice,
        coBilledAmount: inv.coBilledAmount,
        totalAmountBilled: inv.totalAmountBilled,
        status: status,
      };
    });

    // Return paginated response
    const paginated = createPaginatedResponse(invoiceRows, page, pageSize);
    return NextResponse.json(paginated);
  } catch (error) {
    console.error("Error in invoices API:", error);
    
    // Fallback: Return demo data on error as well
    const { searchParams } = new URL(request.url);
    const { page = 1, pageSize = 20 } = parsePaginationParams(searchParams);
    
    const demoRows = demoInvoices.map((inv, index) => {
      const project = demoProjects.find((p) => p.jobNumber === inv.jobNumber);
      const projectName = project?.name || `Project ${inv.jobNumber}`;
      const contractorName = project?.contractorName || "Demo Contractor";

      // Assign status based on index to have mix of paid and unpaid
      const statusOptions = ["Pending", "Overdue", "Draft", "Pending", "Overdue"];
      const status = index < Math.floor(demoInvoices.length * 0.3) 
        ? "Paid" 
        : statusOptions[index % statusOptions.length];

      return {
        id: `demo-invoice-${index + 1}`,
        invoiceNo: inv.invoiceNo,
        projectNo: inv.jobNumber,
        contractor: contractorName,
        projectName: projectName,
        billedTonnage: inv.billedTonnage,
        unitPriceOrLumpSum: inv.unitPriceOrLumpSum,
        tonsBilledAmount: inv.tonsBilledAmount,
        billedHoursCo: inv.billedHoursCo,
        coPrice: inv.coPrice,
        coBilledAmount: inv.coBilledAmount,
        totalAmountBilled: inv.totalAmountBilled,
        status: status,
      };
    });
    
    const paginated = createPaginatedResponse(demoRows, page, pageSize);
    return NextResponse.json(paginated);
  }
}


