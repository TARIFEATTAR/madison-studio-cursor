import React, { useState, useEffect, useCallback } from 'react';
import { Pencil, Plus, X, Bold, Italic, List, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';

// --- CSS for Animations & Editor Styling ---
const styles = `
  @keyframes pageFlip {
    0% { transform: rotateY(0deg); opacity: 1; transform-origin: left center; }
    50% { transform: rotateY(-90deg); opacity: 0.5; transform-origin: left center; }
    100% { transform: rotateY(0deg); opacity: 1; transform-origin: left center; }
  }
  .animate-page-flip {
    animation: pageFlip 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  /* Tiptap Custom Styles */
  .ProseMirror {
    outline: none !important;
    font-family: "Cormorant Garamond", serif;
    font-size: 1.25rem; /* 20px */
    line-height: 2rem; /* Matches grid lines */
    color: #2F2A26;
    min-height: 100%;
    padding-top: 0.2rem; /* Align first line */
  }
  
  .ProseMirror ul {
    list-style-type: disc;
    padding-left: 1.5rem;
    margin: 0;
  }
  
  .ProseMirror ol {
    list-style-type: decimal;
    padding-left: 1.5rem;
    margin: 0;
  }

  .ProseMirror p.is-editor-empty:first-child::before {
    color: #A9CCE3;
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
    opacity: 0.5;
  }

  /* Task List Styles - FIXED */
  ul[data-type="taskList"] {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  li[data-type="taskItem"] {
    display: flex;
    align-items: center; /* Align checkbox and text baseline */
    margin-bottom: 0;
    min-height: 2rem; /* Matches line height */
  }
  
  /* The label wrapper for the checkbox */
  li[data-type="taskItem"] label {
    margin-right: 1rem;
    height: 2rem;
    display: flex;
    align-items: center; 
    user-select: none;
    cursor: pointer;
    flex-shrink: 0;
  }
  
  li[data-type="taskItem"] div {
    flex: 1 1 auto;
    margin: 0 !important;
  }

  /* Clear paragraph margins inside task items to prevent offset */
  li[data-type="taskItem"] p {
    margin: 0 !important;
  }

  /* The actual checkbox input - Styled as [ ] */
  li[data-type="taskItem"] input[type="checkbox"] {
    appearance: none;
    -webkit-appearance: none;
    background-color: transparent;
    margin: 0;
    cursor: pointer;
    width: 1.15rem;
    height: 1.15rem;
    border: 2px solid #8D6E63; /* Thicker for architectural feel */
    border-radius: 2px; /* Sharper corners like [ ] */
    display: grid;
    place-content: center;
    transition: all 0.2s;
    position: relative;
  }

  /* Hover state */
  li[data-type="taskItem"] input[type="checkbox"]:hover {
    border-color: #1C150D;
    background-color: rgba(184, 149, 106, 0.05);
  }

  /* Checkmark styles */
  li[data-type="taskItem"] input[type="checkbox"]::before {
    content: "";
    width: 0.7em;
    height: 0.7em;
    transform: scale(0);
    transition: 120ms transform ease-in-out;
    background-color: #1C150D;
    transform-origin: center;
    clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
  }

  li[data-type="taskItem"] input[type="checkbox"]:checked::before {
    transform: scale(1);
  }

  li[data-type="taskItem"] input[type="checkbox"]:checked {
    border-color: #1C150D;
    background-color: transparent;
  }

  /* Strikethrough for checked items */
  li[data-type="taskItem"][data-checked="true"] > div {
    text-decoration: line-through;
    opacity: 0.6;
    color: #8D6E63;
  }
  
  /* Bullet list adjustments for consistent sizing */
  .ProseMirror li p {
    margin: 0;
  }
`;

interface Note {
    id: string;
    content: string;
    timestamp: number;
}

interface OrganizationSettings {
    yellowPadNotes?: Note[];
    [key: string]: unknown;
}

// Toolbar Component
const EditorToolbar = ({ editor }: { editor: any }) => {
    if (!editor) return null;

    return (
        <div className="flex items-center gap-1 md:gap-2 mr-4 border-r border-white/20 pr-4">
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn(
                    "p-1.5 rounded hover:bg-white/10 text-white/80 transition-colors",
                    editor.isActive('bold') && "bg-white/20 text-white"
                )}
                title="Bold"
            >
                <Bold className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn(
                    "p-1.5 rounded hover:bg-white/10 text-white/80 transition-colors",
                    editor.isActive('italic') && "bg-white/20 text-white"
                )}
                title="Italic"
            >
                <Italic className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
            <div className="w-[1px] h-4 bg-white/20 mx-1" />
            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn(
                    "p-1.5 rounded hover:bg-white/10 text-white/80 transition-colors",
                    editor.isActive('bulletList') && "bg-white/20 text-white"
                )}
                title="Bullet List"
            >
                <List className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleTaskList().run()}
                className={cn(
                    "p-1.5 rounded hover:bg-white/10 text-white/80 transition-colors",
                    editor.isActive('taskList') && "bg-white/20 text-white"
                )}
                title="Task List"
            >
                <CheckSquare className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
        </div>
    );
};

export function YellowPadWidget() {
    const { organizationId } = useOrganization();
    const { toast } = useToast();
    const [notes, setNotes] = useState<Note[]>([]);
    const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isFlipping, setIsFlipping] = useState(false);
    const [localValue, setLocalValue] = useState('');

    const loadNotes = useCallback(async () => {
        if (!organizationId) return;

        try {
            const { data } = await supabase
                .from('organizations')
                .select('settings')
                .eq('id', organizationId)
                .single();

            const settings = data?.settings as unknown as OrganizationSettings | null;
            if (settings?.yellowPadNotes && settings.yellowPadNotes.length > 0) {
                setNotes(settings.yellowPadNotes);
                setActiveNoteId(settings.yellowPadNotes[0].id);
                setLocalValue(settings.yellowPadNotes[0].content);
            } else {
                // Initial note with HTML content for better demo
                const initialNote: Note = {
                    id: crypto.randomUUID(),
                    content: `
                        <p>Welcome to your scratchpad.</p>
                        <p></p>
                        <ul data-type="taskList">
                          <li data-type="taskItem" data-checked="false"><div>Take notes here during meetings</div></li>
                          <li data-type="taskItem" data-checked="true"><div>Brainstorm new ideas</div></li>
                          <li data-type="taskItem" data-checked="false"><div>Everything saves automatically</div></li>
                        </ul>
                    `,
                    timestamp: Date.now()
                };
                setNotes([initialNote]);
                setActiveNoteId(initialNote.id);
                setLocalValue(initialNote.content);
            }
        } catch (error) {
            console.error('Error loading notes:', error);
        }
    }, [organizationId]);

    useEffect(() => {
        loadNotes();
    }, [loadNotes]);

    const activeNote = notes.find(n => n.id === activeNoteId);

    // TipTap Editor Setup
    const editor = useEditor({
        extensions: [
            StarterKit,
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Placeholder.configure({
                placeholder: 'Start writing...',
            }),
        ],
        content: '', // Initial empty, will be set via useEffect
        editorProps: {
            attributes: {
                class: 'h-full focus:outline-none',
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            setLocalValue(html);
            // Debounced save could go here, but we'll use a timer approach or handleNoteChange logic
            if (activeNoteId) {
                handleNoteChange(activeNoteId, html);
            }
        },
    });

    // Sync editor content when active note or notes change (but avoid loop)
    useEffect(() => {
        if (editor && activeNote && activeNote.content !== editor.getHTML()) {
            // Only update if content is significantly different to prevent cursor jumps
            // A simple comparison might miss some edge cases but works for page switching

            // Check if we are switching pages (content mismatch implies page switch or remote update)
            // For smoother typing, we trust localValue/editor state, but on switch we force update

            // We use a separate state 'isFlipping' to detect intentional switches
            editor.commands.setContent(activeNote.content);
        }
    }, [activeNoteId, editor]); // strictly depend on ID switch or initial load

    const saveNotes = async (updatedNotes: Note[]) => {
        if (!organizationId) return;
        setIsSaving(true);

        try {
            const { data: orgData } = await supabase
                .from('organizations')
                .select('settings')
                .eq('id', organizationId)
                .single();

            const currentSettings = (orgData?.settings as unknown as OrganizationSettings) || {};
            const updatedSettings = {
                ...currentSettings,
                yellowPadNotes: updatedNotes,
            };

            await supabase
                .from('organizations')
                .update({ settings: updatedSettings as any })
                .eq('id', organizationId);

            setNotes(updatedNotes);
        } catch (error) {
            console.error('Error saving notes:', error);
            toast({ title: 'Error', description: 'Failed to save notes.', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleNoteChange = useCallback((id: string, content: string) => {
        setNotes(prev => {
            // Optimistic update
            const updated = prev.map(n => n.id === id ? { ...n, content, timestamp: Date.now() } : n);

            // Debounce the actual save to server would be ideal here
            // For now, we'll just update state and let a periodic saver or blur handle it?
            // Actually, let's just trigger save debounced. 
            // Since we don't have a ref backend for debounce here easily without custom hooks, 
            // let's rely on "save on stop typing" or just call saveNotes every few seconds if changed.
            // For this implementation, we will update local state immediately and verify save.

            return updated;
        });
    }, []);

    // Effect to auto-save notes to server after delay
    useEffect(() => {
        const timer = setTimeout(() => {
            if (notes.length > 0) {
                saveNotes(notes);
            }
        }, 2000); // 2 second autosave debounce

        return () => clearTimeout(timer);
    }, [notes]);

    const addNote = () => {
        const newNote: Note = {
            id: crypto.randomUUID(),
            content: "",
            timestamp: Date.now()
        };
        const updated = [newNote, ...notes];
        setNotes(updated);
        saveNotes(updated);
        handleSwitchPage(newNote.id);
    };

    const deleteNote = (id: string) => {
        const updated = notes.filter(n => n.id !== id);
        setNotes(updated);
        saveNotes(updated);
        if (activeNoteId === id) {
            handleSwitchPage(updated.length > 0 ? updated[0].id : null);
        }
    };

    const handleSwitchPage = (id: string | null) => {
        if (id === activeNoteId) return;
        setIsFlipping(true);
        setTimeout(() => {
            setActiveNoteId(id);
            setIsFlipping(false);
        }, 300); // Wait for half flip to switch content
    };

    return (
        <div className="flex flex-col h-full bg-[#FEF9E7] shadow-inner relative overflow-hidden group/pad perspective-[1000px]">
            <style>{styles}</style>

            {/* Legend/Legal Lines (Background) */}
            <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${isFlipping ? 'opacity-50' : 'opacity-100'}`}>
                <div className="absolute top-0 left-8 md:left-12 bottom-0 w-[1px] bg-red-400 opacity-20 z-10" />
                <div className="absolute top-0 left-9 md:left-13 bottom-0 w-[1px] bg-red-400 opacity-5 z-10" />
                <div className="absolute inset-0"
                    style={{
                        backgroundImage: 'linear-gradient(#A9CCE3 1px, transparent 1px)',
                        backgroundSize: '100% 2rem',
                        backgroundPosition: '0 3.5rem',
                        opacity: 0.15
                    }}
                />
            </div>

            {/* Header / Binding */}
            <div className="h-10 md:h-14 bg-[#1C150D] flex items-center justify-between px-4 md:px-6 text-white shadow-md shrink-0 z-20 border-b border-black/40">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <Pencil className="w-3 h-3 md:w-4 md:h-4 text-[#B8956A]" />
                        <span className="text-[10px] md:text-sm font-serif italic tracking-wider text-white">Madison Scratchpad</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <EditorToolbar editor={editor} />
                    {isSaving && <div className="text-[8px] md:text-[9px] animate-pulse opacity-40 font-mono italic mr-2">Saving...</div>}
                    <button
                        onClick={addNote}
                        className="p-1 px-2 md:px-3 bg-white/5 hover:bg-white/10 rounded-md transition-colors border border-white/10 flex items-center gap-1 md:gap-2 shadow-sm"
                        title="New Page"
                    >
                        <Plus className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 min-h-0 relative z-20">
                {/* Sidebar */}
                <div className="hidden md:flex w-16 md:w-24 border-r border-[#E5DFD1] flex flex-col bg-white/10 backdrop-blur-[2px] overflow-y-auto no-scrollbar py-4 px-1 gap-2 shrink-0">
                    {notes.map((n, i) => (
                        <button
                            key={n.id}
                            onClick={() => handleSwitchPage(n.id)}
                            className={cn(
                                "w-full aspect-square rounded-lg flex items-center justify-center text-[10px] md:text-[12px] font-serif border-2 transition-all relative overflow-hidden group/page",
                                activeNoteId === n.id
                                    ? "bg-[#FEF9E7] border-[#1C150D] shadow-md -translate-y-[1px]"
                                    : "bg-white/40 border-transparent hover:border-[#1C150D]/30"
                            )}
                        >
                            <div className="absolute top-0 right-0 p-0.5 opacity-0 group-hover/page:opacity-100 transition-opacity z-10"
                                onClick={(e) => { e.stopPropagation(); deleteNote(n.id); }}>
                                <X className="w-2 h-2 text-red-500/60" />
                            </div>
                            <span className="opacity-60">{i + 1}</span>
                        </button>
                    ))}
                </div>

                {/* Editor Content Container with Animation */}
                <div className={cn(
                    "flex-1 p-0 pl-10 md:pl-14 relative overflow-y-auto overflow-x-hidden custom-scrollbar bg-[#FEF9E7] transform-gpu",
                    isFlipping && "animate-page-flip"
                )}>
                    {/* The page flip effect needs the background to flip with it */}
                    <div className="min-h-full p-4 pt-[1.2rem] md:pt-[1.5rem]">
                        <EditorContent editor={editor} />
                    </div>
                </div>
            </div>

            {/* Mobile Page Navigation */}
            <div className="flex md:hidden h-12 bg-white/50 backdrop-blur-md border-t border-[#E5DFD1] items-center px-4 gap-2 overflow-x-auto no-scrollbar z-30 shrink-0">
                {notes.map((n, i) => (
                    <button
                        key={n.id}
                        onClick={() => handleSwitchPage(n.id)}
                        className={cn(
                            "h-8 px-4 rounded-full flex items-center justify-center text-[10px] font-bold tracking-widest border transition-all shrink-0 uppercase",
                            activeNoteId === n.id
                                ? "bg-[#1C150D] text-white border-[#1C150D] shadow-sm"
                                : "bg-white/80 text-[#1C150D]/60 border-[#E5DFD1]"
                        )}
                    >
                        Page {i + 1}
                    </button>
                ))}
            </div>

            {/* Footer */}
            <div className="h-6 px-4 bg-black/5 flex items-center justify-between text-[9px] text-[#8D6E63]/60 uppercase tracking-widest shrink-0 z-20">
                <span>Architectural Stationery No. 42</span>
                <span>{activeNote ? new Date(activeNote.timestamp).toLocaleDateString() : '--'}</span>
            </div>
        </div>
    );
}

export default YellowPadWidget;
