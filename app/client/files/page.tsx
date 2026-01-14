import type { Metadata } from "next";
import { TopHeader } from "@/components/app/top-header";
import { FileManagementClient } from "@/components/files/file-management-client";

export const metadata: Metadata = {
  title: "Files",
  description: "Manage your files and documents",
};

export default async function FilesPage() {
  return (
    <>
      <TopHeader
        section="Files"
        page="File Manager"
        search={{ placeholder: "Search files...", action: "/client/files", name: "q" }}
      />
      <div className="min-h-0 flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <FileManagementClient />
      </div>
    </>
  );
}
