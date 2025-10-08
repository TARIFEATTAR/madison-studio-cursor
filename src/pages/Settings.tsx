import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCollections } from "@/hooks/useCollections";
import { useWeekNames } from "@/hooks/useWeekNames";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useProducts } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, GripVertical, ArrowLeft } from "lucide-react";
import { ProductsTab } from "@/components/settings/ProductsTab";
import { BrandGuidelinesTab } from "@/components/settings/BrandGuidelinesTab";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { collections, loading: collectionsLoading } = useCollections();
  const { weekNames, loading: weekNamesLoading } = useWeekNames();
  const { currentOrganizationId } = useOnboarding();
  const { products, loading: productsLoading } = useProducts();

  // Collections state
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDesc, setNewCollectionDesc] = useState("");
  const [deleteCollectionId, setDeleteCollectionId] = useState<string | null>(null);

  // Week names state
  const [customWeekNames, setCustomWeekNames] = useState(weekNames);
  const [weekNamesSaving, setWeekNamesSaving] = useState(false);

  // Update local week names when they load
  useEffect(() => {
    setCustomWeekNames(weekNames);
  }, [weekNames]);

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim() || !currentOrganizationId) return;

    try {
      const { error } = await supabase
        .from("brand_collections")
        .insert({
          organization_id: currentOrganizationId,
          name: newCollectionName.trim(),
          description: newCollectionDesc.trim() || null,
          sort_order: collections.length + 1,
        });

      if (error) throw error;

      toast({
        title: "Collection created",
        description: `"${newCollectionName}" has been added to your collections.`,
      });

      setNewCollectionName("");
      setNewCollectionDesc("");
      
      // Refresh collections
      window.location.reload();
    } catch (error) {
      console.error("Error creating collection:", error);
      toast({
        title: "Error",
        description: "Failed to create collection. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCollection = async () => {
    if (!deleteCollectionId) return;

    try {
      const { error } = await supabase
        .from("brand_collections")
        .delete()
        .eq("id", deleteCollectionId);

      if (error) throw error;

      toast({
        title: "Collection deleted",
        description: "The collection has been removed.",
      });

      setDeleteCollectionId(null);
      
      // Refresh collections
      window.location.reload();
    } catch (error) {
      console.error("Error deleting collection:", error);
      toast({
        title: "Error",
        description: "Failed to delete collection. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveWeekNames = async () => {
    if (!currentOrganizationId) return;

    setWeekNamesSaving(true);
    try {
      const { error } = await supabase
        .from("organizations")
        .update({
          settings: {
            custom_week_names: customWeekNames as any,
          } as any,
        })
        .eq("id", currentOrganizationId);

      if (error) throw error;

      toast({
        title: "Week names saved",
        description: "Your custom DIP week names have been updated.",
      });
      
      // Refresh to update week names across the app
      window.location.reload();
    } catch (error) {
      console.error("Error saving week names:", error);
      toast({
        title: "Error",
        description: "Failed to save week names. Please try again.",
        variant: "destructive",
      });
    } finally {
      setWeekNamesSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-4xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your collections, week names, and brand preferences
          </p>
        </div>

        <Tabs defaultValue="brand" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="brand">Brand</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="weeks">DIP Weeks</TabsTrigger>
          </TabsList>

          {/* Brand Guidelines Tab */}
          <TabsContent value="brand">
            <BrandGuidelinesTab />
          </TabsContent>

          {/* Collections Tab */}
          <TabsContent value="collections" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Collection</CardTitle>
                <CardDescription>
                  Collections help organize your brand's product lines or themes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="collectionName">Collection Name *</Label>
                  <Input
                    id="collectionName"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder="e.g., Summer Collection, Limited Edition..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="collectionDesc">Description (Optional)</Label>
                  <Textarea
                    id="collectionDesc"
                    value={newCollectionDesc}
                    onChange={(e) => setNewCollectionDesc(e.target.value)}
                    placeholder="Describe this collection..."
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleCreateCollection}
                  disabled={!newCollectionName.trim()}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Collection
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Collections</CardTitle>
                <CardDescription>
                  {collections.length === 0
                    ? "No collections yet. Create your first one above."
                    : `You have ${collections.length} collection${collections.length === 1 ? "" : "s"}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {collectionsLoading ? (
                  <p className="text-muted-foreground">Loading collections...</p>
                ) : collections.length === 0 ? (
                  <p className="text-muted-foreground italic">
                    Create your first collection to start organizing your content.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {collections.map((collection) => (
                      <div
                        key={collection.id}
                        className="flex items-start gap-3 p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
                      >
                        <GripVertical className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground">{collection.name}</h3>
                          {collection.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {collection.description}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteCollectionId(collection.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <ProductsTab />
          </TabsContent>

          {/* Week Names Tab */}
          <TabsContent value="weeks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customize DIP Week Names</CardTitle>
                <CardDescription>
                  DIP (Deep Immersion Period) weeks help structure your content calendar.
                  Customize these names to match your brand's content rhythm.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {weekNamesLoading ? (
                  <p className="text-muted-foreground">Loading week names...</p>
                ) : (
                  <>
                    {[1, 2, 3, 4].map((weekNum) => (
                      <div key={weekNum} className="space-y-2">
                        <Label htmlFor={`week-${weekNum}`}>Week {weekNum}</Label>
                        <Input
                          id={`week-${weekNum}`}
                          value={customWeekNames[weekNum as keyof typeof customWeekNames]}
                          onChange={(e) =>
                            setCustomWeekNames({
                              ...customWeekNames,
                              [weekNum]: e.target.value,
                            })
                          }
                          placeholder={`Week ${weekNum}`}
                        />
                      </div>
                    ))}
                    <Button
                      onClick={handleSaveWeekNames}
                      disabled={weekNamesSaving}
                      className="mt-4"
                    >
                      {weekNamesSaving ? "Saving..." : "Save Week Names"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">Examples</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong>Product Launches:</strong> Week 1: "Teaser", Week 2: "Pre-Launch",
                  Week 3: "Launch", Week 4: "Follow-up"
                </p>
                <p>
                  <strong>Seasonal:</strong> Week 1: "Early Spring", Week 2: "Mid Spring",
                  Week 3: "Late Spring", Week 4: "Spring Finale"
                </p>
                <p>
                  <strong>Thematic:</strong> Week 1: "Awareness", Week 2: "Education",
                  Week 3: "Engagement", Week 4: "Conversion"
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteCollectionId}
        onOpenChange={(open) => !open && setDeleteCollectionId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Collection?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this collection. Content tagged with this collection
              will not be deleted, but the collection tag will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCollection}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
