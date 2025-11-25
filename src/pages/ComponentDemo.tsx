import { useState } from "react";
import { Sparkles, FileText, Calendar, Settings, Zap, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GettingStartedChecklist } from "@/components/onboarding/GettingStartedChecklist";
import { EnhancedWelcomeModal } from "@/components/onboarding/EnhancedWelcomeModal";
import { EmptyState, EmptyStateCard } from "@/components/ui/empty-state";

export default function ComponentDemo() {
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const [showChecklist, setShowChecklist] = useState(true);

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-4xl font-serif font-bold text-foreground">
                        Onboarding Components Demo
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Interactive showcase of new user onboarding and UX components
                    </p>
                </div>

                {/* Tabs for different components */}
                <Tabs defaultValue="checklist" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="checklist">Getting Started Checklist</TabsTrigger>
                        <TabsTrigger value="welcome">Welcome Modal</TabsTrigger>
                        <TabsTrigger value="empty">Empty States</TabsTrigger>
                    </TabsList>

                    {/* Getting Started Checklist Demo */}
                    <TabsContent value="checklist" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Getting Started Checklist</CardTitle>
                                <CardDescription>
                                    A comprehensive checklist that tracks user progress through key onboarding tasks
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <h3 className="font-medium">Features:</h3>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                        <li>Progress tracking with visual progress bar</li>
                                        <li>Smart detection of completed tasks via Supabase queries</li>
                                        <li>Persistent state using localStorage</li>
                                        <li>Interactive navigation to relevant pages</li>
                                        <li>Compact and expanded modes</li>
                                        <li>Auto-dismiss when complete</li>
                                    </ul>
                                </div>

                                <div className="flex gap-3">
                                    <Button onClick={() => setShowChecklist(true)} variant="default">
                                        Show Checklist
                                    </Button>
                                    <Button onClick={() => setShowChecklist(false)} variant="outline">
                                        Hide Checklist
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Live Demo */}
                        {showChecklist && (
                            <div className="animate-in fade-in-0 slide-in-from-top-4 duration-300">
                                <GettingStartedChecklist
                                    onDismiss={() => setShowChecklist(false)}
                                    compact={false}
                                />
                            </div>
                        )}

                        {/* Code Example */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Usage Example</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                                    <code>{`import { GettingStartedChecklist } from "@/components/onboarding/GettingStartedChecklist";

<GettingStartedChecklist 
  onDismiss={() => setShowChecklist(false)}
  compact={false}
/>`}</code>
                                </pre>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Welcome Modal Demo */}
                    <TabsContent value="welcome" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Enhanced Welcome Modal</CardTitle>
                                <CardDescription>
                                    A multi-step onboarding modal with smooth animations and better UX
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <h3 className="font-medium">Features:</h3>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                        <li>3-step onboarding flow with progress indicator</li>
                                        <li>Keyboard navigation (Enter to proceed, ESC to skip)</li>
                                        <li>Smooth fade and slide animations</li>
                                        <li>Contextual help and tips at each step</li>
                                        <li>Clear required vs optional field indicators</li>
                                        <li>Website scanning capability</li>
                                    </ul>
                                </div>

                                <Button onClick={() => setShowWelcomeModal(true)} variant="default">
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Launch Welcome Modal
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Code Example */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Usage Example</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                                    <code>{`import { EnhancedWelcomeModal } from "@/components/onboarding/EnhancedWelcomeModal";

<EnhancedWelcomeModal
  open={isOpen}
  onComplete={(data) => {
    console.log("User data:", data);
    // Handle completion
  }}
  onSkip={() => {
    // Handle skip
  }}
/>`}</code>
                                </pre>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Empty States Demo */}
                    <TabsContent value="empty" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Empty State Components</CardTitle>
                                <CardDescription>
                                    Reusable empty state components with consistent styling
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <h3 className="font-medium">Features:</h3>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                        <li>Flexible with custom icons, titles, and descriptions</li>
                                        <li>Primary and secondary action buttons</li>
                                        <li>Card and inline variants</li>
                                        <li>Support for custom children content</li>
                                        <li>Consistent styling across the application</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Empty State Examples */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Example 1: No Content */}
                            <EmptyStateCard
                                icon={FileText}
                                title="No Content Yet"
                                description="Start creating your first piece of content with Madison's assistance"
                                action={{
                                    label: "Create Content",
                                    onClick: () => alert("Navigate to /create")
                                }}
                                compact={true}
                            />

                            {/* Example 2: No Search Results */}
                            <EmptyStateCard
                                icon={Search}
                                title="No Results Found"
                                description="Try adjusting your search or filters to find what you're looking for"
                                action={{
                                    label: "Clear Filters",
                                    onClick: () => alert("Clear filters"),
                                    variant: "outline"
                                }}
                                compact={true}
                            />

                            {/* Example 3: No Scheduled Content */}
                            <EmptyStateCard
                                icon={Calendar}
                                title="Nothing Scheduled"
                                description="Plan your content calendar for consistent publishing"
                                action={{
                                    label: "Schedule Post",
                                    onClick: () => alert("Navigate to /calendar")
                                }}
                                secondaryAction={{
                                    label: "Learn More",
                                    onClick: () => alert("Show help")
                                }}
                                compact={true}
                            />

                            {/* Example 4: Feature Not Available */}
                            <EmptyStateCard
                                icon={Zap}
                                title="Coming Soon"
                                description="This feature is currently in development and will be available soon"
                                compact={true}
                            />
                        </div>

                        {/* Code Example */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Usage Example</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                                    <code>{`import { EmptyState, EmptyStateCard } from "@/components/ui/empty-state";
import { FileText } from "lucide-react";

// Inline variant
<EmptyState
  icon={FileText}
  title="No Content Yet"
  description="Start creating your first piece of content"
  action={{
    label: "Create Content",
    onClick: () => navigate("/create")
  }}
/>

// Card variant
<EmptyStateCard
  icon={FileText}
  title="No Content Yet"
  description="Start creating your first piece of content"
  compact={true}
  action={{
    label: "Create Content",
    onClick: () => navigate("/create")
  }}
  secondaryAction={{
    label: "Learn More",
    onClick: () => navigate("/help")
  }}
/>`}</code>
                                </pre>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Welcome Modal (rendered outside tabs) */}
                <EnhancedWelcomeModal
                    open={showWelcomeModal}
                    onComplete={(data) => {
                        console.log("Welcome modal completed with data:", data);
                        setShowWelcomeModal(false);
                        alert(`Welcome ${data.userName}! Brand: ${data.brandName}`);
                    }}
                    onSkip={() => {
                        console.log("Welcome modal skipped");
                        setShowWelcomeModal(false);
                    }}
                />
            </div>
        </div>
    );
}
