import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Settings2, CheckSquare, FileText } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoogleCalendarConnect } from "./GoogleCalendarConnect";
import { TasksList } from "./TasksList";
import { NotesPanel } from "./NotesPanel";

interface MobileCalendarSheetProps {
  currentDate: Date;
  viewMode: "month" | "week" | "agenda";
  onViewModeChange: (mode: "month" | "week" | "agenda") => void;
  onDateChange: (date: Date) => void;
  onToday: () => void;
}

export const MobileCalendarSheet = ({
  currentDate,
  viewMode,
  onViewModeChange,
  onDateChange,
  onToday,
}: MobileCalendarSheetProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-12 w-12">
          <Settings2 className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl">Calendar Settings</SheetTitle>
        </SheetHeader>

        <div className="space-y-8 overflow-y-auto max-h-[calc(85vh-120px)] pb-6">
          {/* Tasks & Notes Section */}
          <div>
            <Tabs defaultValue="tasks" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tasks" className="gap-2">
                  <CheckSquare className="w-4 h-4" />
                  Tasks
                </TabsTrigger>
                <TabsTrigger value="notes" className="gap-2">
                  <FileText className="w-4 h-4" />
                  Notes
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="tasks" className="max-h-[300px] overflow-y-auto mt-4">
                <TasksList />
              </TabsContent>
              
              <TabsContent value="notes" className="max-h-[300px] overflow-y-auto mt-4">
                <NotesPanel />
              </TabsContent>
            </Tabs>
          </div>

          <Separator />

          {/* Mini Calendar */}
          <div>
            <h3 className="text-lg font-medium mb-4">Jump to Date</h3>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={currentDate}
                onSelect={(date) => {
                  if (date) {
                    onDateChange(date);
                    setOpen(false);
                  }
                }}
                className="rounded-md border"
              />
            </div>
          </div>

          <Separator />

          {/* Quick Actions */}
          <div>
            <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
            <Button
              variant="outline"
              className="w-full h-14 text-base justify-start"
              onClick={() => {
                onToday();
                setOpen(false);
              }}
            >
              <CalendarIcon className="w-5 h-5 mr-3" />
              Jump to Today
            </Button>
          </div>

          <Separator />

          {/* View Mode */}
          <div>
            <h3 className="text-lg font-medium mb-4">View Mode</h3>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={viewMode === "agenda" ? "default" : "outline"}
                className="h-14 text-base"
                onClick={() => {
                  onViewModeChange("agenda");
                  setOpen(false);
                }}
              >
                List
              </Button>
              <Button
                variant={viewMode === "month" ? "default" : "outline"}
                className="h-14 text-base"
                onClick={() => {
                  onViewModeChange("month");
                  setOpen(false);
                }}
              >
                Month
              </Button>
              <Button
                variant={viewMode === "week" ? "default" : "outline"}
                className="h-14 text-base"
                onClick={() => {
                  onViewModeChange("week");
                  setOpen(false);
                }}
              >
                Week
              </Button>
            </div>
          </div>

          <Separator />

          {/* Google Calendar */}
          <div>
            <h3 className="text-lg font-medium mb-4">Google Calendar</h3>
            <GoogleCalendarConnect />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
