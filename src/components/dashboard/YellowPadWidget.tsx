import React, { useState, useEffect, useCallback } from 'react';
import { Pencil, Save, Trash2, Plus, GripVertical, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';

interface Note {
    id: string;
    content: string;
    timestamp: number;
}

interface OrganizationSettings {
    googleMeetLinks?: Record<string, string>;
    yellowPadNotes?: Note[];
    [key: string]: unknown;
}

export function YellowPadWidget() {
    const { organizationId } = useOrganization();
    const { toast } = useToast();
    const [notes, setNotes] = useState<Note[]>([]);
    const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const loadNotes = useCallback(async () => {
        if (!organizationId) {
            setIsLoading(false);
            return;
        }

        try {
            const { data } = await supabase
                .from('organizations')
                .select('settings')
                .eq('id', organizationId)
                .single();

            const settings = data?.settings as unknown as OrganizationSettings | null;
            if (settings?.yellowPadNotes) {
                setNotes(settings.yellowPadNotes);
                if (settings.yellowPadNotes.length > 0) {
                    setActiveNoteId(settings.yellowPadNotes[0].id);
                }
            } else {
                // Initial note
                const initialNote: Note = {
                    id: crypto.randomUUID(),
                    content: "Welcome to your scratchpad.\n\nTake notes here during meetings or for brainstorming. Everything is saved automatically.",
                    timestamp: Date.now()
                };
                setNotes([initialNote]);
                setActiveNoteId(initialNote.id);
            }
        } catch (error) {
            console.error('Error loading notes:', error);
        } finally {
            setIsLoading(false);
        }
    }, [organizationId]);

    useEffect(() => {
        loadNotes();
    }, [loadNotes]);

    const saveNotes = async (updatedNotes: Note[]) => {
        if (!organizationId) return;
        setIsSaving(true);

        try {
            const { data: orgData } = await supabase
                .from('organizations')
                .select('settings')
                .eq('id', organizationId)
                .single();

            const currentSettings = (orgData?.settings && typeof orgData.settings === 'object')
                ? orgData.settings as unknown as OrganizationSettings
                : {};

            const updatedSettings = {
                ...currentSettings,
                yellowPadNotes: updatedNotes,
            };

            await supabase
                .from('organizations')
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .update({ settings: updatedSettings as any })
                .eq('id', organizationId);

            setNotes(updatedNotes);
        } catch (error) {
            console.error('Error saving notes:', error);
            toast({
                title: 'Error',
                description: 'Failed to save notes.',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleNoteChange = (id: string, content: string) => {
        const updated = notes.map(n => n.id === id ? { ...n, content, timestamp: Date.now() } : n);
        setNotes(updated);
        // Debounce save or save immediately? Let's save on blur or periodically.
    };

    const addNote = () => {
        const newNote: Note = {
            id: crypto.randomUUID(),
            content: "",
            timestamp: Date.now()
        };
        const updated = [newNote, ...notes];
        saveNotes(updated);
        setActiveNoteId(newNote.id);
    };

    const deleteNote = (id: string) => {
        const updated = notes.filter(n => n.id !== id);
        saveNotes(updated);
        if (activeNoteId === id) {
            setActiveNoteId(updated.length > 0 ? updated[0].id : null);
        }
    };

    const activeNote = notes.find(n => n.id === activeNoteId);

    return (
        <div className="flex flex-col h-full bg-[#FEF9E7] shadow-inner relative overflow-hidden group/pad">
            {/* Legal Pad Aesthetic Elements */}
            <div className="absolute top-0 left-8 md:left-12 bottom-0 w-[1px] bg-red-400 opacity-20 z-10" />
            <div className="absolute top-0 left-9 md:left-13 bottom-0 w-[1px] bg-red-400 opacity-5 z-10" />

            {/* Background Lines - Adjusted for perfect alignment with text */}
            <div className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(#A9CCE3 1px, transparent 1px)',
                    backgroundSize: '100% 2rem', // Matches line-height
                    backgroundPosition: '0 3.5rem', // Starting position
                    opacity: 0.15
                }}
            />

            {/* Header / Binding */}
            <div className="h-10 md:h-14 bg-[#1C150D] flex items-center justify-between px-4 md:px-6 text-white shadow-md shrink-0 z-20 border-b border-black/40">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <Pencil className="w-3 h-3 md:w-4 md:h-4 text-[#B8956A]" />
                        <span className="text-[10px] md:text-sm font-serif italic tracking-wider text-white">Madison Scratchpad</span>
                    </div>
                    <span className="text-[7px] md:text-[8px] opacity-40 uppercase tracking-[0.2em] ml-5 md:ml-6 text-white/60 hidden xs:block">Architectural Stationery</span>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                    {isSaving && <div className="text-[8px] md:text-[9px] animate-pulse opacity-40 font-mono italic">Writing...</div>}
                    <button
                        onClick={addNote}
                        className="p-1 px-2 md:px-3 bg-white/5 hover:bg-white/10 rounded-md transition-colors border border-white/10 flex items-center gap-1 md:gap-2 shadow-sm"
                        title="New Page"
                    >
                        <Plus className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest hidden sm:inline">Add Page</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 min-h-0 relative z-20">
                {/* Sidebar (List of pages) - Left side on Desktop */}
                <div className="hidden md:flex w-16 md:w-24 border-r border-[#E5DFD1] flex flex-col bg-white/10 backdrop-blur-[2px] overflow-y-auto no-scrollbar py-4 px-1 gap-2">
                    {notes.map((n, i) => (
                        <button
                            key={n.id}
                            onClick={() => setActiveNoteId(n.id)}
                            className={cn(
                                "w-full aspect-square rounded-lg flex items-center justify-center text-[10px] md:text-[12px] font-serif border-2 transition-all relative overflow-hidden group/page",
                                activeNoteId === n.id
                                    ? "bg-[#FEF9E7] border-[#1C150D] shadow-md -translate-y-[1px]"
                                    : "bg-white/40 border-transparent hover:border-[#1C150D]/30"
                            )}
                        >
                            <div className="absolute top-0 right-0 p-0.5 opacity-0 group-hover/page:opacity-100 transition-opacity"
                                onClick={(e) => { e.stopPropagation(); deleteNote(n.id); }}>
                                <X className="w-2 h-2 text-red-500/60" />
                            </div>
                            <span className="opacity-60">{i + 1}</span>
                        </button>
                    ))}
                </div>

                {/* Editor Area */}
                <div className="flex-1 p-0 pl-10 md:pl-14 relative overflow-hidden">
                    <textarea
                        value={activeNote?.content || ""}
                        onChange={(e) => handleNoteChange(activeNoteId!, e.target.value)}
                        onBlur={() => saveNotes(notes)}
                        placeholder="Start writing..."
                        className="w-full h-full bg-transparent border-none focus:outline-none focus:ring-0 resize-none font-serif text-[15px] md:text-xl text-[#2F2A26] placeholder:text-[#A9CCE3]/50 p-4 pt-[1.2rem] md:pt-[1.5rem]"
                        style={{
                            fontFamily: '"Cormorant Garamond", serif',
                            lineHeight: '2rem',
                            outline: 'none'
                        }}
                    />
                </div>
            </div>

            {/* Mobile Page Navigation (Bottom Bar) */}
            <div className="flex md:hidden h-12 bg-white/50 backdrop-blur-md border-t border-[#E5DFD1] items-center px-4 gap-2 overflow-x-auto no-scrollbar z-30 shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
                {notes.map((n, i) => (
                    <button
                        key={n.id}
                        onClick={() => setActiveNoteId(n.id)}
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

            {/* Footer / Info */}
            <div className="h-6 px-4 bg-black/5 flex items-center justify-between text-[9px] text-[#8D6E63]/60 uppercase tracking-widest shrink-0 z-20">
                <span>Architectural Stationery No. 42</span>
                <span>{activeNote ? new Date(activeNote.timestamp).toLocaleDateString() : '--'}</span>
            </div>
        </div>
    );
}

export default YellowPadWidget;
