"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Loader2, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { fetchJson } from "@/lib/api/fetch-json";

type User = {
  id: string;
  email: string;
  name: string;
  avatar: string;
};

type ConnectUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
};

export function ConnectUserDialog({
  open,
  onOpenChange,
  projectId,
}: ConnectUserDialogProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetchJson<User[]>("/api/users");
      return response;
    },
    enabled: open,
  });

  // Delete chat messages and save connection mutation
  const deleteChatMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser) {
        throw new Error("No user selected");
      }

      // Step 1: Delete chat messages
      const deleteUrl = projectId
        ? `/api/chat/messages?projectId=${projectId}`
        : "/api/chat/messages";
      const deleteResponse = await fetch(deleteUrl, {
        method: "DELETE",
      });
      if (!deleteResponse.ok) {
        throw new Error("Failed to delete chat messages");
      }

      // Step 2: Save connection
      const connectionResponse = await fetch("/api/connections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toUserId: selectedUser.id,
          toUserName: selectedUser.name,
          toUserEmail: selectedUser.email,
          projectId: projectId || null,
        }),
      });

      if (!connectionResponse.ok) {
        throw new Error("Failed to save connection");
      }

      return {
        deleteResult: await deleteResponse.json(),
        connection: await connectionResponse.json(),
      };
    },
    onSuccess: async (data) => {
      // Invalidate chat messages query
      queryClient.invalidateQueries({ queryKey: ["chat-messages"] });
      
      // Send a system notification message to the chat
      try {
        const notificationMessage = `Connected to ${selectedUser?.name || selectedUser?.email}. Previous chat history has been cleared.`;
        
        // Send system message via chat API
        const messageUrl = projectId
          ? `/api/chat/messages?projectId=${projectId}`
          : "/api/chat/messages";
        
        // Note: We need to create a system message endpoint or modify the POST to accept role
        // For now, we'll use a workaround by creating a system message
        await fetch("/api/chat/system-message", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: notificationMessage,
            projectId: projectId || null,
          }),
        }).catch(() => {
          // If system message endpoint doesn't exist, that's okay
          // The toast notification is sufficient
        });
      } catch (error) {
        // Ignore errors - toast notification is sufficient
      }
      
      // Show success notification
      toast.success("Connected successfully", {
        description: `Chat cleared and connected to ${selectedUser?.name || selectedUser?.email}`,
      });

      onOpenChange(false);
      setSelectedUser(null);
      setSearchQuery("");
    },
    onError: (error) => {
      toast.error("Failed to connect", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    },
  });

  // Filter users based on search query
  const filteredUsers = React.useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const handleConnect = () => {
    if (!selectedUser) {
      toast.error("Please select a user");
      return;
    }
    deleteChatMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[280px] sm:!max-w-[280px] p-4">
        <DialogHeader>
          <DialogTitle>Connect to Another Person</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Users List */}
          <ScrollArea className="h-[300px] rounded-md border">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <User className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "No users found" : "No users available"}
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                      "hover:bg-accent",
                      selectedUser?.id === user.id && "bg-accent ring-2 ring-primary"
                    )}
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                    {selectedUser?.id === user.id && (
                      <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setSelectedUser(null);
              setSearchQuery("");
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConnect}
            disabled={!selectedUser || deleteChatMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {deleteChatMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

