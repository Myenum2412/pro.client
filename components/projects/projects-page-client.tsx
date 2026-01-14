"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type Project = {
  id: string;
  jobNumber: string;
  name: string;
};

export function ProjectsPageClient({
  projects,
  selectedProjectId,
}: {
  projects: Project[];
  selectedProjectId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleProjectClick = useCallback(
    (projectId: string) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      current.set('project', projectId);
      const search = current.toString();
      const query = search ? `?${search}` : '';
      router.push(`/client/projects${query}`, { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <div className="relative">

      {/* Project Cards Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-2">
        {projects.length > 0 ? (
          projects.map((p) => (
            <button
              key={p.id}
              onClick={() => handleProjectClick(p.id)}
              className={`w-full rounded-xl border p-4 shadow-md hover:shadow-lg transition-all text-left ${
                selectedProjectId === p.id
                  ? "ring-2 ring-primary border-black/50 hover:scale-95 hover:shadow-lg transition-all shadow-accent-foreground bg-white"
                  : "bg-background/80 border-primary/50  hover:bg-background/90"
              }`}
            >
              <div
                className={`text-base font-semibold ${
                  selectedProjectId === p.id ? "text-foreground" : ""
                }`}
              >
                {p.jobNumber}
              </div>
              <div
                className={`mt-2 text-sm ${
                  selectedProjectId === p.id ? "text-muted-foreground" : ""
                }`}
              >
                {p.name}
              </div>
            </button>
          ))
        ) : (
          <div className="rounded-xl border bg-background p-6 text-sm text-muted-foreground col-span-full">
            No projects found.
          </div>
        )}
      </div>
    </div>
  );
}
