"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarIcon, Mail, MessageCircle, Phone } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

type MeetingParticipant = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: "online" | "offline" | "mobile";
  initials?: string;
};

type MeetingHistoryItem = {
  id: string;
  title: string;
  date: string;
  time: string;
  participants: MeetingParticipant[];
  project?: string;
  status: "completed" | "upcoming" | "cancelled";
};

// Mock data for meeting history - replace with API call later
const mockMeetingHistory: MeetingHistoryItem[] = [
  {
    id: "1",
    title: "Team Meeting",
    date: "2024-01-15",
    time: "10:00",
    project: "Project Alpha",
    status: "completed",
    participants: [
      {
        id: "1",
        name: "Vel",
        email: "vel@proultima.net",
        phone: "+1234567890",
        status: "online",
        initials: "V",
      },
      {
        id: "2",
        name: "Rajesh",
        email: "rajesh@proultima.net",
        phone: "+1234567890",
        status: "online",
        initials: "R",
      },
    ],
  },
];

const getStatusCount = (participants: MeetingParticipant[]) => {
  const onlineCount = participants.filter((p) => p.status === "online").length;
  return onlineCount;
};

interface MeetingHistoryProps {
  onMeetingScheduled?: () => void;
}

export function MeetingHistory({ onMeetingScheduled }: MeetingHistoryProps = {}) {
  const [meetings] = React.useState<MeetingHistoryItem[]>(mockMeetingHistory);
  const [isMounted, setIsMounted] = React.useState(false);

  // Track if component is mounted on client to prevent hydration mismatch
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Refresh meetings when a new one is scheduled
  React.useEffect(() => {
    if (onMeetingScheduled) {
      // In a real implementation, you would fetch from API here
    }
  }, [onMeetingScheduled]);

  // Sort meetings by date (most recent first)
  const sortedMeetings = React.useMemo(() => {
    return [...meetings].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`).getTime();
      const dateB = new Date(`${b.date}T${b.time}`).getTime();
      return dateB - dateA;
    });
  }, [meetings]);

  // Get all participants from all meetings
  const allParticipants = React.useMemo(() => {
    const participantMap = new Map<string, MeetingParticipant>();
    sortedMeetings.forEach((meeting) => {
      meeting.participants.forEach((participant) => {
        if (!participantMap.has(participant.id)) {
          participantMap.set(participant.id, participant);
        }
      });
    });
    return Array.from(participantMap.values());
  }, [sortedMeetings]);

  const onlineCount = getStatusCount(allParticipants);
  const totalCount = allParticipants.length;

  return (
    <Card className="w-full shadow-lg overflow-hidden h-full flex flex-col border-l">
      <CardHeader className="border-b shrink-0 bg-emerald-50/70 p-6">
        <CardTitle className="text-lg font-semibold text-emerald-900">Proultima PM</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          <div className="p-4">
            {allParticipants.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No participants found</p>
              </div>
            ) : (
              <>
                {/* Header with counts */}
                <div className="px-4 pt-3 pb-2 mb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      At Work ({totalCount})
                    </span>
                    <span className="text-xs text-muted-foreground">
                      In • {onlineCount}
                    </span>
                  </div>
                </div>

                {/* Participants List */}
                <div className="space-y-1">
                  {allParticipants.map((participant, index) => (
                    <motion.div
                      key={participant.id}
                      initial={false}
                      animate={isMounted ? { opacity: 1, x: 0 } : { opacity: 1, x: 0 }}
                      transition={isMounted ? { delay: index * 0.03 } : { delay: 0 }}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors group"
                    >
                      {/* Initial */}
                      <div className="shrink-0">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-foreground">
                          {participant.initials ||
                            participant.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                        </div>
                      </div>

                      {/* Name and Email */}
                      <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">
                      {participant.name}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{participant.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span className="truncate">{participant.phone}</span>
                      </div>
                    </div>
                      </div>

                  {/* Action Buttons - Email, Chat, and Call */}
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                        // Open mail client
                        window.location.href = `mailto:${participant.email}`;
                          }}
                      aria-label={`Email ${participant.name}`}
                        >
                      <Mail className="h-4 w-4" />
                        </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Navigate to chat with this participant
                        window.location.href = `/chat?user=${encodeURIComponent(participant.email)}`;
                      }}
                      aria-label={`Chat with ${participant.name}`}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Initiate call with this participant
                            // TODO: Implement call functionality
                            alert(`Calling ${participant.name}...`);
                          }}
                          aria-label={`Call ${participant.name}`}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
