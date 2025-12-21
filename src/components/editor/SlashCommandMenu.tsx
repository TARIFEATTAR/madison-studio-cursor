/**
 * SlashCommandMenu - Command palette for Madison Editor
 * 
 * Appears when user types "/" providing quick access to:
 * - Madison AI actions
 * - Formatting options
 * 
 * Design principles:
 * - Calm and editorial (not dev-tool like)
 * - Keyboard navigable
 * - Non-blocking
 * - Immediate dismiss on blur/escape
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { 
  Sparkles, 
  ArrowRight, 
  RefreshCw, 
  Mail, 
  Package,
  Instagram,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Scissors,
  Maximize2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MadisonInlineAction } from './madisonAI';

interface SlashCommandMenuProps {
  editor: Editor;
  isOpen: boolean;
  onClose: () => void;
  position: { top: number; left: number };
  onAIAction: (action: MadisonInlineAction) => void;
}

interface CommandItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  category: 'ai' | 'format';
  /** Keyboard shortcut hint */
  shortcut?: string;
}

/**
 * Slash command menu
 * 
 * Behavior:
 * - "/" opens menu
 * - Escape closes menu
 * - Enter triggers selected action
 * - ↑↓ navigate items
 * - Typing filters items
 */
export function SlashCommandMenu({ 
  editor, 
  isOpen, 
  onClose, 
  position,
  onAIAction 
}: SlashCommandMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filter, setFilter] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const isEditable = editor?.isEditable ?? false;

  // Build command list
  const commands: CommandItem[] = [
    // ═══════════════════════════════════════════════════════════════════
    // MADISON AI ACTIONS
    // ═══════════════════════════════════════════════════════════════════
    {
      id: 'refine',
      label: 'Refine',
      description: 'Polish and improve writing',
      icon: <Sparkles className="w-4 h-4 text-primary" />,
      action: () => {
        onAIAction('refine');
        onClose();
      },
      category: 'ai'
    },
    {
      id: 'continue',
      label: 'Continue',
      description: 'Continue writing from here',
      icon: <ArrowRight className="w-4 h-4 text-primary" />,
      action: () => {
        onAIAction('continue');
        onClose();
      },
      category: 'ai'
    },
    {
      id: 'rewrite',
      label: 'Rewrite',
      description: 'Rewrite this section',
      icon: <RefreshCw className="w-4 h-4 text-primary" />,
      action: () => {
        onAIAction('rewrite');
        onClose();
      },
      category: 'ai'
    },
    {
      id: 'shorten',
      label: 'Shorten',
      description: 'Make text more concise',
      icon: <Scissors className="w-4 h-4 text-primary" />,
      action: () => {
        onAIAction('shorten');
        onClose();
      },
      category: 'ai'
    },
    {
      id: 'expand',
      label: 'Expand',
      description: 'Add more detail',
      icon: <Maximize2 className="w-4 h-4 text-primary" />,
      action: () => {
        onAIAction('expand');
        onClose();
      },
      category: 'ai'
    },
    {
      id: 'email',
      label: 'Email',
      description: 'Transform into email format',
      icon: <Mail className="w-4 h-4 text-primary" />,
      action: () => {
        onAIAction('email');
        onClose();
      },
      category: 'ai'
    },
    {
      id: 'product',
      label: 'Product',
      description: 'Transform into product description',
      icon: <Package className="w-4 h-4 text-primary" />,
      action: () => {
        onAIAction('product');
        onClose();
      },
      category: 'ai'
    },
    {
      id: 'instagram',
      label: 'Instagram',
      description: 'Transform for Instagram caption',
      icon: <Instagram className="w-4 h-4 text-primary" />,
      action: () => {
        onAIAction('instagram');
        onClose();
      },
      category: 'ai'
    },

    // ═══════════════════════════════════════════════════════════════════
    // FORMATTING OPTIONS
    // ═══════════════════════════════════════════════════════════════════
    {
      id: 'heading2',
      label: 'Heading 2',
      description: 'Large section heading',
      icon: <Heading2 className="w-4 h-4" />,
      action: () => {
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        onClose();
      },
      category: 'format'
    },
    {
      id: 'heading3',
      label: 'Heading 3',
      description: 'Small section heading',
      icon: <Heading3 className="w-4 h-4" />,
      action: () => {
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        onClose();
      },
      category: 'format'
    },
    {
      id: 'bulletlist',
      label: 'Bullet List',
      description: 'Create a bullet list',
      icon: <List className="w-4 h-4" />,
      action: () => {
        editor.chain().focus().toggleBulletList().run();
        onClose();
      },
      category: 'format'
    },
    {
      id: 'orderedlist',
      label: 'Numbered List',
      description: 'Create a numbered list',
      icon: <ListOrdered className="w-4 h-4" />,
      action: () => {
        editor.chain().focus().toggleOrderedList().run();
        onClose();
      },
      category: 'format'
    },
    {
      id: 'blockquote',
      label: 'Quote',
      description: 'Create a blockquote',
      icon: <Quote className="w-4 h-4" />,
      action: () => {
        editor.chain().focus().toggleBlockquote().run();
        onClose();
      },
      category: 'format'
    },
  ];

  // Filter commands based on typed input
  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(filter.toLowerCase()) ||
    cmd.description.toLowerCase().includes(filter.toLowerCase())
  );

  // Separate by category for grouped display
  const aiCommands = filteredCommands.filter(c => c.category === 'ai');
  const formatCommands = filteredCommands.filter(c => c.category === 'format');

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex(i => 
          i < filteredCommands.length - 1 ? i + 1 : 0
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex(i => 
          i > 0 ? i - 1 : filteredCommands.length - 1
        );
        break;
        
      case 'Enter':
        e.preventDefault();
        e.stopPropagation();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        e.stopPropagation();
        onClose();
        break;

      case 'Tab':
        // Close menu on tab
        e.preventDefault();
        onClose();
        break;
    }
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  // Attach keyboard listener
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown, true);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen, handleKeyDown]);

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [filter]);

  // Reset filter when menu opens
  useEffect(() => {
    if (isOpen) {
      setFilter('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      // Use capture to catch before other handlers
      document.addEventListener('mousedown', handleClickOutside, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [isOpen, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;
    
    const selected = menuRef.current.querySelector('[data-selected="true"]');
    if (selected) {
      selected.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex, isOpen]);

  if (!isOpen) return null;

  // Calculate flat index for selection
  let flatIndex = 0;

  return (
    <div
      ref={menuRef}
      role="listbox"
      aria-label="Commands"
      className={cn(
        "absolute z-50 w-72 max-h-80 overflow-y-auto",
        "bg-card border border-border rounded-lg shadow-level-3",
        // Subtle entrance animation
        "animate-in fade-in-0 slide-in-from-top-2 duration-150"
      )}
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      {/* ═══════════════════════════════════════════════════════════════════
          MADISON AI SECTION
          ═══════════════════════════════════════════════════════════════════ */}
      {aiCommands.length > 0 && (
        <div className="p-1">
          <div className="px-2 py-1.5 text-xs font-medium text-primary/70 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            <span>Madison</span>
          </div>
          {aiCommands.map((cmd) => {
            const currentIndex = flatIndex++;
            const isSelected = selectedIndex === currentIndex;
            
            return (
              <CommandMenuItem
                key={cmd.id}
                item={cmd}
                isSelected={isSelected}
                onClick={() => cmd.action()}
                disabled={!isEditable}
              />
            );
          })}
        </div>
      )}

      {/* Divider */}
      {aiCommands.length > 0 && formatCommands.length > 0 && (
        <div className="border-t border-border" />
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          FORMATTING SECTION
          ═══════════════════════════════════════════════════════════════════ */}
      {formatCommands.length > 0 && (
        <div className="p-1">
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Format
          </div>
          {formatCommands.map((cmd) => {
            const currentIndex = flatIndex++;
            const isSelected = selectedIndex === currentIndex;
            
            return (
              <CommandMenuItem
                key={cmd.id}
                item={cmd}
                isSelected={isSelected}
                onClick={() => cmd.action()}
                disabled={!isEditable}
              />
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {filteredCommands.length === 0 && (
        <div className="p-4 text-center text-sm text-muted-foreground">
          No commands found
        </div>
      )}

      {/* Keyboard hint */}
      <div className="px-3 py-2 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Individual command menu item
 */
function CommandMenuItem({
  item,
  isSelected,
  onClick,
  disabled,
}: {
  item: CommandItem;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      data-selected={isSelected}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-center gap-3 px-2 py-2 rounded-md",
        "text-left text-sm transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        isSelected 
          ? "bg-muted text-foreground" 
          : "hover:bg-muted/50 text-foreground"
      )}
    >
      {/* Icon container */}
      <div className={cn(
        "flex-shrink-0 w-8 h-8 flex items-center justify-center",
        "rounded-md bg-background border border-border",
        isSelected && "border-primary/30"
      )}>
        {item.icon}
      </div>
      
      {/* Label & description */}
      <div className="flex-1 min-w-0">
        <div className="font-medium">{item.label}</div>
        <div className="text-xs text-muted-foreground truncate">
          {item.description}
        </div>
      </div>

      {/* Shortcut hint if available */}
      {item.shortcut && (
        <div className="text-xs text-muted-foreground font-mono">
          {item.shortcut}
        </div>
      )}
    </button>
  );
}

export default SlashCommandMenu;









