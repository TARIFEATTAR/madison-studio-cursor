import React, { useState, useMemo } from "react";
import {
  Plus,
  Filter,
  SortAsc,
  Search,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { TaskCard } from "./TaskCard";
import { TaskCreationModal } from "./TaskCreationModal";
import { TaskDetailModal } from "./TaskDetailModal";
import {
  useProductTasks,
  type ProductTask,
  type TaskStatus,
  TASK_STATUS_OPTIONS,
  TASK_SECTIONS,
} from "@/hooks/useProductTasks";
import { cn } from "@/lib/utils";

interface TaskListProps {
  productId: string;
  organizationId: string;
  defaultSection?: string;
  compact?: boolean;
}

type SortOption = "due_date" | "priority" | "created_at" | "status";
type FilterTab = "all" | "pending" | "in_progress" | "completed" | "overdue";

export function TaskList({
  productId,
  organizationId,
  defaultSection,
  compact = false,
}: TaskListProps) {
  const {
    tasks,
    isLoading,
    pendingTasks,
    inProgressTasks,
    completedTasks,
    overdueTasks,
    changeStatus,
    deleteTask,
  } = useProductTasks(productId, organizationId);

  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSection, setFilterSection] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("due_date");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  
  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ProductTask | null>(null);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    // Tab filter
    switch (activeTab) {
      case "pending":
        filtered = filtered.filter(t => t.status === "pending");
        break;
      case "in_progress":
        filtered = filtered.filter(t => t.status === "in_progress");
        break;
      case "completed":
        filtered = filtered.filter(t => t.status === "completed");
        break;
      case "overdue":
        filtered = filtered.filter(t => 
          t.due_date && 
          new Date(t.due_date) < new Date() && 
          !["completed", "cancelled"].includes(t.status)
        );
        break;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query) ||
        t.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Section filter
    if (filterSection && filterSection !== "all") {
      filtered = filtered.filter(t => t.section === filterSection);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "due_date":
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        case "priority":
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case "created_at":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "status":
          const statusOrder = { blocked: 0, in_progress: 1, pending: 2, review: 3, completed: 4, cancelled: 5 };
          return statusOrder[a.status] - statusOrder[b.status];
        default:
          return 0;
      }
    });

    return filtered;
  }, [tasks, activeTab, searchQuery, filterSection, sortBy]);

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    changeStatus.mutate({ taskId, status });
  };

  const handleDelete = (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask.mutate(taskId);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading tasks...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Tasks</h3>
          <Badge variant="secondary">{tasks.length}</Badge>
          {overdueTasks.length > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="w-3 h-3" />
              {overdueTasks.length} overdue
            </Badge>
          )}
        </div>
        
        <Button onClick={() => setCreateModalOpen(true)} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Task
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Section filter */}
            <Select value={filterSection} onValueChange={setFilterSection}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All sections" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sections</SelectItem>
                {TASK_SECTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-36">
                <SortAsc className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="due_date">Due Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="created_at">Created</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tab filters */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterTab)}>
        <TabsList className="bg-muted/50">
          <TabsTrigger value="all" className="gap-2">
            All
            <Badge variant="secondary" className="text-xs">
              {tasks.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            <Circle className="w-3 h-3" />
            Pending
            <Badge variant="secondary" className="text-xs">
              {pendingTasks.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="in_progress" className="gap-2">
            <Clock className="w-3 h-3" />
            In Progress
            <Badge variant="secondary" className="text-xs">
              {inProgressTasks.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <CheckCircle2 className="w-3 h-3" />
            Completed
            <Badge variant="secondary" className="text-xs">
              {completedTasks.length}
            </Badge>
          </TabsTrigger>
          {overdueTasks.length > 0 && (
            <TabsTrigger value="overdue" className="gap-2 text-red-600">
              <AlertCircle className="w-3 h-3" />
              Overdue
              <Badge variant="destructive" className="text-xs">
                {overdueTasks.length}
              </Badge>
            </TabsTrigger>
          )}
        </TabsList>

        {/* Task list */}
        <TabsContent value={activeTab} className="mt-4">
          {filteredTasks.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-medium mb-2">
                  {activeTab === "all" && tasks.length === 0
                    ? "No tasks yet"
                    : "No tasks match your filters"}
                </h4>
                <p className="text-muted-foreground mb-4">
                  {activeTab === "all" && tasks.length === 0
                    ? "Create your first task to get started"
                    : "Try adjusting your search or filters"}
                </p>
                {activeTab === "all" && tasks.length === 0 && (
                  <Button onClick={() => setCreateModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Task
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className={cn(
              compact ? "space-y-1" : "space-y-3"
            )}>
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  compact={compact}
                  onClick={() => setSelectedTask(task)}
                  onStatusChange={(status) => handleStatusChange(task.id, status)}
                  onDelete={() => handleDelete(task.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Task Modal */}
      <TaskCreationModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        productId={productId}
        organizationId={organizationId}
        defaultSection={defaultSection}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />
    </div>
  );
}
