import React, { useState, useEffect } from 'react';
import { Video, Plus, Edit2, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";

interface OrganizationSettings {
    googleMeetLinks?: Record<string, string>;
    [key: string]: unknown;
}

interface RetroTVWidgetProps {
    widgetId?: string;
    meetingId?: string; // Optional prop for testing
    meetingUrl?: string; // Optional prop for testing
}

// Extract meeting ID from Google Meet URL
function extractMeetId(url: string): string | null {
    if (!url) return null;
    const match = url.match(/meet\.google\.com\/([a-z-]+)/i);
    return match ? match[1] : null;
}

export function RetroTVWidget({ widgetId = 'google-meet', meetingId: propMeetId, meetingUrl: propMeetUrl }: RetroTVWidgetProps) {
    const { organizationId } = useOrganization();
    const { toast } = useToast();
    const [meetUrl, setMeetUrl] = useState<string>(propMeetUrl || "");
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(!propMeetUrl); // Don't load if props provided

    const loadMeetLink = React.useCallback(async () => {
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
            if (settings?.googleMeetLinks?.[widgetId]) {
                setMeetUrl(settings.googleMeetLinks[widgetId]);
            }
        } catch (error) {
            console.error('Error loading Google Meet link:', error);
        } finally {
            setIsLoading(false);
        }
    }, [organizationId, widgetId]);

    useEffect(() => {
        if (!propMeetUrl) {
            loadMeetLink();
        }
    }, [propMeetUrl, loadMeetLink]);

    const saveMeetLink = async (url: string) => {
        if (!organizationId) return;

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
                googleMeetLinks: {
                    ...(currentSettings.googleMeetLinks || {}),
                    [widgetId]: url,
                },
            };

            await supabase
                .from('organizations')
                .update({ settings: updatedSettings })
                .eq('id', organizationId);

            setMeetUrl(url);
            setIsEditing(false);
            toast({
                title: 'Google Meet link saved',
                description: 'Your meeting link has been updated.',
            });
        } catch (error) {
            console.error('Error saving Google Meet link:', error);
            toast({
                title: 'Error',
                description: 'Failed to save Google Meet link.',
                variant: 'destructive',
            });
        }
    };

    const handleSave = () => {
        if (!meetUrl.trim()) {
            toast({
                title: 'Invalid URL',
                description: 'Please enter a valid Google Meet URL.',
                variant: 'destructive',
            });
            return;
        }

        const meetId = extractMeetId(meetUrl);
        if (!meetId) {
            toast({
                title: 'Invalid Google Meet URL',
                description: 'Please enter a valid Google Meet URL (e.g., https://meet.google.com/abc-defg-hij)',
                variant: 'destructive',
            });
            return;
        }

        saveMeetLink(meetUrl);
    };

    // Use prop ID if available, otherwise extract from URL
    const displayMeetId = propMeetId || extractMeetId(meetUrl) || "CONNECT";
    const hasLink = !!extractMeetId(meetUrl) || !!propMeetUrl;
    const targetUrl = propMeetUrl || meetUrl;

    return (
        <>
            <div className="w-full h-full flex flex-col items-center justify-center p-2 relative group">

                {/* Hover Controls (Edit) - Positioned absolutely outside the TV scale transform */}
                <div className="absolute top-2 right-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsEditing(true);
                        }}
                        title={hasLink ? "Edit meeting link" : "Add meeting link"}
                    >
                        {hasLink ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </Button>
                </div>

                {/* --- TV CABINET CONTAINER --- */}
                {/* Added scale transition on hover */}
                <div className="relative w-full max-w-[400px] aspect-[4/3] bg-[#5D4037] rounded-3xl p-4 md:p-6 shadow-2xl border-b-[6px] border-r-[6px] border-[#3E2723] transition-transform duration-500 hover:scale-[1.02] hover:shadow-2xl hover:rotate-[1deg]">

                    {/* Wood Grain Texture Simulation (CSS Pattern) */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none rounded-3xl"
                        style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 12px)' }}>
                    </div>

                    {/* --- TV FACE --- */}
                    <div className="flex gap-4 h-full bg-[#D7CCC8] rounded-xl p-3 shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)] border-4 border-[#A1887F]">

                        {/* --- THE SCREEN (CRT) --- */}
                        <div className="flex-1 relative bg-[#1a1a1a] rounded-[1.5rem] border-4 md:border-8 border-[#cfd8dc] overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]">

                            {/* Screen Content */}
                            {hasLink ? (
                                /* Active State: "Video Feed" Simulation */
                                <div className="absolute inset-0 bg-[#0a0a0a] overflow-hidden flex flex-col group/screen">
                                    {/* Simulated "Grid" of users */}
                                    <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-1 p-1 opacity-80 transition-opacity group-hover/screen:opacity-100">
                                        <div className="bg-blue-900/40 rounded-sm flex items-center justify-center relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
                                            <div className="absolute bottom-1 left-1 h-1 w-4 bg-white/20 rounded-full" />
                                        </div>
                                        <div className="bg-teal-900/40 rounded-sm flex items-center justify-center relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse delay-75" />
                                            <div className="absolute bottom-1 left-1 h-1 w-4 bg-white/20 rounded-full" />
                                        </div>
                                        <div className="bg-slate-900/40 rounded-sm flex items-center justify-center relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse delay-150" />
                                            <div className="absolute bottom-1 left-1 h-1 w-4 bg-white/20 rounded-full" />
                                        </div>
                                        {/* "You" - maybe a more active looking one */}
                                        <div className="bg-[#B8956A]/20 rounded-sm flex items-center justify-center relative border border-[#B8956A]/30 overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#B8956A]/40 to-transparent" />
                                            <Video className="w-6 h-6 text-[#B8956A]/60 animate-bounce" />
                                        </div>
                                    </div>

                                    {/* "LIVE" Indicator */}
                                    <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 bg-red-600 rounded-sm z-30 shadow-lg">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                        <span className="text-[8px] font-black text-white tracking-widest uppercase">Live</span>
                                    </div>

                                    {/* Screen Overlay (Scanlines etc) */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-black/40 pointer-events-none" />
                                </div>
                            ) : (
                                /* Static State: No Signal / Add Link */
                                <div className="absolute inset-0 bg-[#2a2a2a] flex items-center justify-center flex-col gap-2 p-4 text-center cursor-pointer" onClick={() => setIsEditing(true)}>
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center animate-bounce">
                                        <Plus className="w-6 h-6 text-white/50" />
                                    </div>
                                    <span className="text-[10px] md:text-xs text-white/40 font-mono tracking-widest uppercase">No Signal</span>
                                </div>
                            )}

                            {/* "Channel" Display (Meeting ID) */}
                            {hasLink && (
                                <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded font-mono text-[8px] md:text-[10px] text-green-400 border border-green-500/30 shadow-md font-bold tracking-widest uppercase z-30">
                                    {displayMeetId}
                                </div>
                            )}

                            {/* CRT Effects: Scanlines & Vignette */}
                            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-40 bg-[length:100%_3px,3px_100%]" />
                            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] z-50 rounded-[1.2rem]" />

                            {/* Screen Glare */}
                            <div className="absolute top-2 left-4 w-16 h-8 bg-white opacity-5 rounded-[50%] blur-xl transform -rotate-12 pointer-events-none z-[55]" />
                        </div>

                        {/* --- CONTROL PANEL (Side) --- */}
                        <div className="w-16 md:w-24 flex flex-col items-center justify-between py-2 shrink-0">

                            {/* Brand/Logo Area */}
                            <div className="text-[0.5rem] md:text-[0.6rem] font-black tracking-widest text-[#5D4037] opacity-60 uppercase text-center leading-tight">
                                Madison<br />Vision
                            </div>

                            {/* Tuning Knobs */}
                            <div className="space-y-3 md:space-y-4">
                                <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-[#3E2723] shadow-[2px_4px_6px_rgba(0,0,0,0.4),inset_2px_2px_4px_rgba(255,255,255,0.1)] flex items-center justify-center transform rotate-45 cursor-pointer hover:rotate-90 transition-transform duration-300">
                                    <div className="w-0.5 h-4 md:w-1 md:h-6 bg-[#8D6E63] rounded-full"></div>
                                </div>
                                <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-[#3E2723] shadow-[2px_4px_6px_rgba(0,0,0,0.4),inset_2px_2px_4px_rgba(255,255,255,0.1)] flex items-center justify-center transform -rotate-12 cursor-pointer hover:-rotate-45 transition-transform duration-300">
                                    <div className="w-0.5 h-4 md:w-1 md:h-6 bg-[#8D6E63] rounded-full"></div>
                                </div>
                            </div>

                            {/* Speaker Grille */}
                            <div className="w-full px-1 md:px-2 space-y-1 opacity-40">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="h-0.5 w-full bg-[#3E2723] rounded-full"></div>
                                ))}
                            </div>

                            {/* The "Link" Button (Styled as Power/Channel Button) */}
                            {hasLink ? (
                                <a
                                    href={targetUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group/btn relative w-full"
                                    title="Open in new tab"
                                >
                                    <div className="w-full h-8 md:h-10 mx-auto bg-[#c62828] rounded-lg shadow-[0_3px_0_#8e0000,0_4px_4px_rgba(0,0,0,0.3)] active:shadow-none active:translate-y-[3px] transition-all flex items-center justify-center border-t border-white/20 cursor-pointer group-hover/btn:bg-[#d32f2f]">
                                        <span className="text-[8px] md:text-[10px] font-bold text-white uppercase tracking-wider mr-1">Join</span>
                                        <ExternalLink className="w-2 h-2 md:w-3 md:h-3 text-white opacity-80" />
                                    </div>
                                </a>
                            ) : (
                                <div
                                    className="group/btn relative w-full cursor-not-allowed opacity-50 grayscale"
                                >
                                    <div className="w-full h-8 md:h-10 mx-auto bg-[#3e2723] rounded-lg shadow-[0_2px_0_#1b100e] flex items-center justify-center border-t border-white/10">
                                        <span className="text-[8px] md:text-[10px] font-bold text-white/50 uppercase tracking-wider">OFF</span>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* --- LEGS / STAND (Visual Flourish) --- */}
                    <div className="absolute -bottom-3 left-8 w-4 h-6 bg-[#3E2723] -z-10 skew-x-[10deg]"></div>
                    <div className="absolute -bottom-3 right-8 w-4 h-6 bg-[#3E2723] -z-10 -skew-x-[10deg]"></div>

                </div>

                {/* Caption Text Below TV (Only if link exists) */}
                {hasLink && (
                    <div className="mt-4 md:mt-6 text-stone-500 text-xs md:text-sm font-medium tracking-wide flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                        Playing: {targetUrl.replace('https://', '')}
                    </div>
                )}
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tuning Configuration</DialogTitle>
                        <DialogDescription>
                            Enter the Google Meet frequency (URL) to tune the television.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="meet-url">Meeting URL</Label>
                            <Input
                                id="meet-url"
                                placeholder="https://meet.google.com/abc-defg-hij"
                                value={meetUrl}
                                onChange={(e) => setMeetUrl(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSave();
                                    }
                                }}
                            />
                            <p className="text-xs text-muted-foreground">
                                Example: https://meet.google.com/abc-defg-hij
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>
                            Save Frequency
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default RetroTVWidget;
