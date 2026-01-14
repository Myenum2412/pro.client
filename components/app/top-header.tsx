import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { TopHeaderSearch } from "./top-header-search";

export function TopHeader({
  section,
  page,
  search,
}: {
  section?: string;
  page: string;
  search?: { placeholder: string; action?: string; name?: string };
}) {
  return (
    <header className="relative flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      {/* Left side - Sidebar trigger and breadcrumb */}
      <div className="flex items-center gap-2 px-4 min-w-0 shrink-0">
        <SidebarTrigger className="shrink-0 hover:bg-accent transition-colors" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4 shrink-0"
        />
        <Breadcrumb className="min-w-0">
          <BreadcrumbList className="min-w-0">
            {section ? (
              <>
                <BreadcrumbItem className="hidden md:block shrink-0">
                  <BreadcrumbLink href="#">{section}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block shrink-0" />
              </>
            ) : null}
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage className="break-words" title={page}>{page}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Center - Search box */}
      {search ? (
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center w-full max-w-md pointer-events-none">
          <div className="w-full pointer-events-auto">
            <TopHeaderSearch
              placeholder={search.placeholder}
              searchKey={search.name ?? "q"}
            />
          </div>
        </div>
      ) : null}

      {/* Right side - Spacer for balance */}
      <div className="flex items-center gap-2 px-4 min-w-0 flex-1 shrink-0" />
    </header>
  );
}


