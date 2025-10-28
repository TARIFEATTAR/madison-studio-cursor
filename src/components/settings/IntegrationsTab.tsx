import { useState } from "react";
import { ShopifyConnection } from "./ShopifyConnection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Search, Plus, Trash2, Play } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCompetitiveIntelligence } from "@/hooks/useCompetitiveIntelligence";
import { formatRelativeTime } from "@/lib/dateUtils";

export function IntegrationsTab() {
  const {
    competitors,
    preferences,
    loading,
    toggleAgent,
    addCompetitor,
    removeCompetitor,
    triggerScan,
  } = useCompetitiveIntelligence();

  const [newCompetitor, setNewCompetitor] = useState({
    name: "",
    url: "",
    notes: "",
  });

  const handleAddCompetitor = async () => {
    if (!newCompetitor.name || !newCompetitor.url) return;
    await addCompetitor(newCompetitor.name, newCompetitor.url, newCompetitor.notes);
    setNewCompetitor({ name: "", url: "", notes: "" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-serif mb-2">Integrations</h3>
        <p className="text-sm text-muted-foreground">
          Connect external platforms and enable AI agents
        </p>
      </div>

      {/* Competitive Intelligence Agent */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Search className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <CardTitle>Competitive Intelligence Agent</CardTitle>
                <CardDescription>
                  Madison's research assistant monitors competitors weekly
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={preferences?.competitive_intelligence_enabled || false}
              onCheckedChange={toggleAgent}
              disabled={loading}
            />
          </div>
        </CardHeader>

        {preferences?.competitive_intelligence_enabled && (
          <CardContent className="space-y-6">
            {/* Add Competitor Form */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Add Competitor</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Input
                  placeholder="Competitor name"
                  value={newCompetitor.name}
                  onChange={(e) =>
                    setNewCompetitor({ ...newCompetitor, name: e.target.value })
                  }
                />
                <Input
                  placeholder="Website URL"
                  value={newCompetitor.url}
                  onChange={(e) =>
                    setNewCompetitor({ ...newCompetitor, url: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Notes (optional)"
                  value={newCompetitor.notes}
                  onChange={(e) =>
                    setNewCompetitor({ ...newCompetitor, notes: e.target.value })
                  }
                />
                <Button onClick={handleAddCompetitor} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>

            {/* Competitor List */}
            {competitors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Monitored Competitors ({competitors.length})
                  </label>
                  <Button variant="outline" size="sm" onClick={triggerScan}>
                    <Play className="w-4 h-4 mr-2" />
                    Scan Now
                  </Button>
                </div>
                <div className="space-y-2">
                  {competitors.map((competitor) => (
                    <div
                      key={competitor.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{competitor.competitor_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {competitor.competitor_url}
                        </p>
                        {competitor.notes && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {competitor.notes}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCompetitor(competitor.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scan Status */}
            {preferences.last_scan_at && (
              <p className="text-xs text-muted-foreground">
                Last scan: {formatRelativeTime(preferences.last_scan_at)}
              </p>
            )}
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <CardTitle>Shopify</CardTitle>
              <CardDescription>
                Sync your product catalog and publish luxury descriptions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ShopifyConnection />
        </CardContent>
      </Card>

      {/* Future integrations can be added here */}
      <Card className="opacity-60">
        <CardHeader>
          <CardTitle className="text-muted-foreground">More Integrations Coming Soon</CardTitle>
          <CardDescription>
            Additional e-commerce platforms and marketing tools will be available in future updates
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
