import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Package, Users, Bell, CreditCard, FolderKanban, Sparkles, Target } from "lucide-react";
import { ProductsTab } from "@/components/settings/ProductsTab";
import { BrandGuidelinesTab } from "@/components/settings/BrandGuidelinesTab";
import { TeamTab } from "@/components/settings/TeamTab";
import { NotificationsTab } from "@/components/settings/NotificationsTab";
import { BillingTab } from "@/components/settings/BillingTab";
import { CollectionsTab } from "@/components/settings/CollectionsTab";
import { MadisonTrainingTab } from "@/components/settings/MadisonTrainingTab";
import { GoalsTab } from "@/components/settings/GoalsTab";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function Settings() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'brand';
  const { user } = useAuth();
  const [organizationName, setOrganizationName] = useState<string>("");

  // Fetch organization name
  useEffect(() => {
    if (user) {
      supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(async ({ data }) => {
          if (data?.organization_id) {
            const { data: org } = await supabase
              .from("organizations")
              .select("name")
              .eq("id", data.organization_id)
              .maybeSingle();
            if (org?.name) {
              setOrganizationName((org as any).name);
            }
          }
        });
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-6xl mx-auto">
        {/* Page Header with paper texture */}
        <div className="px-8 py-6 border-b border-cream-dark bg-paper-light">
          <h1 className="text-4xl font-serif text-charcoal">
            Settings{organizationName && ` • ${organizationName}`}
          </h1>
          <p className="text-neutral-600 mt-2">
            Configure your brand, products, and preferences
          </p>
        </div>

        {/* Tabs Section */}
        <div className="px-8 py-6">
          <Tabs defaultValue={defaultTab} className="space-y-6">
            <TabsList className="bg-paper-light border border-cream-dark p-1 w-full justify-start overflow-x-auto flex-nowrap">
              <TabsTrigger 
                value="brand" 
                className="data-[state=active]:bg-brass data-[state=active]:text-charcoal px-2 sm:px-3 py-1.5 gap-1 sm:gap-2 whitespace-nowrap flex-shrink-0"
              >
                <Building2 className="w-4 h-4" />
                <span className="hidden xs:inline">Brand Guidelines</span>
              </TabsTrigger>
              <TabsTrigger 
                value="madison"
                className="data-[state=active]:bg-brass data-[state=active]:text-charcoal px-2 sm:px-3 py-1.5 gap-1 sm:gap-2 whitespace-nowrap flex-shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden xs:inline">Madison's Training</span>
              </TabsTrigger>
              <TabsTrigger 
                value="goals"
                className="data-[state=active]:bg-brass data-[state=active]:text-charcoal px-2 sm:px-3 py-1.5 gap-1 sm:gap-2 whitespace-nowrap flex-shrink-0"
              >
                <Target className="w-4 h-4" />
                <span className="hidden xs:inline">Goals & Accolades</span>
              </TabsTrigger>
              <TabsTrigger
                value="collections"
                className="data-[state=active]:bg-brass data-[state=active]:text-charcoal px-2 sm:px-3 py-1.5 gap-1 sm:gap-2 whitespace-nowrap flex-shrink-0"
              >
                <FolderKanban className="w-4 h-4" />
                <span className="hidden xs:inline">Collections</span>
              </TabsTrigger>
              <TabsTrigger 
                value="products"
                className="data-[state=active]:bg-brass data-[state=active]:text-charcoal px-2 sm:px-3 py-1.5 gap-1 sm:gap-2 whitespace-nowrap flex-shrink-0"
              >
                <Package className="w-4 h-4" />
                <span className="hidden xs:inline">Products</span>
              </TabsTrigger>
              <TabsTrigger 
                value="team"
                className="data-[state=active]:bg-brass data-[state=active]:text-charcoal px-2 sm:px-3 py-1.5 gap-1 sm:gap-2 whitespace-nowrap flex-shrink-0"
              >
                <Users className="w-4 h-4" />
                <span className="hidden xs:inline">Team</span>
              </TabsTrigger>
              <TabsTrigger 
                value="notifications"
                className="data-[state=active]:bg-brass data-[state=active]:text-charcoal px-2 sm:px-3 py-1.5 gap-1 sm:gap-2 whitespace-nowrap flex-shrink-0"
              >
                <Bell className="w-4 h-4" />
                <span className="hidden xs:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger 
                value="billing"
                className="data-[state=active]:bg-brass data-[state=active]:text-charcoal px-2 sm:px-3 py-1.5 gap-1 sm:gap-2 whitespace-nowrap flex-shrink-0"
              >
                <CreditCard className="w-4 h-4" />
                <span className="hidden xs:inline">Billing</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="brand">
              <BrandGuidelinesTab />
            </TabsContent>

            <TabsContent value="madison">
              <MadisonTrainingTab />
            </TabsContent>

            <TabsContent value="goals">
              <GoalsTab />
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
