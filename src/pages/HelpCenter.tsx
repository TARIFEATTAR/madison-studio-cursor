import { useState } from "react";
import { BookOpen, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { VideoCard } from "@/components/help/VideoCard";
import { VideoModal } from "@/components/help/VideoModal";
import { HelpVideo, VideoCategory, categoryLabels, getVideosByCategory, searchVideos } from "@/config/helpVideos";

export default function HelpCenter() {
  const [selectedVideo, setSelectedVideo] = useState<HelpVideo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<VideoCategory>("getting-started");

  const handleVideoClick = (video: HelpVideo) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const handleVideoSelect = (video: HelpVideo) => {
    setSelectedVideo(video);
    // Update tab if video is from different category
    if (video.category !== activeTab) {
      setActiveTab(video.category);
    }
  };

  // Get videos to display
  const displayVideos = searchQuery.trim() 
    ? searchVideos(searchQuery)
    : getVideosByCategory(activeTab);

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[hsl(var(--ink-black))] to-[hsl(var(--charcoal))] border-b border-[hsl(var(--aged-brass))]/20">
        <div className="container mx-auto px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-md bg-[hsl(var(--aged-brass))]/10 border border-[hsl(var(--aged-brass))]/30 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-[hsl(var(--aged-brass))]" />
            </div>
            <div>
              <h1 className="font-serif text-4xl font-light tracking-wide text-[hsl(var(--parchment-white))]">
                Help Center
              </h1>
              <p className="text-[hsl(var(--parchment-white))]/70 text-sm mt-1">
                Video guides to master Madison Studio
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="max-w-xl mt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--warm-gray))]" />
              <Input
                type="text"
                placeholder="Search tutorials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[hsl(var(--parchment-white))] border-[#E8DCC8] focus:border-[hsl(var(--aged-brass))]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-8 py-8">
        {searchQuery.trim() ? (
          // Search Results
          <div>
            <p className="text-sm text-[hsl(var(--warm-gray))] mb-6">
              Found {displayVideos.length} {displayVideos.length === 1 ? 'video' : 'videos'} for "{searchQuery}"
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onClick={() => handleVideoClick(video)}
                />
              ))}
            </div>
            {displayVideos.length === 0 && (
              <div className="text-center py-12">
                <p className="text-[hsl(var(--warm-gray))] font-serif">
                  No videos found matching your search.
                </p>
              </div>
            )}
          </div>
        ) : (
          // Category Tabs
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as VideoCategory)}>
            <TabsList className="bg-[hsl(var(--parchment-white))] border border-[#E8DCC8] mb-8">
              {(Object.entries(categoryLabels) as [VideoCategory, string][]).map(([key, label]) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="data-[state=active]:bg-[hsl(var(--aged-brass))] data-[state=active]:text-[hsl(var(--ink-black))]"
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            {(Object.keys(categoryLabels) as VideoCategory[]).map((category) => (
              <TabsContent key={category} value={category}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getVideosByCategory(category).map((video) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      onClick={() => handleVideoClick(video)}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>

      {/* Video Modal */}
      <VideoModal
        video={selectedVideo}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onVideoSelect={handleVideoSelect}
      />
    </div>
  );
}
