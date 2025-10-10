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
      <div className="max-w-6xl mx-auto px-8 py-10">
        
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h1 className="font-serif text-4xl font-medium text-ink-black">
              Welcome back, Sample Brand
            </h1>
            <div className="flex items-center gap-2 px-4 py-2 bg-parchment-white rounded-lg border border-warm-gray/20">
              <span className="text-2xl">🔥</span>
              <span className="font-medium text-sm text-charcoal">5-day streak!</span>
            </div>
          </div>
          <p className="text-warm-gray text-base">
            Your editorial command center
          </p>
        </div>

        {/* Priority Action - HERO ELEMENT */}
        {showPriorityCard && (
          <div className="bg-gradient-to-br from-brass to-brass-glow rounded-xl p-8 shadow-lg mb-8">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="w-8 h-8 text-ink-black" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-black/70">
                    Priority Action
                  </span>
                  <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium text-ink-black">
                    5 min
                  </span>
                </div>
                <h2 className="font-serif text-3xl font-medium text-ink-black mb-3 leading-tight">
                  Schedule Your Noir de-Nuit Launch Campaign
                </h2>
                <p className="text-base text-ink-black/80 mb-6 leading-relaxed">
                  You have 4 beautiful Instagram posts showcasing your new evening fragrance. 
                  Let's get them scheduled for the week ahead to build anticipation for the launch.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => navigate('/schedule')}
                    className="px-6 py-3 bg-ink-black hover:bg-charcoal text-parchment-white font-medium rounded-lg transition-all"
                  >
                    Schedule Now →
                  </button>
                  <button 
                    onClick={() => setShowPriorityCard(false)}
                    className="px-6 py-3 bg-white/20 hover:bg-white/30 text-ink-black font-medium rounded-lg transition-all"
                  >
                    Not Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Editorial Director - Subtle Support */}
        {showEditorialBanner && (
          <div className="bg-parchment-white border-l-4 border-brass p-6 rounded-lg mb-8 shadow-sm relative">
            <button
              onClick={() => setShowEditorialBanner(false)}
              className="absolute top-4 right-4 text-warm-gray hover:text-charcoal transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brass/15 rounded-lg flex items-center justify-center flex-shrink-0">
                <PenTool className="w-6 h-6 text-brass" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-brass mb-1">
                  Editorial Director
                </div>
                <p className="text-sm text-charcoal leading-relaxed">
                  Welcome! I'll guide you through your content journey and help you make the most of your work.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          
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
