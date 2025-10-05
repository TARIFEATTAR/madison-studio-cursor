import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  task_text: string;
  is_completed: boolean;
  due_date: string | null;
}

export const TasksList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("calendar_tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      console.error("Error fetching tasks:", error);
    }
  };

  const addTask = async () => {
    if (!newTaskText.trim()) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("calendar_tasks")
        .insert({
          user_id: user.id,
          task_text: newTaskText.trim(),
          due_date: newTaskDueDate ? format(newTaskDueDate, "yyyy-MM-dd") : null,
        });

      if (error) throw error;

      setNewTaskText("");
      setNewTaskDueDate(undefined);
      fetchTasks();
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

  const toggleTask = async (id: string, isCompleted: boolean) => {
    try {
      const { error } = await supabase
        .from("calendar_tasks")
        .update({ is_completed: !isCompleted })
        .eq("id", id);

      if (error) throw error;
      fetchTasks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from("calendar_tasks")
        .delete()
        .eq("id", id);

      if (error) throw error;
      fetchTasks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Input
          placeholder="Add a task..."
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
        />
        
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "justify-start text-left font-normal flex-1",
                  !newTaskDueDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {newTaskDueDate ? format(newTaskDueDate, "PPP") : "Due date (optional)"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={newTaskDueDate}
                onSelect={setNewTaskDueDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button onClick={addTask} disabled={loading || !newTaskText.trim()} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
          >
            <Checkbox
              checked={task.is_completed}
              onCheckedChange={() => toggleTask(task.id, task.is_completed)}
              className="mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm break-words",
                  task.is_completed && "line-through text-muted-foreground"
                )}
              >
                {task.task_text}
              </p>
              {task.due_date && (
                <p className="text-xs text-muted-foreground mt-1">
                  Due: {format(new Date(task.due_date), "MMM d, yyyy")}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteTask(task.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ))}

        {tasks.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No tasks yet. Add one above!
          </p>
        )}
      </div>
    </div>
  );
};
