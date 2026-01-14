import type { Metadata } from "next";
import { TopHeader } from "@/components/app/top-header";
import { VercelV0Chat } from "@/components/mvpblocks/v0-chat";

export const metadata: Metadata = {
  title: "AI Chat",
  description: "Get AI-powered assistance for your construction projects, drawings, and billing",
};

export default async function AIChatPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-500">
      <TopHeader
        section="AI Chat"
        page="AI Assistant"
        search={{ placeholder: "Search AI conversations...", action: "/client/ai-chat", name: "q" }}
      />
      <div className="flex-1 min-h-0 overflow-hidden">
        <VercelV0Chat />
      </div>
    </div>
  );
}
