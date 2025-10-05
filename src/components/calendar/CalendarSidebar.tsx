import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TasksList } from "./TasksList";
import { NotesPanel } from "./NotesPanel";
import { CheckSquare, FileText } from "lucide-react";

export const CalendarSidebar = () => {
  return (
    <div className="h-full bg-card border rounded-lg p-6">
      <Tabs defaultValue="tasks" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="tasks" className="gap-2">
            <CheckSquare className="w-4 h-4" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="notes" className="gap-2">
            <FileText className="w-4 h-4" />
            Notes
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks" className="flex-1 overflow-y-auto mt-0">
          <TasksList />
        </TabsContent>
        
        <TabsContent value="notes" className="flex-1 overflow-y-auto mt-0">
          <NotesPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};
