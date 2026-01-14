import { TopHeader } from "@/components/app/top-header";
import { ChatInterface } from "@/components/chat-interface";

export default async function ChatPage() {
  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500">
      <TopHeader
        section="Chat"
        page="Messages"
        search={{ placeholder: "Search messages...", action: "/client/chat", name: "q" }}
      />
      <ChatInterface />
    </div>
  );
}
