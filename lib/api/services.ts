/**
 * Centralized API Services
 * All API endpoints are defined here with proper types and error handling
 */

import { fetchJson } from "@/lib/api/fetch-json";
import type { ApiError } from "@/lib/api/fetch-json";
import type { PaginatedResponse } from "@/lib/api/pagination";

// ============================================================================
// Types
// ============================================================================

export interface Project {
  id: string;
  projectNumber: string;
  projectName: string;
  fabricatorName?: string | null;
  contractorName: string | null;
  projectLocation?: string | null;
  estimatedTons: number | null;
  detailedTonsPerApproval?: number | null;
  detailedTonsPerLatestRev?: number | null;
  releasedTons: number | null;
  detailingStatus: string | null;
  revisionStatus: string | null;
  releaseStatus: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDetails extends Project {
  metrics: {
    totalDrawings: number;
    approvedDrawings: number;
    releasedDrawings: number;
    pendingDrawings: number;
    yetToReleaseCount: number;
    totalInvoices: number;
    totalBilled: number;
    paidAmount: number;
    outstandingAmount: number;
  };
  counts: {
    drawingsYetToReturn: number;
    drawingsYetToRelease: number;
    drawingLogEntries: number;
    invoices: number;
    submissions: number;
    changeOrders: number;
    materialLists: number;
  };
  summary: {
    completionPercentage: number;
    approvalRate: number;
    billingStatus: number;
    activeSubmissions: number;
    pendingChangeOrders: number;
  };
}

export interface RFI {
  id: string;
  rfiNo: string;
  rfiNumber?: string; // Alias for rfiNo
  title?: string;
  description?: string;
  status: string;
  priority?: string;
  date: string;
  projectId?: string;
  projectName: string;
  jobNo: string;
  client: string;
  impactedElement: string;
  drawingReference: string;
  proRfiNo?: string;
  placingDrawingReference?: string;
  contractDrawingReference?: string;
  question?: string;
  answer?: string;
  pdfPath?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  children?: FileNode[];
  extension?: string;
  size?: number;
}

export interface MaterialListBlock {
  id: string;
  title: string;
  description?: string;
  items?: unknown[];
}

// ============================================================================
// Project Services
// ============================================================================

export const projectService = {
  getAll: async (): Promise<Project[]> => {
    return fetchJson<Project[]>("/api/projects");
  },

  getById: async (projectId: string): Promise<ProjectDetails> => {
    return fetchJson<ProjectDetails>(`/api/projects/${encodeURIComponent(projectId)}/details`);
  },

  getSection: async <T>(
    projectId: string,
    section: string,
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResponse<T>> => {
    const params = new URLSearchParams({
      section,
      page: String(page),
      pageSize: String(pageSize),
    });
    
    try {
      return await fetchJson<PaginatedResponse<T>>(
        `/api/projects/${encodeURIComponent(projectId)}/sections?${params.toString()}`
      );
    } catch (error) {
      // Fallback to local data if API fails
      console.warn("API call failed, using local data fallback:", error);
      const { getLocalSectionData } = await import("@/lib/utils/local-data-fallback");
      const localData = getLocalSectionData<T>(projectId, section as any, page, pageSize);
      
      if (localData) {
        return localData as PaginatedResponse<T>;
      }
      
      // If local data also fails, throw the original error
      throw error;
    }
  },

  getMaterialLists: async (projectId: string): Promise<{
    title: string;
    blocks: MaterialListBlock[];
  }> => {
    return fetchJson<{ title: string; blocks: MaterialListBlock[] }>(
      `/api/projects/${encodeURIComponent(projectId)}/material-lists`
    );
  },
} as const;

// ============================================================================
// RFI Services
// ============================================================================

export const rfiService = {
  getAll: async (page = 1, pageSize = 20): Promise<PaginatedResponse<RFI>> => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });
    return fetchJson<PaginatedResponse<RFI>>(`/api/rfi?${params.toString()}`);
  },

  getById: async (rfiId: string): Promise<RFI> => {
    return fetchJson<RFI>(`/api/rfi/${encodeURIComponent(rfiId)}`);
  },

  create: async (data: Partial<RFI>): Promise<RFI> => {
    return fetchJson<RFI>("/api/rfi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  update: async (rfiId: string, data: Partial<RFI>): Promise<RFI> => {
    return fetchJson<RFI>(`/api/rfi/${encodeURIComponent(rfiId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },
} as const;

// ============================================================================
// File Services
// ============================================================================

export const fileService = {
  getDirectory: async (path = ""): Promise<FileNode[]> => {
    const url = path
      ? `/api/files/directory?path=${encodeURIComponent(path)}`
      : "/api/files/directory";
    const response = await fetchJson<{ data: FileNode[] }>(url);
    return response.data || [];
  },

  getProjectFiles: async (projectId: string): Promise<FileNode[]> => {
    const response = await fetchJson<{ data: FileNode[] }>(
      `/api/files/project/${encodeURIComponent(projectId)}`
    );
    return response.data || [];
  },

  getSidebarProjects: async (): Promise<FileNode[]> => {
    const response = await fetchJson<{ data: FileNode[] }>("/api/sidebar/projects");
    return response.data || [];
  },
} as const;

// ============================================================================
// Dashboard Services
// ============================================================================

export interface DashboardMetrics {
  totalProjects: number;
  activeProjects: number;
  totalInvoices: number;
  pendingInvoices: number;
  totalBilled: number;
  paidAmount: number;
  outstandingAmount: number;
}

export const dashboardService = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    // This would be implemented if there's a dedicated endpoint
    // For now, returning a placeholder structure
    return fetchJson<DashboardMetrics>("/api/dashboard/metrics").catch(() => ({
      totalProjects: 0,
      activeProjects: 0,
      totalInvoices: 0,
      pendingInvoices: 0,
      totalBilled: 0,
      paidAmount: 0,
      outstandingAmount: 0,
    }));
  },
} as const;

// ============================================================================
// Billing Services (reuse from existing hooks)
// ============================================================================

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  subtotal: number;
}

export interface InvoicePayment {
  id: string;
  paymentDate: string;
  amount: number;
  method: string;
  status: "completed" | "pending" | "failed";
  transactionId?: string;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  projectNo: string;
  contractor: string;
  projectName: string;
  issueDate: string;
  dueDate: string;
  status: "paid" | "unpaid" | "partially_paid" | "overdue";
  billedTonnage: number;
  unitPriceOrLumpSum: string;
  tonsBilledAmount: number;
  billedHoursCo: number;
  coPrice: number;
  coBilledAmount: number;
  totalAmountBilled: number;
  tax: number;
  discount: number;
  grandTotal: number;
  paidAmount: number;
  remainingBalance: number;
  lineItems?: InvoiceLineItem[];
  payments?: InvoicePayment[];
}

export const billingService = {
  getInvoices: async (page = 1, pageSize = 20): Promise<PaginatedResponse<Invoice>> => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });
    return fetchJson<PaginatedResponse<Invoice>>(`/api/billing/invoices?${params.toString()}`);
  },

  getInvoice: async (invoiceId: string): Promise<Invoice> => {
    return fetchJson<Invoice>(`/api/billing/invoices/${encodeURIComponent(invoiceId)}`);
  },
} as const;

// ============================================================================
// Export Error Type
// ============================================================================

export type { ApiError };

