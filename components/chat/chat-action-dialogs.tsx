"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Phone, Video, Monitor, Clock, Calendar as CalendarIcon, X, Check, Mic, MicOff, VideoOff, Settings, Users, Maximize2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Phone Call Dialog
type PhoneCallDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactName?: string;
};

export function PhoneCallDialog({ open, onOpenChange, contactName = "Vel" }: PhoneCallDialogProps) {
  const [isCalling, setIsCalling] = React.useState(false);
  const [callDuration, setCallDuration] = React.useState(0);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCalling) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCalling]);

  const handleStartCall = () => {
    setIsCalling(true);
    toast.success("Call initiated", {
      description: `Calling ${contactName}...`,
    });
  };

  const handleEndCall = () => {
    setIsCalling(false);
    const minutes = Math.floor(callDuration / 60);
    const seconds = callDuration % 60;
    toast.info("Call ended", {
      description: `Call duration: ${minutes}:${seconds.toString().padStart(2, "0")}`,
    });
    setCallDuration(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[260px] sm:!max-w-[260px] p-3">
        <DialogHeader>
          <DialogTitle className="text-sm">Voice Call</DialogTitle>
          <DialogDescription className="text-xs">Call {contactName}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center py-3 space-y-2">
          <div className="h-14 w-14 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <Phone className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-center">
            <h3 className="text-sm font-semibold">{contactName}</h3>
            <p className="text-xs text-muted-foreground">+1 (555) 123-4567</p>
            {isCalling && (
              <p className="text-sm text-muted-foreground mt-2">
                {Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, "0")}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          {!isCalling ? (
            <Button onClick={handleStartCall} className="w-full bg-green-600 hover:bg-green-700">
              <Phone className="mr-2 h-4 w-4" />
              Start Call
            </Button>
          ) : (
            <Button onClick={handleEndCall} variant="destructive" className="w-full">
              <X className="mr-2 h-4 w-4" />
              End Call
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Video Call Dialog
type VideoCallDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactName?: string;
};

export function VideoCallDialog({ open, onOpenChange, contactName = "Vel" }: VideoCallDialogProps) {
  const [isCalling, setIsCalling] = React.useState(false);
  const [callDuration, setCallDuration] = React.useState(0);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isVideoOff, setIsVideoOff] = React.useState(false);
  const [isFrontCamera, setIsFrontCamera] = React.useState(true);
  const [videoQuality, setVideoQuality] = React.useState<"HD" | "SD" | "Low">("HD");
  const [showSettings, setShowSettings] = React.useState(false);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCalling) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCalling]);

  const handleStartCall = () => {
    setIsCalling(true);
    toast.success("Video call initiated", {
      description: `Starting video call with ${contactName}...`,
    });
  };

  const handleEndCall = () => {
    setIsCalling(false);
    const minutes = Math.floor(callDuration / 60);
    const seconds = callDuration % 60;
    toast.info("Video call ended", {
      description: `Call duration: ${minutes}:${seconds.toString().padStart(2, "0")}`,
    });
    setCallDuration(0);
    setIsMuted(false);
    setIsVideoOff(false);
    setShowSettings(false);
    onOpenChange(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast.info(!isMuted ? "Microphone muted" : "Microphone unmuted", { duration: 1000 });
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    toast.info(!isVideoOff ? "Camera turned off" : "Camera turned on", { duration: 1000 });
  };

  const toggleCamera = () => {
    setIsFrontCamera(!isFrontCamera);
    toast.info(`Switched to ${!isFrontCamera ? "front" : "back"} camera`, { duration: 1000 });
  };

  const formatDuration = () => {
    const minutes = Math.floor(callDuration / 60);
    const seconds = callDuration % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[400px] sm:!max-w-[400px] p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-base">Video Call</DialogTitle>
              <DialogDescription className="text-xs">Calling {contactName}</DialogDescription>
            </div>
            {isCalling && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">
                    {formatDuration()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Video Area */}
        <div className="relative bg-gray-900 dark:bg-gray-950 aspect-video flex items-center justify-center">
          {/* Remote Video (Main) */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isCalling ? (
              <div className="relative w-full h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-purple-900/50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="h-20 w-20 rounded-full bg-blue-600/30 flex items-center justify-center mx-auto mb-3">
                      <Users className="h-10 w-10 text-blue-400" />
                    </div>
                    <p className="text-white font-semibold">{contactName}</p>
                    <p className="text-white/70 text-xs mt-1">Video call in progress</p>
                  </div>
                </div>
                {/* Video quality indicator */}
                <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 rounded text-xs text-white">
                  {videoQuality}
                </div>
              </div>
            ) : (
              <Video className="h-16 w-16 text-gray-600" />
            )}
          </div>

          {/* Local Video (Picture-in-Picture) */}
          {isCalling && !isVideoOff && (
            <div className="absolute bottom-4 right-4 w-24 h-32 rounded-lg bg-gray-800 border-2 border-white/20 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-1">
                    <span className="text-xs text-white font-semibold">You</span>
                  </div>
                  {isMuted && (
                    <MicOff className="h-3 w-3 text-red-400 mx-auto" />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Call Controls Overlay */}
          {isCalling && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-2">
              <Button
                size="icon"
                variant={isMuted ? "destructive" : "secondary"}
                onClick={toggleMute}
                className="h-9 w-9 rounded-full"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              
              <Button
                size="icon"
                variant={isVideoOff ? "destructive" : "secondary"}
                onClick={toggleVideo}
                className="h-9 w-9 rounded-full"
                title={isVideoOff ? "Turn on camera" : "Turn off camera"}
              >
                {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
              </Button>

              <Button
                size="icon"
                variant="secondary"
                onClick={toggleCamera}
                className="h-9 w-9 rounded-full"
                title="Switch camera"
              >
                <Video className="h-4 w-4" />
              </Button>

              <Button
                size="icon"
                variant="secondary"
                onClick={() => setShowSettings(!showSettings)}
                className="h-9 w-9 rounded-full"
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </Button>

              <Button
                size="icon"
                variant="destructive"
                onClick={handleEndCall}
                className="h-9 w-9 rounded-full"
                title="End call"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Settings Panel */}
        {isCalling && showSettings && (
          <div className="px-4 py-3 bg-muted/50 border-t">
            <div className="space-y-2">
              <Label className="text-xs">Video Quality</Label>
              <Select value={videoQuality} onValueChange={(value: "HD" | "SD" | "Low") => {
                setVideoQuality(value);
                toast.info(`Video quality set to ${value}`, { duration: 1000 });
              }}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HD">HD (720p)</SelectItem>
                  <SelectItem value="SD">SD (480p)</SelectItem>
                  <SelectItem value="Low">Low (360p)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Call Info */}
        {isCalling && (
          <div className="px-4 py-2 bg-muted/30 border-t">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">+1 (555) 123-4567</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div className={`h-2 w-2 rounded-full ${isMuted ? 'bg-red-500' : 'bg-green-500'}`} />
                <span className="text-muted-foreground">{isMuted ? 'Muted' : 'Audio on'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Start Call Button */}
        {!isCalling && (
          <DialogFooter className="px-4 pb-4 pt-2">
            <Button onClick={handleStartCall} className="w-full bg-green-600 hover:bg-green-700">
              <Video className="mr-2 h-4 w-4" />
              Start Video Call
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Screen Share Dialog
type ScreenShareDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ScreenShareDialog({ open, onOpenChange }: ScreenShareDialogProps) {
  const [isSharing, setIsSharing] = React.useState(false);
  const [shareType, setShareType] = React.useState<"screen" | "window" | "tab">("screen");

  const handleStartShare = () => {
    setIsSharing(true);
    toast.success("Screen sharing started", {
      description: `Sharing your ${shareType} with Vel`,
    });
  };

  const handleStopShare = () => {
    setIsSharing(false);
    toast.info("Screen sharing stopped");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[280px] sm:!max-w-[280px] p-4">
        <DialogHeader>
          <DialogTitle className="text-base">Share Screen</DialogTitle>
          <DialogDescription className="text-xs">Share your screen with Vel</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-3">
          {!isSharing ? (
            <div className="space-y-3">
              <Label>Share Type</Label>
              <Select value={shareType} onValueChange={(value: "screen" | "window" | "tab") => setShareType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="screen">Entire Screen</SelectItem>
                  <SelectItem value="window">Application Window</SelectItem>
                  <SelectItem value="tab">Browser Tab</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="flex flex-col items-center py-4 space-y-3">
              <div className="h-24 w-full rounded-lg bg-gray-900 dark:bg-gray-800 flex items-center justify-center">
                <Monitor className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-sm text-muted-foreground">Sharing {shareType}...</p>
            </div>
          )}
        </div>
        <DialogFooter>
          {!isSharing ? (
            <Button onClick={handleStartShare} className="w-full bg-blue-600 hover:bg-blue-700">
              <Monitor className="mr-2 h-4 w-4" />
              Start Sharing
            </Button>
          ) : (
            <Button onClick={handleStopShare} variant="destructive" className="w-full">
              <X className="mr-2 h-4 w-4" />
              Stop Sharing
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Reminder Dialog
type ReminderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ReminderDialog({ open, onOpenChange }: ReminderDialogProps) {
  const [reminderText, setReminderText] = React.useState("");
  const [reminderTime, setReminderTime] = React.useState("");
  const [date, setDate] = React.useState<Date>();

  const handleSetReminder = () => {
    if (!reminderText.trim() || !reminderTime || !date) {
      toast.error("Please fill all fields");
      return;
    }
    toast.success("Reminder set", {
      description: `Reminder: "${reminderText}" on ${format(date, "PPP")} at ${reminderTime}`,
    });
    setReminderText("");
    setReminderTime("");
    setDate(undefined);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[280px] sm:!max-w-[280px] p-4">
        <DialogHeader>
          <DialogTitle className="text-base">Set Reminder</DialogTitle>
          <DialogDescription className="text-xs">Create a reminder for this conversation</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-3">
          <div className="space-y-2">
            <Label htmlFor="reminder-text">Reminder</Label>
            <Textarea
              id="reminder-text"
              placeholder="What do you want to be reminded about?"
              value={reminderText}
              onChange={(e) => setReminderText(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reminder-time">Time</Label>
            <Input
              id="reminder-time"
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSetReminder} className="bg-blue-600 hover:bg-blue-700">
            <Clock className="mr-2 h-4 w-4" />
            Set Reminder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Schedule Meeting Dialog
type ScheduleMeetingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ScheduleMeetingDialog({ open, onOpenChange }: ScheduleMeetingDialogProps) {
  const [meetingTitle, setMeetingTitle] = React.useState("");
  const [meetingDate, setMeetingDate] = React.useState<Date>();
  const [meetingTime, setMeetingTime] = React.useState("");
  const [meetingDuration, setMeetingDuration] = React.useState("30");
  const [meetingDescription, setMeetingDescription] = React.useState("");

  const handleScheduleMeeting = () => {
    if (!meetingTitle.trim() || !meetingDate || !meetingTime) {
      toast.error("Please fill required fields");
      return;
    }
    toast.success("Meeting scheduled", {
      description: `"${meetingTitle}" on ${format(meetingDate, "PPP")} at ${meetingTime}`,
    });
    setMeetingTitle("");
    setMeetingDate(undefined);
    setMeetingTime("");
    setMeetingDuration("30");
    setMeetingDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[320px] sm:!max-w-[320px] p-4">
        <DialogHeader>
          <DialogTitle className="text-base">Schedule Meeting</DialogTitle>
          <DialogDescription className="text-xs">Schedule a meeting with Vel</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-3">
          <div className="space-y-2">
            <Label htmlFor="meeting-title">Meeting Title *</Label>
            <Input
              id="meeting-title"
              placeholder="Enter meeting title"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !meetingDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {meetingDate ? format(meetingDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={meetingDate} onSelect={setMeetingDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="meeting-time">Time *</Label>
              <Input
                id="meeting-time"
                type="time"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="meeting-duration">Duration (minutes)</Label>
            <Select value={meetingDuration} onValueChange={setMeetingDuration}>
              <SelectTrigger id="meeting-duration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="meeting-description">Description</Label>
            <Textarea
              id="meeting-description"
              placeholder="Meeting agenda or notes..."
              value={meetingDescription}
              onChange={(e) => setMeetingDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleScheduleMeeting} className="bg-blue-600 hover:bg-blue-700">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Schedule Meeting
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

