import { useState } from "react";
import { X, Sparkles, ArrowRight, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getIndustryOptions } from "@/config/industryTemplates";
import { cn } from "@/lib/utils";

interface EnhancedWelcomeModalProps {
    open: boolean;
    onComplete: (data: {
        userName: string;
        brandName: string;
        industry: string;
        primaryColor: string;
        websiteUrl?: string;
    }) => void;
    onSkip?: () => void;
}

const INDUSTRY_OPTIONS = getIndustryOptions();

export function EnhancedWelcomeModal({ open, onComplete, onSkip }: EnhancedWelcomeModalProps) {
    const [step, setStep] = useState(1);
    const [userName, setUserName] = useState("");
    const [brandName, setBrandName] = useState("");
    const [industry, setIndustry] = useState("");
    const [websiteUrl, setWebsiteUrl] = useState("");

    const totalSteps = 3;

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleSubmit = () => {
        if (!userName.trim() || !brandName.trim()) return;
        onComplete({
            userName: userName.trim(),
            brandName: brandName.trim(),
            industry,
            primaryColor: "#B8956A",
            websiteUrl: websiteUrl.trim() || undefined
        });
    };

    const canProceed = () => {
        if (step === 1) return userName.trim().length > 0;
        if (step === 2) return brandName.trim().length > 0;
        return true; // Step 3 is optional
    };

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onSkip?.()}>
            <DialogContent
                className="max-w-2xl bg-card border-border/20 overflow-hidden"
                onPointerDownOutside={(e) => e.preventDefault()}
            >
                {onSkip && (
                    <button
                        onClick={onSkip}
                        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-10"
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Skip onboarding</span>
                    </button>
                )}

                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Sparkles className="w-6 h-6 text-primary" />
                        </div>
                        <DialogTitle className="font-serif text-3xl text-gray-900">
                            Welcome to MADISON
                        </DialogTitle>
                    </div>
                    <p className="text-base text-gray-700">
                        Let's personalize your experience in just a few steps
                    </p>
                </DialogHeader>

                {/* Progress Bar */}
                <div className="flex gap-2 my-4">
                    {Array.from({ length: totalSteps }).map((_, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "h-1.5 flex-1 rounded-full transition-all duration-300",
                                idx < step ? "bg-primary" : "bg-border"
                            )}
                        />
                    ))}
                </div>

                {/* Step Content */}
                <div className="min-h-[280px] py-4">
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <Label htmlFor="userName" className="text-gray-900 text-base">
                                    What should we call you? <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="userName"
                                    placeholder="e.g., Jordan"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    className="bg-input border-border/40 h-12 text-base"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && canProceed()) {
                                            handleNext();
                                        }
                                    }}
                                />
                                <p className="text-sm text-gray-700">
                                    This is how Madison will address you throughout the platform
                                </p>
                            </div>

                            <div className="mt-8 p-4 rounded-lg bg-accent/10 border border-border/20">
                                <p className="text-sm text-gray-700">
                                    <strong className="text-gray-900">Pro tip:</strong> Madison learns your preferences over time to provide increasingly personalized content suggestions.
                                </p>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <Label htmlFor="brandName" className="text-gray-900 text-base">
                                    What's your brand name? <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="brandName"
                                    placeholder="e.g., Maison Lumière"
                                    value={brandName}
                                    onChange={(e) => setBrandName(e.target.value)}
                                    className="bg-input border-border/40 h-12 text-base"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && canProceed()) {
                                            handleNext();
                                        }
                                    }}
                                />
                                <p className="text-sm text-gray-700">
                                    This helps Madison understand your brand identity and voice
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="industry" className="text-gray-900 text-base">
                                    Industry <span className="text-gray-600 text-sm">(optional)</span>
                                </Label>
                                <Select value={industry} onValueChange={setIndustry}>
                                    <SelectTrigger className="bg-input border-border/40 h-12">
                                        <SelectValue placeholder="Select your industry" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover border-border/20 max-h-[300px]">
                                        {INDUSTRY_OPTIONS.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-gray-700">
                                    Helps us tailor content templates and suggestions
                                </p>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <Label htmlFor="websiteUrl" className="text-gray-900 text-base">
                                    Website URL <span className="text-gray-600 text-sm">(optional but recommended)</span>
                                </Label>
                                <Input
                                    id="websiteUrl"
                                    placeholder="https://yourbrand.com"
                                    value={websiteUrl}
                                    onChange={(e) => setWebsiteUrl(e.target.value)}
                                    className="bg-input border-border/40 h-12 text-base"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleSubmit();
                                        }
                                    }}
                                />
                                <p className="text-sm text-gray-700">
                                    We'll analyze your website to learn your visual identity, tone, and brand style
                                </p>
                            </div>

                            <div className="mt-6 space-y-3">
                                <p className="text-sm font-medium text-gray-900">What happens next:</p>
                                <div className="space-y-2">
                                    {[
                                        "Madison scans your website for brand colors, fonts, and style",
                                        "We analyze your existing content to understand your voice",
                                        "Your personalized workspace is set up and ready to use",
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-gray-700">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {websiteUrl.trim() && (
                                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                                    <p className="text-sm text-gray-900">
                                        <strong>Scanning will take 30-60 seconds.</strong> You can skip this and add your website later in Settings.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-4 border-t border-border/20">
                    <div className="flex items-center gap-2">
                        {step > 1 && (
                            <Button
                                onClick={handleBack}
                                variant="ghost"
                                size="sm"
                                className="text-gray-700"
                            >
                                Back
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-600">
                            Step {step} of {totalSteps}
                        </span>
                        <Button
                            onClick={handleNext}
                            disabled={!canProceed()}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]"
                            size="lg"
                        >
                            {step === totalSteps ? (
                                websiteUrl.trim() ? "Scan & Start" : "Get Started"
                            ) : (
                                <>
                                    Next <ArrowRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
