import { useState } from "react";
import { X, PenTool, Calendar, Archive, Instagram, Mail, Twitter, Pencil, FileText } from "lucide-react";
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

        {/* Quick Actions Cards */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          
          <button 
            onClick={() => navigate('/create')}
            className="bg-parchment-white border-2 border-warm-gray/20 hover:border-brass p-6 rounded-xl transition-all hover:shadow-md group"
          >
            <PenTool className="w-8 h-8 text-brass mb-3 group-hover:scale-110 transition-transform" />
            <div className="text-base font-medium text-charcoal">Create Content</div>
          </button>

          <button 
            onClick={() => navigate('/schedule')}
            className="bg-parchment-white border-2 border-warm-gray/20 hover:border-brass p-6 rounded-xl transition-all hover:shadow-md group"
          >
            <Calendar className="w-8 h-8 text-brass mb-3 group-hover:scale-110 transition-transform" />
            <div className="text-base font-medium text-charcoal">View Calendar</div>
          </button>

          <button 
            onClick={() => navigate('/templates')}
            className="bg-parchment-white border-2 border-warm-gray/20 hover:border-brass p-6 rounded-xl transition-all hover:shadow-md group"
          >
            <FileText className="w-8 h-8 text-brass mb-3 group-hover:scale-110 transition-transform" />
            <div className="text-base font-medium text-charcoal">Browse Templates</div>
          </button>

        </div>

        {/* Editorial Director Banner */}
        {showEditorialBanner && (
          <div className="bg-parchment-white border-l-4 border-aged-brass p-6 rounded-lg mb-8 shadow-sm relative">
            <button
              onClick={() => setShowEditorialBanner(false)}
              className="absolute top-4 right-4 text-warm-gray hover:text-charcoal transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              {/* Brass circle with pen icon */}
              <div className="w-14 h-14 bg-aged-brass/10 rounded-full flex items-center justify-center flex-shrink-0">
                <PenTool className="w-6 h-6 text-aged-brass" />
              </div>
              
              {/* Content */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-aged-brass mb-1">
                  Editorial Director
                </div>
                <p className="text-sm text-charcoal leading-relaxed">
                  Welcome! I'll guide you through your content journey and help you make the most of your work.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Priority Action Card */}
        {showPriorityCard && (
          <div className="bg-gradient-to-br from-brass to-brass-glow rounded-xl p-8 shadow-lg mb-10 relative">
            <button
              onClick={() => setShowPriorityCard(false)}
              className="absolute top-4 right-4 text-ink-black/70 hover:text-ink-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="w-8 h-8 text-white" />
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
          </div>
        )}

        {/* Content Bank */}
        <div className="bg-parchment-white border border-warm-gray/20 rounded-xl p-6">
          
          {/* Header - Cleaner */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-warm-gray/20">
            <div className="flex items-center gap-3">
              <Archive className="w-5 h-5 text-brass" />
              <h3 className="font-serif text-xl font-medium text-ink-black">Content Bank</h3>
            </div>
            <button 
              onClick={() => navigate('/library')}
              className="text-sm text-brass hover:text-brass-glow font-medium transition-colors"
            >
              View All →
            </button>
          </div>

          {/* Content Items */}
          <div className="space-y-2">
            {[
              { 
                icon: Instagram,
                title: "Noir-de-Nuit Instagram Post",
                count: "4 pieces ready",
                color: "bg-purple-100 text-purple-600"
              },
              { 
                icon: Mail,
                title: "Lumière Dusk Email Campaign",
                count: "3 pieces ready",
                color: "bg-blue-100 text-blue-600"
              },
              { 
                icon: Twitter,
                title: "Jardin-Secret Twitter Thread",
                count: "8 pieces ready",
                color: "bg-sky-100 text-sky-600"
              },
            ].map((item, index) => (
              <div 
                key={index}
                className="flex items-center gap-4 p-4 rounded-lg hover:bg-vellum-cream transition-all cursor-pointer group"
              >
                
                <div className={`w-12 h-12 rounded-lg ${item.color} flex items-center justify-center flex-shrink-0`}>
                  <item.icon className="w-6 h-6" />
                </div>

                <div className="flex-1">
                  <h4 className="text-sm font-medium text-charcoal mb-1 group-hover:text-brass transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-warm-gray">{item.count}</p>
                </div>

                {/* Badge - More Subtle */}
                <div className="px-3 py-1 bg-brass/10 text-brass text-xs font-medium rounded-full">
                  Ready
                </div>

              </div>
            ))}
          </div>
        </div>

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
