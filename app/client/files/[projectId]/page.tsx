import type { Metadata } from "next";
import { TopHeader } from "@/components/app/top-header";
import { ProjectFilesClient } from "@/components/files/project-files-client";
import { demoProjects } from "@/public/assets";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>;
}): Promise<Metadata> {
  const { projectId } = await params;
  const decodedProjectId = decodeURIComponent(projectId);
  const project = demoProjects.find((p) => p.jobNumber === decodedProjectId);
  const projectName = project?.name || decodedProjectId;

  return {
    title: `Project Files - ${projectName}`,
    description: `View and access project files for ${projectName}`,
  };
}

export default async function ProjectFilesPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const decodedProjectId = decodeURIComponent(projectId);
  const project = demoProjects.find((p) => p.jobNumber === decodedProjectId);
  const projectName = project?.name || decodedProjectId;

  return (
    <>
      <TopHeader
        section="Files"
        page={projectName}
        search={{ placeholder: "Search files...", action: `/client/files/${projectId}`, name: "q" }}
      />
      <div className="min-h-0 flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0">
        <ProjectFilesClient projectId={projectId} />
      </div>
    </>
  );
}
