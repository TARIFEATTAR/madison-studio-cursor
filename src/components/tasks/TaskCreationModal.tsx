import React, { useState, useEffect } from "react";
import {
  Calendar,
  User,
  Flag,
  Tag,
  FileText,
  Loader2,
  Sparkles,
  Clock,
  AlertCircle,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  useProductTasks,
  useSuggestedAssignees,
  TASK_PRIORITY_OPTIONS,
  DUE_DATE_TYPE_OPTIONS,
  TASK_SECTIONS,
  type TaskPriority,
  type DueDateType,
  type CreateTaskInput,
} from "@/hooks/useProductTasks";
import { useTeamMembers } from "@/hooks/useTeamMembers";

interface TaskCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  organizationId: string;
  defaultSection?: string;
}

export function TaskCreationModal({
  open,
  onOpenChange,
  productId,
  organizationId,
  defaultSection,
}: TaskCreationModalProps) {
  const { createTask } = useProductTasks(productId, organizationId);
  const { members } = useTeamMembers(organizationId);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [dueDateType, setDueDateType] = useState<DueDateType>("flexible");
  const [section, setSection] = useState(defaultSection || "");
  const [contextNotes, setContextNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  
  // Smart suggestions
  const { data: suggestedAssignees = [] } = useSuggestedAssignees(
    organizationId, 
    section || null
  );

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
      setPriority("medium");
      setAssigneeId(null);
      setDueDate(undefined);
      setDueDateType("flexible");
      setSection(defaultSection || "");
      setContextNotes("");
      setTags([]);
      setTagInput("");
    }
  }, [open, defaultSection]);

  // Handle tag input
  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    const input: CreateTaskInput = {
      product_id: productId,
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      assignee_id: assigneeId || undefined,
      due_date: dueDate?.toISOString(),
      due_date_type: dueDateType,
      section: section || undefined,
      tags: tags.length > 0 ? tags : undefined,
      context_notes: contextNotes.trim() || undefined,
    };

    await createTask.mutateAsync(input);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Create Task
          </DialogTitle>
          <DialogDescription>
            Add a new task for this product
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Finalize fragrance formula"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What needs to be done?"
              rows={3}
            />
          </div>

          {/* Priority and Section row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn("text-xs", opt.color)}>
                          {opt.label}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Section</Label>
              <Select value={section} onValueChange={setSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {TASK_SECTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Assignee
            </Label>
            
            {/* Smart suggestions */}
            {suggestedAssignees.length > 0 && !assigneeId && (
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Suggested:
                </span>
                {suggestedAssignees.slice(0, 3).map((s) => (
                  <Button
                    key={s.user_id}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setAssigneeId(s.user_id)}
                  >
                    {s.full_name || "User"}
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {s.team_role}
                    </Badge>
                  </Button>
                ))}
              </div>
            )}
            
            <Select 
              value={assigneeId || ""} 
              onValueChange={(v) => setAssigneeId(v || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Unassigned</SelectItem>
                {members?.map((member) => (
                  <SelectItem key={member.user_id} value={member.user_id}>
                    {member.profiles?.full_name || member.profiles?.email || "User"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Due Date
            </Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <Select value={dueDateType} onValueChange={(v) => setDueDateType(v as DueDateType)}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DUE_DATE_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        {opt.value === "blocker" && <AlertCircle className="w-3 h-3 text-red-500" />}
                        {opt.value === "firm" && <Clock className="w-3 h-3 text-orange-500" />}
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {dueDateType !== "flexible" && (
              <p className="text-xs text-muted-foreground">
                {DUE_DATE_TYPE_OPTIONS.find(o => o.value === dueDateType)?.description}
              </p>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags
            </Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Context Notes */}
          <div className="space-y-2">
            <Label htmlFor="context">Context Notes</Label>
            <Textarea
              id="context"
              value={contextNotes}
              onChange={(e) => setContextNotes(e.target.value)}
              placeholder="Any additional context or links..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || createTask.isPending}>
              {createTask.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Task"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
