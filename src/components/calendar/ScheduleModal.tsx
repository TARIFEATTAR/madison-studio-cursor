import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface DerivativeAsset {
  id: string;
  master_content_id: string;
  asset_type: string;
  generated_content: string;
  platform_specs: any;
}

interface MasterContent {
  id: string;
  title: string;
  content_type: string;
}

interface ScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  itemToEdit?: any;
  onSuccess: () => void;
  derivativeAsset?: DerivativeAsset;
  masterContent?: MasterContent;
}

const PLATFORM_MAPPING: Record<string, string> = {
  email: "Email",
  instagram: "Instagram",
  twitter: "Twitter",
  product: "LinkedIn",
  sms: "SMS"
};

const DERIVATIVE_LABELS: Record<string, string> = {
  email: "Email Newsletter",
  instagram: "Instagram Carousel",
  twitter: "Twitter Thread",
  product: "Product Description",
  sms: "SMS Message",
};

export const ScheduleModal = ({ 
  open, 
  onOpenChange, 
  selectedDate, 
  itemToEdit, 
  onSuccess,
  derivativeAsset,
  masterContent 
}: ScheduleModalProps) => {
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(selectedDate || new Date());
  const [time, setTime] = useState("");
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("");
  const [notes, setNotes] = useState("");
  const [conflicts, setConflicts] = useState<any[]>([]);

  useEffect(() => {
    if (itemToEdit) {
      setDate(new Date(itemToEdit.scheduled_date));
      setTime(itemToEdit.scheduled_time || "");
      setTitle(itemToEdit.title);
      setPlatform(itemToEdit.platform || "");
      setNotes(itemToEdit.notes || "");
    } else if (derivativeAsset && masterContent) {
      // Pre-fill from derivative asset
      setDate(selectedDate || new Date());
      setTime("");
      setTitle(`${DERIVATIVE_LABELS[derivativeAsset.asset_type] || derivativeAsset.asset_type} - ${masterContent.title}`);
      setPlatform(PLATFORM_MAPPING[derivativeAsset.asset_type] || "");
      setNotes(`Generated from master content: ${masterContent.title}\nAsset ID: ${derivativeAsset.id}`);
    } else {
      setDate(selectedDate || new Date());
      setTime("");
      setTitle("");
      setPlatform("");
      setNotes("");
    }
  }, [itemToEdit, selectedDate, open, derivativeAsset, masterContent]);

  useEffect(() => {
    if (date && time) {
      checkConflicts();
    }
  }, [date, time]);

  const checkConflicts = async () => {
    if (!date || !time) return;

    const { data, error } = await supabase
      .from("scheduled_content")
      .select("*")
      .eq("scheduled_date", format(date, "yyyy-MM-dd"))
      .eq("scheduled_time", time)
      .neq("status", "cancelled");

    if (!error && data) {
      const filteredConflicts = itemToEdit 
        ? data.filter(item => item.id !== itemToEdit.id)
        : data;
      setConflicts(filteredConflicts);
    }
  };

  const handleSave = async () => {
    if (!date || !title) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const scheduleData = {
        user_id: user.id,
        title,
        content_type: platform || "general",
        platform,
        scheduled_date: format(date, "yyyy-MM-dd"),
        scheduled_time: time || null,
        notes,
        status: "scheduled",
        derivative_id: derivativeAsset?.id || null,
        content_id: derivativeAsset?.master_content_id || masterContent?.id || null,
      };

      let result;
      if (itemToEdit) {
        const { data, error } = await supabase
          .from("scheduled_content")
          .update(scheduleData)
          .eq("id", itemToEdit.id)
          .select()
          .single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from("scheduled_content")
          .insert(scheduleData)
          .select()
          .single();
        if (error) throw error;
        result = data;
      }

      // Sync to Google Calendar
      try {
        const { data: syncSettings } = await supabase
          .from('google_calendar_sync')
          .select('sync_enabled')
          .eq('user_id', user.id)
          .maybeSingle();

        if (syncSettings?.sync_enabled) {
          const operation = itemToEdit ? 'update' : 'create';
          
          await supabase.functions.invoke('sync-to-google-calendar', {
            body: {
              operation,
              scheduledContentId: result.id,
              eventData: {
                title: title.trim(),
                date: format(date, 'yyyy-MM-dd'),
                time: time || undefined,
                notes: notes?.trim() || undefined,
                platform: platform || undefined,
              },
              googleEventId: itemToEdit?.google_event_id || undefined,
            },
          });

          toast({
            title: "Success",
            description: `${itemToEdit ? 'Updated' : 'Scheduled'} and synced to Google Calendar`,
          });
        } else {
          toast({
            title: "Success",
            description: itemToEdit ? "Schedule updated" : "Content scheduled successfully",
          });
        }
      } catch (syncError: any) {
        console.error("Google Calendar sync error:", syncError);
        toast({
          title: "Saved locally",
          description: `Schedule saved but Google Calendar sync failed: ${syncError.message}`,
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {itemToEdit 
              ? "Edit Schedule" 
              : derivativeAsset 
                ? `Schedule ${DERIVATIVE_LABELS[derivativeAsset.asset_type] || "Content"}` 
                : "Schedule Content"
            }
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter content title"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
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
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time (optional)</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Email">Email</SelectItem>
                <SelectItem value="Instagram">Instagram</SelectItem>
                <SelectItem value="Twitter">Twitter</SelectItem>
                <SelectItem value="Blog">Blog</SelectItem>
                <SelectItem value="LinkedIn">LinkedIn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes"
              rows={3}
            />
          </div>

          {/* Conflicts */}
          {conflicts.length > 0 && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                <div>
                  <h4 className="font-medium text-destructive mb-2">Scheduling Conflict</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    The following items are already scheduled at this time:
                  </p>
                  <ul className="text-sm space-y-1">
                    {conflicts.map(conflict => (
                      <li key={conflict.id} className="text-muted-foreground">
                        • {conflict.title} {conflict.platform && `(${conflict.platform})`}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : itemToEdit ? "Update" : "Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
