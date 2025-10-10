import { useState } from "react";
import { X, Lightbulb, Calendar, Archive, Instagram, Mail, Twitter, Pencil, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardRecentActivity } from "@/components/dashboard/DashboardRecentActivity";
import { DashboardWeeklyStats } from "@/components/dashboard/DashboardWeeklyStats";

export default function DashboardNew() {
  const navigate = useNavigate();
  const [showEditorialBanner, setShowEditorialBanner] = useState(true);
  const [showPriorityCard, setShowPriorityCard] = useState(true);

  return (
    <div className="min-h-screen bg-vellum-cream">
      <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
        {/* Header with Streak */}
        <div className="flex items-start justify-between pb-6 border-b border-warm-gray/20">
          <div>
            <h1 className="text-5xl font-serif font-semibold text-ink-black mb-2">
              Welcome back, Sample Brand
            </h1>
            <p className="text-warm-gray text-lg">Your editorial command center</p>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-aged-brass/20 shadow-level-1">
            <span className="text-2xl">🔥</span>
            <span className="font-semibold text-ink-black">5-day streak!</span>
          </div>
        </div>

        {/* Quick Actions Toolbar */}
        <div className="flex gap-3">
          <Button 
            onClick={() => navigate('/create')}
            variant="outline"
            className="border-aged-brass text-aged-brass hover:bg-aged-brass hover:text-ink-black transition-colors"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Create Content
          </Button>
          
          <Button 
            onClick={() => navigate('/schedule')}
            variant="outline"
            className="border-aged-brass text-aged-brass hover:bg-aged-brass hover:text-ink-black transition-colors"
          >
            <Calendar className="w-4 h-4 mr-2" />
            View Calendar
          </Button>
          
          <Button 
            onClick={() => navigate('/templates')}
            variant="outline"
            className="border-aged-brass text-aged-brass hover:bg-aged-brass hover:text-ink-black transition-colors"
          >
            <FileText className="w-4 h-4 mr-2" />
            Browse Templates
          </Button>
        </div>

        {/* Editorial Director Banner */}
        {showEditorialBanner && (
          <Card className="bg-ink-black text-white p-6 mb-6 border-none shadow-level-2">
            <button
              onClick={() => setShowEditorialBanner(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-aged-brass rounded-full flex items-center justify-center shrink-0">
                <Lightbulb className="w-6 h-6 text-ink-black" />
              </div>
              <div>
                <p className="text-aged-brass text-xs font-bold uppercase tracking-wide mb-2">
                  EDITORIAL DIRECTOR
                </p>
                <p className="text-white/90 text-lg">
                  Welcome! I'm your Editorial Director. I'll guide you through your content journey and help you make the most of your work.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Priority Action Card */}
        {showPriorityCard && (
          <Card 
            className="p-8 mb-6 border-none shadow-level-2 relative"
            style={{
              background: "linear-gradient(135deg, hsl(var(--aged-brass)), hsl(var(--antique-gold)))"
            }}
          >
            <button
              onClick={() => setShowPriorityCard(false)}
              className="absolute top-4 right-4 text-ink-black/70 hover:text-ink-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-level-1">
                <Calendar className="w-8 h-8 text-ink-black" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <p className="text-ink-black text-sm font-bold uppercase tracking-wide">
                    PRIORITY ACTION 1 OF 3 • 5 MIN
                  </p>
                </div>
                
                <h2 className="text-3xl font-serif font-semibold text-ink-black mb-3">
                  Schedule Your Noir de-Nuit Launch Campaign
                </h2>
                
                <p className="text-ink-black/80 text-lg mb-6">
                  You have 4 beautiful Instagram posts showcasing your new evening fragrance. Let's get them scheduled for the week ahead to build anticipation for the launch.
                </p>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={() => navigate('/schedule')}
                    className="bg-ink-black hover:bg-charcoal text-white font-semibold px-6 py-3 h-auto"
                  >
                    Schedule Now
                  </Button>
                  <Button 
                    onClick={() => setShowPriorityCard(false)}
                    variant="outline" 
                    className="bg-white/50 hover:bg-white text-ink-black border-ink-black/20 font-semibold px-6 py-3 h-auto"
                  >
                    Not Now
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Content Bank */}
        <Card className="p-6 bg-white border border-ink-black/10 shadow-level-1">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-aged-brass/10 rounded-lg flex items-center justify-center">
                <Archive className="w-5 h-5 text-aged-brass" />
              </div>
              <div>
                <h3 className="text-xl font-serif font-semibold text-ink-black">Content Bank</h3>
                <p className="text-warm-gray text-sm">Ready to schedule or review</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/library')}
              className="text-aged-brass hover:text-antique-gold font-semibold text-sm transition-colors"
            >
              View All →
            </button>
          </div>

          <div className="space-y-3">
            {[
              { 
                icon: Instagram,
                title: "Noir-de-Nuit-Nuil Instagram Post",
                count: "4 pieces ready",
                color: "text-purple-600 bg-purple-50"
              },
              { 
                icon: Mail,
                title: "Lumière Dusk Email Campaign",
                count: "3 pieces ready",
                color: "text-blue-600 bg-blue-50"
              },
              { 
                icon: Twitter,
                title: "Jardin-Secret Twitter Thread",
                count: "8 pieces ready",
                color: "text-sky-600 bg-sky-50"
              },
            ].map((item, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 bg-vellum-cream rounded-lg hover:bg-parchment-white transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-ink-black">{item.title}</p>
                    <p className="text-sm text-warm-gray">{item.count}</p>
                  </div>
                </div>
                <Badge className="bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20">
                  ready
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity & Insights */}
        <div className="bg-white rounded-xl border border-warm-gray/20 p-8 shadow-level-1">
          <h2 className="text-2xl font-serif text-ink-black mb-6">
            Recent Activity & Insights
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Recent Content - 60% width (3 cols) */}
            <div className="lg:col-span-3">
              <DashboardRecentActivity />
            </div>
            
            {/* Weekly Stats - 40% width (2 cols) */}
            <div className="lg:col-span-2">
              <DashboardWeeklyStats />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
