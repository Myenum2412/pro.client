import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function FilesLoading() {
  return (
    <div className="min-h-0 flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0">
      <Card className="w-full shadow-lg">
        <CardHeader className="border-b">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96 mt-2" />
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

