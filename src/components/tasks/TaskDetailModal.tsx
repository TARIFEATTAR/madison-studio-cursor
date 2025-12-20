import React, { useState } from "react";
import {
  Calendar,
  User,
  Flag,
  Tag,
  Clock,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  Trash2,
  Edit2,
  Send,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow, isPast } from "date-fns";
import {
  useProductTasks,
  useTaskComments,
  type ProductTask,
  type TaskStatus,
  TASK_STATUS_OPTIONS,
  TASK_PRIORITY_OPTIONS,
} from "@/hooks/useProductTasks";

interface TaskDetailModalProps {
  task: ProductTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onDelete: (taskId: string) => void;
}

export function TaskDetailModal({
  task,
  open,
  onOpenChange,
  onStatusChange,
  onDelete,
}: TaskDetailModalProps) {
  const [newComment, setNewComment] = useState("");
  const { comments, addComment } = useTaskComments(task?.id || null);

  if (!task) return null;

  const statusConfig = TASK_STATUS_OPTIONS.find(s => s.value === task.status);
  const priorityConfig = TASK_PRIORITY_OPTIONS.find(p => p.value === task.priority);
  
  const dueDate = task.due_date ? new Date(task.due_date) : null;
  const isOverdue = dueDate && isPast(dueDate) && !["completed", "cancelled"].includes(task.status);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await addComment.mutateAsync(newComment);
    setNewComment("");
  };

  const handleStatusChange = (status: TaskStatus) => {
    onStatusChange(task.id, status);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="p-6 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-xl font-serif mb-2">
                  {task.title}
                </DialogTitle>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Status dropdown */}
                  <Select value={task.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-auto h-7">
                      <Badge variant="outline" className={cn("text-xs", statusConfig?.color)}>
                        {statusConfig?.label}
                      </Badge>
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <Badge variant="outline" className={cn("text-xs", opt.color)}>
                            {opt.label}
                          </Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {priorityConfig && (
                    <Badge variant="outline" className={cn("text-xs", priorityConfig.color)}>
                      <Flag className="w-3 h-3 mr-1" />
                      {priorityConfig.label}
                    </Badge>
                  )}

                  {task.section && (
                    <Badge variant="secondary" className="text-xs capitalize">
                      {task.section}
                    </Badge>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this task?")) {
                    onDelete(task.id);
                    onOpenChange(false);
                  }
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          <Separator />

          {/* Content */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {/* Description */}
              {task.description && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="text-foreground whitespace-pre-wrap">
                    {task.description}
                  </p>
                </div>
              )}

              {/* Meta info grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Due Date */}
                <div className="space-y-1">
                  <Label className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Due Date
                  </Label>
                  {dueDate ? (
                    <div className={cn(
                      "flex items-center gap-2",
                      isOverdue && "text-red-600"
                    )}>
                      {isOverdue && <AlertCircle className="w-4 h-4" />}
                      <span>{format(dueDate, "PPP")}</span>
                      {task.due_date_type === "blocker" && (
                        <Badge variant="destructive" className="text-xs">
                          Blocker
                        </Badge>
                      )}
                      {task.due_date_type === "firm" && (
                        <Badge variant="outline" className="text-xs border-orange-300 text-orange-600">
                          Firm
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">No due date</span>
                  )}
                </div>

                {/* Assignee */}
                <div className="space-y-1">
                  <Label className="text-muted-foreground flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Assignee
                  </Label>
                  {task.assignee ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {getInitials(task.assignee.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{task.assignee.full_name || task.assignee.email}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                  )}
                </div>

                {/* Created */}
                <div className="space-y-1">
                  <Label className="text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Created
                  </Label>
                  <span>
                    {format(new Date(task.created_at), "PPP")}
                    {task.creator && (
                      <span className="text-muted-foreground">
                        {" "}by {task.creator.full_name}
                      </span>
                    )}
                  </span>
                </div>

                {/* Completed */}
                {task.completed_at && (
                  <div className="space-y-1">
                    <Label className="text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Completed
                    </Label>
                    <span>{format(new Date(task.completed_at), "PPP")}</span>
                  </div>
                )}
              </div>

              {/* Context Notes */}
              {task.context_notes && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Context Notes</Label>
                  <div className="p-3 rounded-lg bg-muted/50 text-sm">
                    {task.context_notes}
                  </div>
                </div>
              )}

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Tags
                  </Label>
                  <div className="flex flex-wrap gap-1">
                    {task.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Comments Section */}
              <div className="space-y-4">
                <Label className="text-muted-foreground flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  Comments ({comments.length})
                </Label>

                {/* Comment list */}
                {comments.length > 0 && (
                  <div className="space-y-3">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className="text-xs">
                            {getInitials(comment.author?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {comment.author?.full_name || comment.author?.email || "User"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm text-foreground whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add comment */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleAddComment();
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || addComment.isPending}
                  >
                    {addComment.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
