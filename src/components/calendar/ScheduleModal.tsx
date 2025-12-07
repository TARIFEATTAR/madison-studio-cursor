import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimePicker } from "@/components/ui/time-picker";
import { format } from "date-fns";
import { Calendar as CalendarIcon, AlertCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useOnboarding } from "@/hooks/useOnboarding";

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
  const isMobile = useIsMobile();
  const { currentOrganizationId } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(selectedDate || new Date());
  const [time, setTime] = useState("");
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("");
  const [notes, setNotes] = useState("");
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
        organization_id: currentOrganizationId,
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

  const handleDelete = async () => {
    if (!itemToEdit) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Check if Google Calendar sync is enabled
      const { data: syncSettings } = await supabase
        .from('google_calendar_sync')
        .select('sync_enabled')
        .eq('user_id', user.id)
        .maybeSingle();

      // If synced to Google Calendar, delete from there first
      if (syncSettings?.sync_enabled && itemToEdit.google_event_id) {
        try {
          await supabase.functions.invoke('sync-to-google-calendar', {
            body: {
              operation: 'delete',
              scheduledContentId: itemToEdit.id,
              googleEventId: itemToEdit.google_event_id,
            },
          });
        } catch (syncError: any) {
          console.error("Google Calendar delete error:", syncError);
        }
      }

      // Delete from database
      const { error } = await supabase
        .from("scheduled_content")
        .delete()
        .eq("id", itemToEdit.id);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Schedule item deleted successfully",
      });

      onSuccess();
      onOpenChange(false);
      setDeleteDialogOpen(false);
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

  const modalTitle = itemToEdit 
    ? "Edit Schedule" 
    : derivativeAsset 
      ? `Schedule ${DERIVATIVE_LABELS[derivativeAsset.asset_type] || "Content"}` 
      : "Schedule Content";

  const formContent = (
    <>
      <div className={cn("space-y-6", isMobile ? "py-4" : "py-6")}>
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className={isMobile ? "text-base" : ""}>Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter content title"
            className={isMobile ? "h-12 text-base" : ""}
          />
        </div>

        {/* Date & Time */}
        <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-2")}>
          <div className="space-y-2">
            <Label className={isMobile ? "text-base" : ""}>Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                    isMobile && "h-12 text-base"
                  )}
                >
                  <CalendarIcon className={cn("mr-2", isMobile ? "h-5 w-5" : "h-4 w-4")} />
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
            <Label htmlFor="time" className={isMobile ? "text-base" : ""}>Time (optional)</Label>
            <TimePicker
                value={time}
              onChange={setTime}
              placeholder="--:-- --"
              className={cn(isMobile && "h-12 text-base")}
              />
          </div>
        </div>

        {/* Platform */}
        <div className="space-y-2">
          <Label htmlFor="platform" className={isMobile ? "text-base" : ""}>Platform</Label>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className={isMobile ? "h-12 text-base" : ""}>
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent className="z-[1200]" position="popper" sideOffset={4}>
              <SelectItem value="Email">Email</SelectItem>
              <SelectItem value="Instagram">Instagram</SelectItem>
              <SelectItem value="Twitter">Twitter</SelectItem>
              <SelectItem value="Blog">Blog</SelectItem>
              <SelectItem value="LinkedIn">LinkedIn</SelectItem>
              <SelectItem value="SMS">SMS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className={isMobile ? "text-base" : ""}>Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => {
              const target = e.target;
              const cursorPosition = target.selectionStart;
              const value = target.value;
              setNotes(value);
              requestAnimationFrame(() => {
                if (target) {
                  target.setSelectionRange(cursorPosition, cursorPosition);
                }
              });
            }}
            placeholder="Add any additional notes"
            rows={isMobile ? 4 : 3}
            className={isMobile ? "text-base" : ""}
          />
        </div>

        {/* Conflicts */}
        {conflicts.length > 0 && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className={cn("text-destructive mt-0.5", isMobile ? "w-6 h-6" : "w-5 h-5")} />
              <div>
                <h4 className={cn("font-medium text-destructive mb-2", isMobile && "text-base")}>
                  Scheduling Conflict
                </h4>
                <p className={cn("text-muted-foreground mb-2", isMobile ? "text-base" : "text-sm")}>
                  The following items are already scheduled at this time:
                </p>
                <ul className={cn("space-y-1", isMobile ? "text-base" : "text-sm")}>
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
    </>
  );

  const footerContent = (
    <div className={cn("flex justify-between items-center", isMobile ? "flex-col gap-3 w-full" : "flex-row")}>
      <div className={isMobile ? "w-full" : ""}>
        {itemToEdit && (
          <Button 
            variant="destructive" 
            onClick={() => setDeleteDialogOpen(true)}
            disabled={loading}
            className={cn("gap-2", isMobile && "w-full h-12")}
          >
            <Trash2 className={isMobile ? "w-5 h-5" : "w-4 h-4"} />
            Delete
          </Button>
        )}
      </div>
      <div className={cn("flex gap-2", isMobile && "w-full flex-col-reverse")}>
        <Button 
          variant="outline" 
          onClick={() => onOpenChange(false)}
          className={isMobile ? "w-full h-12" : ""}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={loading}
          className={isMobile ? "w-full h-12" : ""}
        >
          {loading ? "Saving..." : itemToEdit ? "Update" : "Schedule"}
        </Button>
      </div>
    </div>
  );

  return (
    <>
    {isMobile ? (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[95vh]">
          <DrawerHeader>
            <DrawerTitle className="text-xl">{modalTitle}</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-4">
            {formContent}
          </div>
          <DrawerFooter className="pt-4">
            {footerContent}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    ) : (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
          </DialogHeader>
          {formContent}
          <DialogFooter>
            {footerContent}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )}

    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Schedule Item</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{itemToEdit?.title}"? This action cannot be undone.
            {itemToEdit?.google_event_id && " This will also remove the event from Google Calendar."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {loading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
};
