"use client";

import * as React from "react";

import { ProjectSections } from "@/components/projects/project-sections";
import { ProjectMaterialListManagement } from "@/components/projects/material-list-management";

type ExpandBehavior = "accordion" | "expandAll"; // expandAll is for future use
const MATERIAL_LIST_KEY = "__material_list__";

export function ProjectCardsAccordion({
  projectId,
  defaultExpandedKey = null,
  expandBehavior = "accordion",
}: {
  projectId: string;
  /** Default expanded card key (null = all collapsed) */
  defaultExpandedKey?: string | null;
  /** Future option: support expanding all cards */
  expandBehavior?: ExpandBehavior;
}) {
  const [expandedKey, setExpandedKey] = React.useState<string | null>(
    expandBehavior === "expandAll" ? "__all__" : defaultExpandedKey
  );

  const handleToggle = React.useCallback((key: string) => {
    setExpandedKey((prev) => (prev === key ? null : key));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <ProjectSections
        projectId={projectId}
        expandedCard={expandedKey}
        onToggleCard={handleToggle}
        insertMaterialListAfter={2}
        materialListComponent={
          <ProjectMaterialListManagement
            projectId={projectId}
            isExpanded={expandedKey === MATERIAL_LIST_KEY || expandedKey === "__all__"}
            onToggle={() => handleToggle(MATERIAL_LIST_KEY)}
          />
        }
      />
    </div>
  );
}


