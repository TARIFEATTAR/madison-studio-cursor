import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Save, X, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOnboarding } from "@/hooks/useOnboarding";
import { toast } from "@/hooks/use-toast";
import { useIndustryConfig } from "@/hooks/useIndustryConfig";
import { getCollectionTemplatesForIndustry } from "@/config/collectionTemplates";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Collection {
  id: string;
  name: string;
  description: string | null;
  transparency_statement: string | null;
  color_theme: string | null;
  sort_order: number;
}

export const CollectionsTab = () => {
  const { currentOrganizationId } = useOnboarding();
  const { industryConfig } = useIndustryConfig(currentOrganizationId);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    transparency_statement: "",
    color_theme: "#B8956A",
  });

  const industryTemplates = industryConfig?.id 
    ? getCollectionTemplatesForIndustry(industryConfig.id)
    : [];

  useEffect(() => {
    fetchCollections();
  }, [currentOrganizationId]);

  const fetchCollections = async () => {
    if (!currentOrganizationId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("brand_collections")
        .select("*")
        .eq("organization_id", currentOrganizationId)
        .order("sort_order");

      if (error) throw error;
      setCollections(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!currentOrganizationId || !formData.name) return;

    try {
      const { error } = await supabase.from("brand_collections").insert({
        organization_id: currentOrganizationId,
        name: formData.name,
        description: formData.description || null,
        transparency_statement: formData.transparency_statement || null,
        color_theme: formData.color_theme || null,
        sort_order: collections.length,
      });

      if (error) throw error;

      toast({
        title: "Collection created",
        description: "Your collection has been created successfully.",
      });

      setFormData({
        name: "",
        description: "",
        transparency_statement: "",
        color_theme: "#B8956A",
      });
      setIsCreating(false);
      fetchCollections();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const { error } = await supabase
        .from("brand_collections")
        .update({
          name: formData.name,
          description: formData.description || null,
          transparency_statement: formData.transparency_statement || null,
          color_theme: formData.color_theme || null,
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Collection updated",
        description: "Your collection has been updated successfully.",
      });

      setEditingId(null);
      fetchCollections();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      const { error } = await supabase
        .from("brand_collections")
        .delete()
        .eq("id", deletingId);

      if (error) throw error;

      toast({
        title: "Collection deleted",
        description: "Your collection has been deleted successfully.",
      });

      setDeletingId(null);
      fetchCollections();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const startEdit = (collection: Collection) => {
    setEditingId(collection.id);
    setFormData({
      name: collection.name,
      description: collection.description || "",
      transparency_statement: collection.transparency_statement || "",
      color_theme: collection.color_theme || "#B8956A",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({
      name: "",
      description: "",
      transparency_statement: "",
      color_theme: "#B8956A",
    });
  };

  const handleUseTemplate = async (template: any) => {
    if (!currentOrganizationId) return;

    try {
      const { error } = await supabase.from("brand_collections").insert({
        organization_id: currentOrganizationId,
        name: template.name,
        description: template.description,
        transparency_statement: template.transparency_statement,
        color_theme: template.color_theme,
        sort_order: collections.length,
      });

      if (error) throw error;

      toast({
        title: "Collection created",
        description: `${template.name} has been added to your collections.`,
      });

      setShowTemplates(false);
      fetchCollections();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className="bg-paper border-cream-dark">
        <CardContent className="pt-6">
          <p className="text-neutral-600">Loading collections...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Industry Templates Section */}
      {industryTemplates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brass" />
              Industry Templates for {industryConfig?.name}
            </CardTitle>
            <CardDescription>
              Quick-start your collections with pre-configured templates tailored to your industry
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {industryTemplates.map((template, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-border/40 hover:border-brass/40 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-foreground">{template.name}</h4>
                    <div
                      className="w-6 h-6 rounded-full border border-border/40"
                      style={{ backgroundColor: template.color_theme }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setFormData({
                        name: template.name,
                        description: template.description,
                        transparency_statement: template.transparency_statement,
                        color_theme: template.color_theme,
                      });
                      setIsCreating(true);
                    }}
                    className="w-full"
                  >
                    Use Template
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      <Card className="bg-paper border-cream-dark">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-charcoal font-serif">Collections</CardTitle>
              <CardDescription>
                Organize your content into collections with themes and transparency statements
              </CardDescription>
            </div>
            {!isCreating && (
              <div className="flex gap-2">
                {industryTemplates.length > 0 && (
                  <Button
                    onClick={() => setShowTemplates(true)}
                    variant="outline"
                    className="border-cream-dark"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Use Template
                  </Button>
                )}
                <Button
                  onClick={() => setIsCreating(true)}
                  className="bg-brass hover:bg-brass/90 text-charcoal"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Collection
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {isCreating && (
            <Card className="bg-paper-light border-cream-dark">
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-name">Collection Name *</Label>
                  <Input
                    id="new-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Luxury Collection"
                    className="bg-paper border-cream-dark"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-description">Description</Label>
                  <Textarea
                    id="new-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe this collection..."
                    className="bg-paper border-cream-dark min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-transparency">Transparency Statement</Label>
                  <Textarea
                    id="new-transparency"
                    value={formData.transparency_statement}
                    onChange={(e) =>
                      setFormData({ ...formData, transparency_statement: e.target.value })
                    }
                    placeholder="Transparency notes for this collection..."
                    className="bg-paper border-cream-dark min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-color">Color Theme</Label>
                  <div className="flex gap-2">
                    <Input
                      id="new-color"
                      type="color"
                      value={formData.color_theme}
                      onChange={(e) => setFormData({ ...formData, color_theme: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={formData.color_theme}
                      onChange={(e) => setFormData({ ...formData, color_theme: e.target.value })}
                      className="bg-paper border-cream-dark"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCreate} variant="brass">
                    <Save className="w-4 h-4 mr-2" />
                    Create Collection
                  </Button>
                  <Button onClick={cancelEdit} variant="outline" className="border-cream-dark">
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {collections.length === 0 && !isCreating && (
            <div className="text-center py-12">
              <p className="text-neutral-600 mb-4">No collections yet</p>
              <Button
                onClick={() => setIsCreating(true)}
                variant="outline"
                className="border-cream-dark"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create your first collection
              </Button>
            </div>
          )}

          {collections.map((collection) => (
            <Card key={collection.id} className="bg-paper-light border-cream-dark">
              <CardContent className="pt-6">
                {editingId === collection.id ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`edit-name-${collection.id}`}>Collection Name *</Label>
                      <Input
                        id={`edit-name-${collection.id}`}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-paper border-cream-dark"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`edit-description-${collection.id}`}>Description</Label>
                      <Textarea
                        id={`edit-description-${collection.id}`}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="bg-paper border-cream-dark min-h-[80px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`edit-transparency-${collection.id}`}>
                        Transparency Statement
                      </Label>
                      <Textarea
                        id={`edit-transparency-${collection.id}`}
                        value={formData.transparency_statement}
                        onChange={(e) =>
                          setFormData({ ...formData, transparency_statement: e.target.value })
                        }
                        className="bg-paper border-cream-dark min-h-[80px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`edit-color-${collection.id}`}>Color Theme</Label>
                      <div className="flex gap-2">
                        <Input
                          id={`edit-color-${collection.id}`}
                          type="color"
                          value={formData.color_theme}
                          onChange={(e) =>
                            setFormData({ ...formData, color_theme: e.target.value })
                          }
                          className="w-20 h-10"
                        />
                        <Input
                          type="text"
                          value={formData.color_theme}
                          onChange={(e) =>
                            setFormData({ ...formData, color_theme: e.target.value })
                          }
                          className="bg-paper border-cream-dark"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleUpdate(collection.id)}
                        className="bg-brass hover:bg-brass/90 text-charcoal"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button
                        onClick={cancelEdit}
                        variant="outline"
                        className="border-cream-dark"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-4">
                    <div
                      className="w-8 h-8 rounded flex-shrink-0 mt-1"
                      style={{ backgroundColor: collection.color_theme || "#B8956A" }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-lg text-charcoal mb-1">{collection.name}</h3>
                      {collection.description && (
                        <p className="text-sm text-neutral-600 mb-2">{collection.description}</p>
                      )}
                      {collection.transparency_statement && (
                        <p className="text-xs text-neutral-500 italic">
                          Transparency: {collection.transparency_statement}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(collection)}
                        className="text-neutral-600 hover:text-charcoal"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingId(collection.id)}
                        className="text-neutral-600 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent className="bg-paper border-cream-dark">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-charcoal font-serif">
              Delete Collection
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this collection? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-cream-dark">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="bg-paper border-cream-dark max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-charcoal font-serif">Collection Templates</DialogTitle>
            <DialogDescription>
              Choose from pre-built collections tailored for your industry
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {industryTemplates.map((template, index) => (
              <Card key={index} className="bg-paper-light border-cream-dark">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-8 h-8 rounded flex-shrink-0 mt-1"
                      style={{ backgroundColor: template.color_theme }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-lg text-charcoal mb-1">{template.name}</h3>
                      <p className="text-sm text-neutral-600 mb-2">{template.description}</p>
                      <p className="text-xs text-neutral-500 italic mb-3">
                        Transparency: {template.transparency_statement}
                      </p>
                      <Button
                        onClick={() => handleUseTemplate(template)}
                        size="sm"
                        className="bg-brass hover:bg-brass/90 text-charcoal"
                      >
                        Use This Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {industryTemplates.length === 0 && (
              <p className="text-center text-neutral-600 py-8">
                No templates available. Set your industry in Brand Guidelines first.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
