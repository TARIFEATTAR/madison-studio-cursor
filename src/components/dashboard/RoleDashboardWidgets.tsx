import React from "react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Package,
  TrendingUp,
  Users,
  Megaphone,
  Shield,
  DollarSign,
  BarChart3,
  Image,
  Palette,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUserRole, TeamRole } from "@/hooks/useUserRole";
import { RoleBadge } from "@/components/role";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════════
// FOUNDER/EXECUTIVE WIDGETS
// ═══════════════════════════════════════════════════════════════════════════════

export function PipelineOverviewWidget() {
  const navigate = useNavigate();
  
  // Mock data - would come from a hook in production
  const pipelineData = {
    idea: 3,
    development: 5,
    testing: 2,
    launch: 1,
  };
  
  const total = Object.values(pipelineData).reduce((a, b) => a + b, 0);
  
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            Product Pipeline
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {total} Products
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(pipelineData).map(([stage, count]) => (
            <div key={stage} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-20 capitalize">
                {stage}
              </span>
              <Progress value={(count / total) * 100} className="flex-1 h-2" />
              <span className="text-sm font-medium w-6 text-right">{count}</span>
            </div>
          ))}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-4"
          onClick={() => navigate("/products")}
        >
          View All Products
        </Button>
      </CardContent>
    </Card>
  );
}

export function TeamActivityWidget() {
  // Mock data
  const recentActivity = [
    { user: "Sarah", action: "Updated SDS", product: "Rose Elixir", time: "2h ago" },
    { user: "Mike", action: "Added photos", product: "Cedar Mist", time: "4h ago" },
    { user: "Emma", action: "Approved cert", product: "Lavender Dream", time: "1d ago" },
  ];
  
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Team Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentActivity.map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                {item.user[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate">
                  <span className="font-medium">{item.user}</span> {item.action}
                </p>
                <p className="text-xs text-muted-foreground">{item.product} • {item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CREATIVE WIDGETS
// ═══════════════════════════════════════════════════════════════════════════════

export function ContentQueueWidget() {
  const navigate = useNavigate();
  
  const queueItems = [
    { title: "Product photoshoot", product: "New Collection", due: "Tomorrow", priority: "high" },
    { title: "Social media pack", product: "Rose Elixir", due: "3 days", priority: "medium" },
    { title: "Email banner", product: "Summer Sale", due: "Next week", priority: "low" },
  ];
  
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Palette className="w-4 h-4 text-purple-600" />
            Content Queue
          </CardTitle>
          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
            {queueItems.length} pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {queueItems.map((item, i) => (
            <div 
              key={i} 
              className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
            >
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.product}</p>
              </div>
              <div className="text-right">
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    item.priority === "high" && "border-red-200 text-red-700",
                    item.priority === "medium" && "border-yellow-200 text-yellow-700",
                    item.priority === "low" && "border-green-200 text-green-700"
                  )}
                >
                  {item.due}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-4"
          onClick={() => navigate("/create")}
        >
          Create Content
        </Button>
      </CardContent>
    </Card>
  );
}

export function ReviewNeededWidget() {
  const items = [
    { type: "Image", product: "Cedar Mist", by: "AI Generated" },
    { type: "Copy", product: "Rose Elixir", by: "Madison" },
  ];
  
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Eye className="w-4 h-4 text-purple-600" />
          Needs Review
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg border border-dashed border-purple-200 bg-purple-50/50">
              <Image className="w-4 h-4 text-purple-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">{item.type} for {item.product}</p>
                <p className="text-xs text-muted-foreground">Generated by {item.by}</p>
              </div>
              <Button size="sm" variant="outline" className="text-xs">
                Review
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPLIANCE WIDGETS
// ═══════════════════════════════════════════════════════════════════════════════

export function SDSStatusWidget() {
  const navigate = useNavigate();
  
  const sdsStatus = {
    current: 12,
    outdated: 3,
    missing: 2,
  };
  
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            SDS Status
          </CardTitle>
          {sdsStatus.outdated > 0 && (
            <Badge variant="destructive" className="text-xs">
              {sdsStatus.outdated} outdated
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-green-50 border border-green-200">
            <p className="text-2xl font-bold text-green-700">{sdsStatus.current}</p>
            <p className="text-xs text-green-600">Current</p>
          </div>
          <div className="p-2 rounded-lg bg-yellow-50 border border-yellow-200">
            <p className="text-2xl font-bold text-yellow-700">{sdsStatus.outdated}</p>
            <p className="text-xs text-yellow-600">Outdated</p>
          </div>
          <div className="p-2 rounded-lg bg-red-50 border border-red-200">
            <p className="text-2xl font-bold text-red-700">{sdsStatus.missing}</p>
            <p className="text-xs text-red-600">Missing</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-4"
          onClick={() => navigate("/products")}
        >
          Review SDS Documents
        </Button>
      </CardContent>
    </Card>
  );
}

export function ExpiringCertsWidget() {
  const expiringCerts = [
    { name: "Leaping Bunny", product: "All Products", expires: "Jan 15, 2025" },
    { name: "USDA Organic", product: "Rose Elixir", expires: "Feb 1, 2025" },
  ];
  
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600" />
          Expiring Certifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {expiringCerts.map((cert, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-yellow-50 border border-yellow-200">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">{cert.name}</p>
                <p className="text-xs text-muted-foreground">{cert.product}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-yellow-700">{cert.expires}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function AllergenAlertsWidget() {
  const alerts = [
    { ingredient: "Limonene", products: 5, level: "EU Allergen" },
    { ingredient: "Linalool", products: 3, level: "EU Allergen" },
  ];
  
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-blue-600" />
          Allergen Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium">{alert.ingredient}</p>
                <p className="text-xs text-muted-foreground">{alert.level}</p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {alert.products} products
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MARKETING WIDGETS
// ═══════════════════════════════════════════════════════════════════════════════

export function ScheduledPostsWidget() {
  const navigate = useNavigate();
  
  const scheduledPosts = [
    { platform: "Instagram", content: "Product Launch", time: "Today 2pm" },
    { platform: "Facebook", content: "Behind the Scenes", time: "Tomorrow 10am" },
    { platform: "LinkedIn", content: "Brand Story", time: "Wed 9am" },
  ];
  
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4 text-green-600" />
            Scheduled Posts
          </CardTitle>
          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
            {scheduledPosts.length} upcoming
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {scheduledPosts.map((post, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
              <Megaphone className="w-4 h-4 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">{post.content}</p>
                <p className="text-xs text-muted-foreground">{post.platform}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {post.time}
              </Badge>
            </div>
          ))}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-4"
          onClick={() => navigate("/calendar")}
        >
          View Calendar
        </Button>
      </CardContent>
    </Card>
  );
}

export function CampaignPerformanceWidget() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-600" />
          Campaign Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Engagement Rate</span>
            <span className="text-sm font-medium">4.2%</span>
          </div>
          <Progress value={42} className="h-2" />
          
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-muted-foreground">Reach (7 days)</span>
            <span className="text-sm font-medium">12.5K</span>
          </div>
          <Progress value={65} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FINANCE WIDGETS
// ═══════════════════════════════════════════════════════════════════════════════

export function RevenueMetricsWidget() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-yellow-600" />
          Revenue Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">$24.5K</p>
            <p className="text-xs text-muted-foreground">This Month</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold text-green-600">+12%</p>
            <p className="text-xs text-muted-foreground">vs Last Month</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MarginTrackingWidget() {
  const products = [
    { name: "Rose Elixir", margin: 68 },
    { name: "Cedar Mist", margin: 72 },
    { name: "Lavender Dream", margin: 65 },
  ];
  
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-yellow-600" />
          Product Margins
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {products.map((product, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{product.name}</span>
                <span className="font-medium">{product.margin}%</span>
              </div>
              <Progress value={product.margin} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROLE-BASED WIDGET CONTAINER
// ═══════════════════════════════════════════════════════════════════════════════

interface RoleDashboardWidgetsProps {
  className?: string;
}

/**
 * RoleDashboardWidgets - Renders widgets based on user's team role
 */
export function RoleDashboardWidgets({ className }: RoleDashboardWidgetsProps) {
  const { teamRole, capabilities } = useUserRole();
  
  // Get widgets for this role
  const widgets = capabilities.dashboardWidgets;
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Role header */}
      <div className="flex items-center gap-2">
        <RoleBadge size="sm" />
        <span className="text-sm text-muted-foreground">Dashboard</span>
      </div>
      
      {/* Render role-specific widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {widgets.includes("pipeline_overview") && <PipelineOverviewWidget />}
        {widgets.includes("team_activity") && <TeamActivityWidget />}
        {widgets.includes("content_queue") && <ContentQueueWidget />}
        {widgets.includes("review_needed") && <ReviewNeededWidget />}
        {widgets.includes("sds_status") && <SDSStatusWidget />}
        {widgets.includes("expiring_certs") && <ExpiringCertsWidget />}
        {widgets.includes("allergen_alerts") && <AllergenAlertsWidget />}
        {widgets.includes("scheduled_posts") && <ScheduledPostsWidget />}
        {widgets.includes("campaign_performance") && <CampaignPerformanceWidget />}
        {widgets.includes("revenue_metrics") && <RevenueMetricsWidget />}
        {widgets.includes("margin_tracking") && <MarginTrackingWidget />}
      </div>
    </div>
  );
}
