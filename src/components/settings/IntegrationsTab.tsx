import { ShopifyConnection } from "./ShopifyConnection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

export function IntegrationsTab() {

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-serif mb-2">Integrations</h3>
        <p className="text-sm text-muted-foreground">
          Connect external platforms and enable AI agents
        </p>
      </div>


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
