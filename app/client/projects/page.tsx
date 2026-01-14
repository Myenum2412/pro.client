import type { Metadata } from "next";
import { TopHeader } from "@/components/app/top-header";
import { ProjectCardsAccordion } from "@/components/projects/project-cards-accordion";
import {
  ProjectOverview,
  type ProjectOverviewData,
} from "@/components/projects/project-overview";
import { LocalStorageDataDisplay } from "@/components/projects/local-storage-data-display";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProjectsPageClient } from "@/components/projects/projects-page-client";
import { ProjectSearchResults } from "@/components/projects/project-search-results";
import { demoProjects, demoDrawings } from "@/public/assets";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "View and manage all your construction projects, drawings, and project details",
};

// Use dynamic rendering with caching for better performance
export const dynamic = "force-dynamic";
export const revalidate = 3600; // Revalidate every hour

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string; q?: string }>;
}) {
  const params = await searchParams;
  const searchQuery = params.q;

  // Use local projects data from assets.ts
  // Map demo projects to the expected format (using jobNumber as ID for compatibility)
  const projects = demoProjects.map((p) => ({
    id: p.jobNumber, // Use jobNumber as ID for compatibility with sections API
    jobNumber: p.jobNumber,
    name: p.name,
  }));

  // Check if a project is explicitly selected (not just defaulted)
  const hasExplicitProject = !!params.project;
  
  // Get selected project ID from URL params, only default to first project if no explicit selection
  const selectedProjectId = params.project || projects[0]?.id || "";

  // Find the selected project in demo data
  const selectedProject = demoProjects.find(
    (p) => p.jobNumber === selectedProjectId || selectedProjectId === p.jobNumber
  );

  if (!selectedProject) {
    // Fallback to first project if not found
    const firstProject = demoProjects[0];
    if (!firstProject) {
      throw new Error("No projects found");
    }
  }

  const project = selectedProject || demoProjects[0];
  
  if (!project) {
    throw new Error("No projects found");
  }

  // Calculate metrics from drawings data (all sections combined)
  const allDrawings = demoDrawings.filter((d) => d.jobNumber === project.jobNumber);
  
  const totals = allDrawings.reduce(
    (acc: { total: number; released: number }, r) => {
      acc.total += r.totalWeightTons || 0;
      const rs = String(r.releaseStatus ?? "").toLowerCase();
      if (rs.includes("released")) acc.released += r.totalWeightTons || 0;
      return acc;
    },
    { total: 0, released: 0 }
  );

  // Type-safe access to extended project fields
  const projectWithExtendedFields = project as {
    detailedTonsApprovalDwgs?: number;
    detailedTonsLatestRevFFU?: number;
    releasedTonsSoFar?: number;
  };

  const overview: ProjectOverviewData = {
    projectName: project.name,
    jobNumber: project.jobNumber,
    fabricatorName: project.fabricatorName ?? null,
    contractorName: project.contractorName ?? null,
    projectLocation: project.location ?? null,
    estimatedTons: project.estimatedTons ?? null,
    // Use detailedTonsApprovalDwgs if available, otherwise calculate from drawings
    approvalTons: (projectWithExtendedFields.detailedTonsApprovalDwgs ?? totals.total),
    // Use detailedTonsLatestRevFFU if available, otherwise use approvalTons
    latestRevTons: (projectWithExtendedFields.detailedTonsLatestRevFFU ?? projectWithExtendedFields.detailedTonsApprovalDwgs ?? totals.total),
    // Use releasedTonsSoFar if available, otherwise calculate from drawings
    releasedTons: (projectWithExtendedFields.releasedTonsSoFar ?? totals.released),
    detailingStatus: project.detailingStatus ?? null,
    revisionStatus: project.revisionStatus ?? null,
    releaseStatus: project.releaseStatus ?? null,
  };

  return (
    <>
      <TopHeader
        section="Projects"
        page="All Projects"
        search={{
          placeholder: "Search projects...",
          action: "/client/projects",
          name: "q",
        }}
      />
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {/* Show search results if query exists */}
          {searchQuery && (
            <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
              <ProjectSearchResults />
            </div>
          )}

          {/* Show project cards only if no search query */}
          {!searchQuery && (
            <>
              {/* Show overview card only when no project is explicitly selected */}
              {!hasExplicitProject && (
                <Card className="w-full shadow-lg overflow-hidden relative animate-in fade-in slide-in-from-bottom-1 duration-300">
                  <div className="absolute inset-0 h-full w-full bg-section opacity-70 " />
                  <CardHeader className="relative overflow-hidden ">
                    <div className="relative">
                      <h1 className="text-xl font-semibold text-white">
                        Project Drawings Overview
                      </h1>
                      <p className="text-sm text-white/80">
                        Select a project to view drawings, submissions, billing,
                        logs, and change orders
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent className="-mt-4">
                    <ProjectsPageClient
                      projects={projects}
                      selectedProjectId={selectedProjectId}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Show selected project details when a project is explicitly selected */}
              {hasExplicitProject && (
                <>
                  <Card className="w-full shadow-lg overflow-hidden relative p-0">
                    <CardContent className="p-0 border-none">
                      <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                        <ProjectOverview data={overview} />
                      </div>
                    </CardContent>
                  </Card>

                  <ProjectCardsAccordion key={selectedProjectId} projectId={selectedProjectId} />
                  <LocalStorageDataDisplay />
                </>
              )}

              {/* Show project details below overview when no explicit selection (default view) */}
              {!hasExplicitProject && (
                <>
                  <Card className="w-full shadow-lg overflow-hidden relative p-0">
                    <CardContent className="p-0 border-none">
                      <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                        <ProjectOverview data={overview} />
                      </div>
                    </CardContent>
                  </Card>

                  <ProjectCardsAccordion key={selectedProjectId} projectId={selectedProjectId} />
                  <LocalStorageDataDisplay />
                </>
              )}
            </>
          )}
        </div>
    </>
  );
}
