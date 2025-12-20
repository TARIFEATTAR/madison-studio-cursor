import React from "react";
import {
  Calendar,
  User,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle,
  PlayCircle,
  Eye,
  Ban,
  XCircle,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns";
import {
  type ProductTask,
  type TaskStatus,
  TASK_STATUS_OPTIONS,
  TASK_PRIORITY_OPTIONS,
} from "@/hooks/useProductTasks";

// Status icons mapping
const STATUS_ICONS: Record<TaskStatus, React.ComponentType<{ className?: string }>> = {
  pending: Circle,
  in_progress: PlayCircle,
  review: Eye,
  blocked: Ban,
  completed: CheckCircle2,
  cancelled: XCircle,
};

interface TaskCardProps {
  task: ProductTask;
  onClick?: () => void;
  onStatusChange?: (status: TaskStatus) => void;
  onDelete?: () => void;
  compact?: boolean;
}

export function TaskCard({
  task,
  onClick,
  onStatusChange,
  onDelete,
  compact = false,
}: TaskCardProps) {
  const statusConfig = TASK_STATUS_OPTIONS.find(s => s.value === task.status);
  const priorityConfig = TASK_PRIORITY_OPTIONS.find(p => p.value === task.priority);
  const StatusIcon = STATUS_ICONS[task.status];
  
  // Calculate due date info
  const dueDate = task.due_date ? new Date(task.due_date) : null;
  const isOverdue = dueDate && isPast(dueDate) && !["completed", "cancelled"].includes(task.status);
  const isDueToday = dueDate && isToday(dueDate);
  const isDueTomorrow = dueDate && isTomorrow(dueDate);
  
  const getDueDateDisplay = () => {
    if (!dueDate) return null;
    if (isOverdue) return `Overdue by ${formatDistanceToNow(dueDate)}`;
    if (isDueToday) return "Due today";
    if (isDueTomorrow) return "Due tomorrow";
    return `Due ${formatDistanceToNow(dueDate, { addSuffix: true })}`;
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 p-2 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors cursor-pointer",
          task.status === "completed" && "opacity-60"
        )}
        onClick={onClick}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onStatusChange) {
              const nextStatus = task.status === "completed" ? "pending" : "completed";
              onStatusChange(nextStatus);
            }
          }}
          className="flex-shrink-0"
        >
          <StatusIcon
            className={cn(
              "w-5 h-5 transition-colors",
              task.status === "completed" ? "text-green-600" : "text-muted-foreground hover:text-primary"
            )}
          />
        </button>
        
        <span className={cn(
          "flex-1 text-sm truncate",
          task.status === "completed" && "line-through text-muted-foreground"
        )}>
          {task.title}
        </span>
        
        {dueDate && (
          <span className={cn(
            "text-xs",
            isOverdue ? "text-red-600" : "text-muted-foreground"
          )}>
            {getDueDateDisplay()}
          </span>
        )}
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Avatar className="w-6 h-6">
              <AvatarFallback className={cn(
                "text-xs",
                task.assignee ? "bg-primary/10" : "bg-muted"
              )}>
                {task.assignee 
                  ? getInitials(task.assignee.full_name)
                  : "?"
                }
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>
            {task.assignee 
              ? `Assigned to ${task.assignee.full_name || task.assignee.email}`
              : "Unassigned"
            }
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        "bg-card border-border hover:border-primary/50 hover:shadow-level-2 transition-all cursor-pointer",
        task.status === "completed" && "opacity-70",
        isOverdue && "border-red-200"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Status checkbox */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onStatusChange) {
                const nextStatus = task.status === "completed" ? "pending" : "completed";
                onStatusChange(nextStatus);
              }
            }}
            className="flex-shrink-0 mt-0.5"
          >
            <StatusIcon
              className={cn(
                "w-5 h-5 transition-colors",
                task.status === "completed" ? "text-green-600" : "text-muted-foreground hover:text-primary"
              )}
            />
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Title and priority */}
            <div className="flex items-start justify-between gap-2">
              <h4 className={cn(
                "font-medium text-foreground",
                task.status === "completed" && "line-through text-muted-foreground"
              )}>
                {task.title}
              </h4>
              
              <div className="flex items-center gap-1">
                {priorityConfig && task.priority !== "medium" && (
                  <Badge variant="outline" className={cn("text-xs", priorityConfig.color)}>
                    {priorityConfig.label}
                  </Badge>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="w-6 h-6">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {TASK_STATUS_OPTIONS.map((status) => (
                      <DropdownMenuItem
                        key={status.value}
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange?.(status.value);
                        }}
                      >
                        <StatusIcon className="w-4 h-4 mr-2" />
                        {status.label}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.();
                      }}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Description */}
            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Meta row */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {/* Due date */}
              {dueDate && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={cn(
                      "flex items-center gap-1",
                      isOverdue && "text-red-600",
                      isDueToday && "text-orange-600",
                      task.due_date_type === "blocker" && "font-medium"
                    )}>
                      {isOverdue ? (
                        <AlertCircle className="w-3 h-3" />
                      ) : (
                        <Calendar className="w-3 h-3" />
                      )}
                      <span>{getDueDateDisplay()}</span>
                      {task.due_date_type === "blocker" && (
                        <Badge variant="destructive" className="text-[10px] px-1 py-0">
                          Blocker
                        </Badge>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {task.due_date_type === "blocker" && "This task blocks other work"}
                    {task.due_date_type === "firm" && "Firm deadline"}
                    {task.due_date_type === "flexible" && "Flexible deadline"}
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Section */}
              {task.section && (
                <Badge variant="secondary" className="text-xs">
                  {task.section}
                </Badge>
              )}

              {/* Assignee */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn(
                    "flex items-center gap-1",
                    !task.assignee && "text-muted-foreground/60"
                  )}>
                    <User className="w-3 h-3" />
                    <span>
                      {task.assignee 
                        ? (task.assignee.full_name || task.assignee.email)
                        : "Unassigned"
                      }
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {task.assignee 
                    ? `Assigned to ${task.assignee.full_name || task.assignee.email}`
                    : "No one assigned yet"
                  }
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {task.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
