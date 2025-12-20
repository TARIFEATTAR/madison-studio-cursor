import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type TaskStatus = "pending" | "in_progress" | "review" | "blocked" | "completed" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type DueDateType = "flexible" | "firm" | "blocker";

export interface ProductTask {
  id: string;
  organization_id: string;
  product_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string | null;
  created_by: string | null;
  due_date: string | null;
  due_date_type: DueDateType;
  stage_id: string | null;
  section: string | null;
  tags: string[];
  context_notes: string | null;
  completed_at: string | null;
  completed_by: string | null;
  sort_order: number;
  parent_task_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  assignee?: {
    id: string;
    full_name: string | null;
    email: string | null;
  };
  creator?: {
    id: string;
    full_name: string | null;
  };
}

export interface TaskComment {
  id: string;
  task_id: string;
  content: string;
  mentions: string[];
  author_id: string;
  created_at: string;
  updated_at: string;
  author?: {
    full_name: string | null;
    email: string | null;
  };
}

export interface TeamMemberWorkload {
  user_id: string;
  full_name: string | null;
  email: string | null;
  team_role: string;
  pending_tasks: number;
  in_progress_tasks: number;
  overdue_tasks: number;
}

export interface SuggestedAssignee {
  user_id: string;
  full_name: string | null;
  team_role: string;
  relevance_score: number;
  current_workload: number;
}

export interface CreateTaskInput {
  product_id?: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  assignee_id?: string;
  due_date?: string;
  due_date_type?: DueDateType;
  section?: string;
  tags?: string[];
  context_notes?: string;
  parent_task_id?: string;
}

export interface UpdateTaskInput {
  id: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: string | null;
  due_date?: string | null;
  due_date_type?: DueDateType;
  section?: string;
  tags?: string[];
  context_notes?: string;
  sort_order?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

export const TASK_STATUS_OPTIONS: { value: TaskStatus; label: string; color: string; icon: string }[] = [
  { value: "pending", label: "Pending", color: "bg-gray-100 text-gray-800", icon: "Circle" },
  { value: "in_progress", label: "In Progress", color: "bg-blue-100 text-blue-800", icon: "PlayCircle" },
  { value: "review", label: "In Review", color: "bg-purple-100 text-purple-800", icon: "Eye" },
  { value: "blocked", label: "Blocked", color: "bg-red-100 text-red-800", icon: "Ban" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-800", icon: "CheckCircle" },
  { value: "cancelled", label: "Cancelled", color: "bg-gray-100 text-gray-500", icon: "XCircle" },
];

export const TASK_PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "bg-gray-100 text-gray-600" },
  { value: "medium", label: "Medium", color: "bg-blue-100 text-blue-700" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-700" },
  { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-700" },
];

export const DUE_DATE_TYPE_OPTIONS: { value: DueDateType; label: string; description: string }[] = [
  { value: "flexible", label: "Flexible", description: "Nice to have by this date" },
  { value: "firm", label: "Firm", description: "Should be done by this date" },
  { value: "blocker", label: "Blocker", description: "Must be done - blocks other work" },
];

export const TASK_SECTIONS = [
  { value: "info", label: "Product Info" },
  { value: "media", label: "Media" },
  { value: "formulation", label: "Formulation" },
  { value: "ingredients", label: "Ingredients" },
  { value: "compliance", label: "Compliance" },
  { value: "sds", label: "SDS" },
  { value: "packaging", label: "Packaging" },
  { value: "marketing", label: "Marketing" },
  { value: "other", label: "Other" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Hook to manage tasks for a specific product
 */
export function useProductTasks(productId: string | null, organizationId: string | null) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  const queryKey = ["product-tasks", productId, organizationId];

  // Fetch tasks for product
  const {
    data: tasks = [],
    isLoading,
    error,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!organizationId) return [];

      // First, fetch tasks
      let query = supabase
        .from("product_tasks")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });

      if (productId) {
        query = query.eq("product_id", productId);
      }

      const { data: tasksData, error: tasksError } = await query;

      if (tasksError) {
        if (tasksError.code === "42P01" || tasksError.code === "PGRST116") {
          return []; // Table doesn't exist yet
        }
        throw tasksError;
      }

      if (!tasksData || tasksData.length === 0) {
        return [];
      }

      // Get team member profiles to enrich tasks with assignee info
      const { data: teamMembers, error: teamError } = await supabase.rpc(
        "get_team_member_profiles",
        { _org_id: organizationId }
      );

      if (teamError) {
        console.error("Error fetching team members:", teamError);
        // Continue without team member data
        return tasksData as ProductTask[];
      }

      // Create a map of user_id -> profile for quick lookup
      const profileMap = new Map(
        (teamMembers || []).map((member: any) => [
          member.user_id,
          { id: member.user_id, full_name: member.full_name, email: member.email }
        ])
      );

      // Enrich tasks with assignee and creator info
      const enrichedTasks = tasksData.map((task: any) => ({
        ...task,
        assignee: task.assignee_id ? profileMap.get(task.assignee_id) : undefined,
        creator: task.created_by ? profileMap.get(task.created_by) : undefined,
      }));

      return enrichedTasks as ProductTask[];
    },
    enabled: !!organizationId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Create task
  const createTask = useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      if (!organizationId || !user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("product_tasks")
        .insert({
          organization_id: organizationId,
          product_id: input.product_id || productId,
          title: input.title,
          description: input.description,
          priority: input.priority || "medium",
          assignee_id: input.assignee_id,
          due_date: input.due_date,
          due_date_type: input.due_date_type || "flexible",
          section: input.section,
          tags: input.tags || [],
          context_notes: input.context_notes,
          parent_task_id: input.parent_task_id,
          created_by: user.id,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Task created",
        description: "The task has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create task: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Update task
  const updateTask = useMutation({
    mutationFn: async (input: UpdateTaskInput) => {
      const { id, ...updates } = input;

      // Handle status change to completed
      if (updates.status === "completed" && user?.id) {
        (updates as any).completed_at = new Date().toISOString();
        (updates as any).completed_by = user.id;
      }

      const { data, error } = await supabase
        .from("product_tasks")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Task updated",
        description: "The task has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update task: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Delete task
  const deleteTask = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from("product_tasks")
        .delete()
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Task deleted",
        description: "The task has been deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete task: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Change task status
  const changeStatus = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: TaskStatus }) => {
      const updates: any = { status };

      if (status === "completed" && user?.id) {
        updates.completed_at = new Date().toISOString();
        updates.completed_by = user.id;
      } else if (status !== "completed") {
        updates.completed_at = null;
        updates.completed_by = null;
      }

      const { data, error } = await supabase
        .from("product_tasks")
        .update(updates)
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey });
      const statusLabel = TASK_STATUS_OPTIONS.find(s => s.value === variables.status)?.label;
      toast({
        title: "Status updated",
        description: `Task marked as ${statusLabel}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update status: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Filter helpers
  const pendingTasks = tasks.filter(t => t.status === "pending");
  const inProgressTasks = tasks.filter(t => t.status === "in_progress");
  const completedTasks = tasks.filter(t => t.status === "completed");
  const overdueTasks = tasks.filter(t => 
    t.due_date && 
    new Date(t.due_date) < new Date() && 
    !["completed", "cancelled"].includes(t.status)
  );

  return {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    changeStatus,
    // Filtered lists
    pendingTasks,
    inProgressTasks,
    completedTasks,
    overdueTasks,
  };
}

/**
 * Hook to get team workload for smart assignment
 */
export function useTeamWorkload(organizationId: string | null) {
  return useQuery({
    queryKey: ["team-workload", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .rpc("get_team_workload", { _org_id: organizationId });

      if (error) {
        console.warn("Team workload function not available:", error);
        return [];
      }

      return (data || []) as TeamMemberWorkload[];
    },
    enabled: !!organizationId,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });
}

/**
 * Hook to get suggested assignees for a task
 */
export function useSuggestedAssignees(organizationId: string | null, section: string | null) {
  return useQuery({
    queryKey: ["suggested-assignees", organizationId, section],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .rpc("get_suggested_assignees", { 
          _org_id: organizationId, 
          _section: section || "other" 
        });

      if (error) {
        console.warn("Suggested assignees function not available:", error);
        return [];
      }

      return (data || []) as SuggestedAssignee[];
    },
    enabled: !!organizationId,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });
}

/**
 * Hook to manage task comments
 */
export function useTaskComments(taskId: string | null) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  const queryKey = ["task-comments", taskId];

  const { data: comments = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!taskId) return [];

      const { data, error } = await supabase
        .from("task_comments")
        .select(`
          *,
          author:profiles!task_comments_author_id_fkey(full_name, email)
        `)
        .eq("task_id", taskId)
        .order("created_at", { ascending: true });

      if (error) {
        if (error.code === "42P01") return [];
        throw error;
      }

      return (data || []) as TaskComment[];
    },
    enabled: !!taskId,
    staleTime: 30 * 1000,
    retry: 1,
  });

  const addComment = useMutation({
    mutationFn: async (content: string) => {
      if (!taskId || !user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("task_comments")
        .insert({
          task_id: taskId,
          content,
          author_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Comment added",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add comment: " + error.message,
        variant: "destructive",
      });
    },
  });

  return {
    comments,
    isLoading,
    addComment,
  };
}
