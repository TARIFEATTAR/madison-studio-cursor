import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Package, Users, Bell, CreditCard, FolderKanban, Sparkles } from "lucide-react";
import { ProductsTab } from "@/components/settings/ProductsTab";
import { BrandGuidelinesTab } from "@/components/settings/BrandGuidelinesTab";
import { TeamTab } from "@/components/settings/TeamTab";
import { NotificationsTab } from "@/components/settings/NotificationsTab";
import { BillingTab } from "@/components/settings/BillingTab";
import { CollectionsTab } from "@/components/settings/CollectionsTab";
import { MadisonTrainingTab } from "@/components/settings/MadisonTrainingTab";

export default function Settings() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-6xl mx-auto">
        {/* Page Header with paper texture */}
        <div className="px-8 py-6 border-b border-cream-dark bg-paper-light">
          <h1 className="text-4xl font-serif text-charcoal">Settings</h1>
          <p className="text-neutral-600 mt-2">
            Configure your brand, products, and preferences
          </p>
        </div>

        {/* Tabs Section */}
        <div className="px-8 py-6">
          <Tabs defaultValue="brand" className="space-y-6">
            <TabsList className="bg-paper-light border border-cream-dark p-1 w-full justify-start flex-wrap">
              <TabsTrigger 
                value="brand" 
                className="data-[state=active]:bg-brass data-[state=active]:text-charcoal gap-2"
              >
                <Building2 className="w-4 h-4" />
                Brand Guidelines
              </TabsTrigger>
              <TabsTrigger 
                value="madison"
                className="data-[state=active]:bg-brass data-[state=active]:text-charcoal gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Madison's Training
              </TabsTrigger>
              <TabsTrigger 
                value="collections"
                className="data-[state=active]:bg-brass data-[state=active]:text-charcoal gap-2"
              >
                <FolderKanban className="w-4 h-4" />
                Collections
              </TabsTrigger>
              <TabsTrigger 
                value="products"
                className="data-[state=active]:bg-brass data-[state=active]:text-charcoal gap-2"
              >
                <Package className="w-4 h-4" />
                Products
              </TabsTrigger>
              <TabsTrigger 
                value="team"
                className="data-[state=active]:bg-brass data-[state=active]:text-charcoal gap-2"
              >
                <Users className="w-4 h-4" />
                Team
              </TabsTrigger>
              <TabsTrigger 
                value="notifications"
                className="data-[state=active]:bg-brass data-[state=active]:text-charcoal gap-2"
              >
                <Bell className="w-4 h-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger 
                value="billing"
                className="data-[state=active]:bg-brass data-[state=active]:text-charcoal gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Billing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="brand">
              <BrandGuidelinesTab />
            </TabsContent>

            <TabsContent value="madison">
              <MadisonTrainingTab />
            </TabsContent>

            <TabsContent value="collections">
              <CollectionsTab />
            </TabsContent>

            <TabsContent value="products">
              <ProductsTab />
            </TabsContent>

            <TabsContent value="team">
              <TeamTab />
            </TabsContent>

            <TabsContent value="notifications">
              <NotificationsTab />
            </TabsContent>

            <TabsContent value="billing">
              <BillingTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
