import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TopHeader } from "@/components/app/top-header";
import { ProjectCardsAccordion } from "@/components/projects/project-cards-accordion";
import { ProjectDetailsComprehensive } from "@/components/projects/project-details-comprehensive";
import { requireUser } from "@/lib/auth/server";
import { demoProjects } from "@/public/assets";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>;
}): Promise<Metadata> {
  try {
    const { projectId } = await params;
    const project = demoProjects.find((p) => p.jobNumber === projectId);
    
    if (project) {
      return {
        title: `${project.jobNumber} - ${project.name}`,
        description: `View project details, drawings, submissions, billing, and change orders for ${project.name}`,
      };
    }
  } catch {
    // Fall through to default metadata
  }
  
  return {
    title: "Project Details",
    description: "View project details and related information",
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  await requireUser();

  // Find project in local data
  const project = demoProjects.find((p) => p.jobNumber === projectId);

  if (!project) {
    notFound();
  }

  return (
    <>
      <TopHeader
        section="Projects"
        page={project.name}
        search={{ placeholder: "Search projects...", action: "/client/projects", name: "q" }}
      />
      <div className="min-h-0 flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {/* Comprehensive Project Details */}
        <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
          <ProjectDetailsComprehensive projectId={projectId} />
        </div>

        <ProjectCardsAccordion projectId={projectId} />
      </div>
    </>
  );
}
