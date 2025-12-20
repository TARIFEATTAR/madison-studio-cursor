import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder,
  FolderOpen,
  ChevronRight,
  Plus,
  Inbox,
  Clock,
  Star,
  Sparkles,
  Image,
  Share2,
  Package,
  Mail,
  Palette,
  FileText,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { DAMFolder } from "./types";

const FOLDER_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  folder: Folder,
  inbox: Inbox,
  clock: Clock,
  star: Star,
  sparkles: Sparkles,
  image: Image,
  "file-text": FileText,
  "share-2": Share2,
  package: Package,
  mail: Mail,
  palette: Palette,
  file: FileText,
};

interface FolderSidebarProps {
  folders: DAMFolder[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder: (name: string, parentId?: string) => void;
  onRenameFolder?: (folderId: string, name: string) => void;
  onDeleteFolder?: (folderId: string) => void;
  className?: string;
}

interface FolderItemProps {
  folder: DAMFolder;
  level: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onRename?: (id: string, name: string) => void;
  onDelete?: (id: string) => void;
}

function FolderItem({ folder, level, selectedId, onSelect, onRename, onDelete }: FolderItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  
  const hasChildren = folder.children && folder.children.length > 0;
  const isSelected = selectedId === folder.id;
  
  const IconComponent = FOLDER_ICONS[folder.icon] || Folder;
  const FolderIcon = isExpanded && hasChildren ? FolderOpen : IconComponent;
  
  const handleRename = () => {
    if (newName.trim() && newName !== folder.name && onRename) {
      onRename(folder.id, newName.trim());
    }
    setIsRenaming(false);
  };

  // Smart folder styling
  const isSmartFolder = folder.folder_type === 'smart';
  const isSystemFolder = folder.folder_type === 'system';
  const isInbox = folder.folder_type === 'inbox';

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer transition-colors",
          isSelected 
            ? "bg-primary/10 text-primary" 
            : "hover:bg-muted/50 text-foreground",
          level > 0 && "ml-4"
        )}
        onClick={() => onSelect(folder.id)}
      >
        {/* Expand/Collapse */}
        {hasChildren ? (
          <button
            className="p-0.5 hover:bg-muted rounded"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            <ChevronRight 
              className={cn(
                "w-3.5 h-3.5 transition-transform text-muted-foreground",
                isExpanded && "rotate-90"
              )} 
            />
          </button>
        ) : (
          <div className="w-4" />
        )}

        {/* Icon */}
        <FolderIcon 
          className={cn(
            "w-4 h-4 flex-shrink-0",
            isSmartFolder && "text-primary",
            isInbox && "text-amber-500",
            folder.color && `text-[${folder.color}]`
          )} 
        />

        {/* Name */}
        {isRenaming ? (
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') setIsRenaming(false);
            }}
            className="h-6 py-0 px-1 text-sm"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 text-sm truncate">{folder.name}</span>
        )}

        {/* Smart folder indicator */}
        {isSmartFolder && (
          <Sparkles className="w-3 h-3 text-primary/60" />
        )}

        {/* Asset count badge */}
        {folder.asset_count !== undefined && folder.asset_count > 0 && (
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {folder.asset_count}
          </span>
        )}

        {/* Actions dropdown */}
        {!isSystemFolder && !isSmartFolder && !isInbox && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1 opacity-0 group-hover:opacity-100 hover:bg-muted rounded transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsRenaming(true)}>
                <Pencil className="w-4 h-4 mr-2" />
                Rename
              </DropdownMenuItem>
              {onDelete && (
                <DropdownMenuItem 
                  onClick={() => onDelete(folder.id)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Children */}
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {folder.children?.map((child) => (
              <FolderItem
                key={child.id}
                folder={child}
                level={level + 1}
                selectedId={selectedId}
                onSelect={onSelect}
                onRename={onRename}
                onDelete={onDelete}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FolderSidebar({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  className,
}: FolderSidebarProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // Organize folders by type
  const systemFolders = folders.filter(f => f.folder_type === 'inbox' || f.folder_type === 'system');
  const smartFolders = folders.filter(f => f.folder_type === 'smart');
  const userFolders = folders.filter(f => f.folder_type === 'user' && !f.parent_id);

  // Build tree for user folders
  const buildTree = useCallback((parentId: string | null): DAMFolder[] => {
    return folders
      .filter(f => f.parent_id === parentId && f.folder_type === 'user')
      .map(folder => ({
        ...folder,
        children: buildTree(folder.id),
      }))
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [folders]);

  const userFolderTree = buildTree(null);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName("");
      setCreateDialogOpen(false);
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="font-medium text-sm">Folders</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Folder list */}
      <div className="flex-1 overflow-y-auto py-2 space-y-4">
        {/* All Assets */}
        <div className="px-2">
          <div
            className={cn(
              "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors",
              selectedFolderId === null 
                ? "bg-primary/10 text-primary" 
                : "hover:bg-muted/50"
            )}
            onClick={() => onSelectFolder(null)}
          >
            <Image className="w-4 h-4" />
            <span className="text-sm font-medium">All Assets</span>
          </div>
        </div>

        {/* System & Inbox folders */}
        {systemFolders.length > 0 && (
          <div className="px-2">
            <div className="text-xs font-medium text-muted-foreground px-2 mb-1">
              Quick Access
            </div>
            {systemFolders.map(folder => (
              <FolderItem
                key={folder.id}
                folder={folder}
                level={0}
                selectedId={selectedFolderId}
                onSelect={onSelectFolder}
              />
            ))}
          </div>
        )}

        {/* Smart folders */}
        {smartFolders.length > 0 && (
          <div className="px-2">
            <div className="text-xs font-medium text-muted-foreground px-2 mb-1">
              Smart Folders
            </div>
            {smartFolders.map(folder => (
              <FolderItem
                key={folder.id}
                folder={folder}
                level={0}
                selectedId={selectedFolderId}
                onSelect={onSelectFolder}
              />
            ))}
          </div>
        )}

        {/* User folders */}
        <div className="px-2">
          <div className="text-xs font-medium text-muted-foreground px-2 mb-1">
            My Folders
          </div>
          {userFolderTree.length > 0 ? (
            userFolderTree.map(folder => (
              <FolderItem
                key={folder.id}
                folder={folder}
                level={0}
                selectedId={selectedFolderId}
                onSelect={onSelectFolder}
                onRename={onRenameFolder}
                onDelete={onDeleteFolder}
              />
            ))
          ) : (
            <div className="px-2 py-4 text-center">
              <p className="text-sm text-muted-foreground">No folders yet</p>
              <Button
                variant="link"
                size="sm"
                className="mt-1"
                onClick={() => setCreateDialogOpen(true)}
              >
                Create your first folder
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Create folder dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder();
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
