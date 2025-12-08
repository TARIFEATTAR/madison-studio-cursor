/**
 * HELP CENTER VIDEO CONFIGURATION
 * Video tutorials for Madison users
 */

export type VideoCategory = 
  | 'getting-started'
  | 'content-creation'
  | 'multiply'
  | 'image-studio'
  | 'video'
  | 'library'
  | 'calendar'
  | 'settings';

export interface HelpVideo {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: VideoCategory;
  thumbnailUrl?: string;
  videoUrl: string; // Loom embed URL
  order: number;
  keywords: string[];
}

export const categoryLabels: Record<VideoCategory, string> = {
  'getting-started': 'Getting Started',
  'content-creation': 'Content Creation',
  'multiply': 'Multiply',
  'image-studio': 'Image Studio',
  'video': 'Video',
  'library': 'Library',
  'calendar': 'Calendar',
  'settings': 'Settings',
};

// Recommended order for Help Center tabs (matches learning path)
export const orderedCategories: VideoCategory[] = [
  'getting-started',
  'settings',
  'content-creation',
  'multiply',
  'image-studio',
  'video',
  'library',
  'calendar',
];

export const helpVideos: HelpVideo[] = [
  // Getting Started
  {
    id: 'welcome-to-madison',
    title: 'Welcome to Madison',
    description: 'Get a complete overview of Madison and learn how it transforms your content creation workflow.',
    duration: '4:30',
    category: 'getting-started',
    videoUrl: 'https://www.loom.com/embed/placeholder', // Replace with actual Loom URL
    order: 1,
    keywords: ['welcome', 'overview', 'introduction', 'getting started'],
  },
  {
    id: 'setting-up-brand-identity',
    title: 'Setting Up Your Brand Identity',
    description: 'Complete brand setup journey: from onboarding quick start through deep brand configuration in Settings.',
    duration: '6:30',
    category: 'getting-started',
    videoUrl: 'https://www.loom.com/embed/placeholder',
    order: 2,
    keywords: ['brand', 'setup', 'identity', 'guidelines', 'voice', 'onboarding', 'brand dna scan'],
  },
  {
    id: 'understanding-brand-guidelines',
    title: 'Understanding Brand Guidelines',
    description: 'Learn what information Madison needs in your brand guidelines and see examples of well-structured documentation.',
    duration: '3:30',
    category: 'getting-started',
    videoUrl: 'https://www.loom.com/embed/placeholder',
    order: 3,
    keywords: ['brand guidelines', 'documentation', 'templates', 'structure'],
  },

  // Content Creation
  {
    id: 'creating-first-content',
    title: 'Creating Your First Content',
    description: 'Step-by-step guide to creating master content in the Forge.',
    duration: '4:00',
    category: 'content-creation',
    videoUrl: 'https://www.loom.com/embed/placeholder',
    order: 3,
    keywords: ['create', 'forge', 'master content', 'writing'],
  },
  {
    id: 'understanding-content-worksheets',
    title: 'Understanding Content Worksheets',
    description: 'Learn how to use structured worksheets to streamline your content creation process.',
    duration: '3:30',
    category: 'content-creation',
    videoUrl: 'https://www.loom.com/embed/placeholder',
    order: 4,
    keywords: ['worksheet', 'template', 'structured', 'process'],
  },
  {
    id: 'product-based-content',
    title: 'Creating Product-Based Content',
    description: 'How to create compelling content linked to your products.',
    duration: '4:30',
    category: 'content-creation',
    videoUrl: 'https://www.loom.com/embed/placeholder',
    order: 5,
    keywords: ['product', 'ecommerce', 'catalog', 'content'],
  },
  {
    id: 'madison-editorial-director',
    title: 'Working with Madison (Editorial Director)',
    description: 'Discover how Madison assists with ideation, refinement, and content strategy.',
    duration: '5:00',
    category: 'content-creation',
    videoUrl: 'https://www.loom.com/embed/placeholder',
    order: 6,
    keywords: ['madison', 'assistant', 'ai', 'editorial', 'help'],
  },

  // Multiply
  {
    id: 'what-is-multiply',
    title: 'What is Multiply?',
    description: 'Overview of the Multiply page workflow: selecting master content, choosing derivatives, generating, and editing platform-specific versions.',
    duration: '4:00',
    category: 'multiply',
    videoUrl: 'https://www.loom.com/embed/placeholder',
    order: 7,
    keywords: ['multiply', 'overview', 'workflow', 'introduction'],
  },
  {
    id: 'understanding-derivatives',
    title: 'Understanding Derivatives',
    description: 'Explains what derivatives are, the different types available (Instagram, Email, Product descriptions, etc.), and how they adapt your master content for each platform.',
    duration: '4:30',
    category: 'multiply',
    videoUrl: 'https://www.loom.com/embed/placeholder',
    order: 8,
    keywords: ['derivatives', 'types', 'platforms', 'formats'],
  },
  {
    id: 'understanding-smart-amplify',
    title: 'Understanding Smart Amplify',
    description: "Learn how Madison's AI analyzes your content and recommends the best derivative types for maximum reach and engagement.",
    duration: '4:45',
    category: 'multiply',
    videoUrl: 'https://www.loom.com/embed/placeholder',
    order: 9,
    keywords: ['smart amplify', 'ai', 'recommendations', 'intelligence'],
  },
  {
    id: 'customizing-derivatives',
    title: 'Customizing Derivatives',
    description: 'How to edit, regenerate, and perfect your derivative content.',
    duration: '3:30',
    category: 'multiply',
    videoUrl: 'https://www.loom.com/embed/placeholder',
    order: 10,
    keywords: ['edit', 'customize', 'derivatives', 'refine'],
  },
  {
    id: 'derivative-quality-ratings',
    title: 'Using Quality Ratings & Feedback',
    description: 'Rate derivatives and provide feedback to improve future generations.',
    duration: '2:30',
    category: 'multiply',
    videoUrl: 'https://www.loom.com/embed/placeholder',
    order: 9,
    keywords: ['quality', 'rating', 'feedback', 'improve'],
  },

  // Image Studio (Dark Room)
  {
    id: 'image-studio-overview',
    title: 'Introduction to Image Studio',
    description: 'Overview of the Dark Room: AI-powered product photography and lifestyle imagery creation.',
    duration: '5:00',
    category: 'image-studio',
    videoUrl: 'https://www.loom.com/embed/placeholder',
    order: 20,
    keywords: ['image studio', 'dark room', 'ai images', 'photography', 'overview'],
  },
  {
    id: 'uploading-product-images',
    title: 'Uploading Product & Reference Images',
    description: 'Learn how to upload product photos, background scenes, and style references for AI generation.',
    duration: '3:30',
    category: 'image-studio',
    videoUrl: 'https://www.loom.com/embed/placeholder',
    order: 21,
    keywords: ['upload', 'product image', 'reference', 'background', 'style'],
  },
  {
    id: 'ai-image-generation',
    title: 'Generating AI Images',
    description: 'Write prompts and generate stunning product photography with multiple AI models.',
    duration: '4:30',
    category: 'image-studio',
    videoUrl: 'https://www.loom.com/embed/placeholder',
    order: 22,
    keywords: ['generate', 'ai', 'prompt', 'create', 'photography'],
  },
  {
    id: 'pro-settings-image',
    title: 'Pro Settings: Camera, Lighting & Models',
    description: 'Master the pro controls: camera angles, lighting setups, AI models (Gemini, Freepik Mystic, Seedream), and resolutions.',
    duration: '5:30',
    category: 'image-studio',
    videoUrl: 'https://www.loom.com/embed/placeholder',
    order: 23,
    keywords: ['pro settings', 'camera', 'lighting', 'freepik', 'mystic', 'seedream', 'resolution', 'ai model'],
  },
  {
    id: 'image-library-management',
    title: 'Managing Your Image Library',
    description: 'View, organize, download, and manage all your generated images in one place.',
    duration: '3:00',
    category: 'image-studio',
    videoUrl: 'https://www.loom.com/embed/placeholder',
    order: 24,
    keywords: ['image library', 'organize', 'download', 'manage', 'gallery'],
  },
  {
    id: 'image-editor-refinements',
    title: 'Refining Images with the Editor',
    description: 'Use the image editor modal to generate variations, refine with AI, and create video from images.',
    duration: '4:00',
    category: 'image-studio',
    videoUrl: 'https://www.loom.com/embed/placeholder',
    order: 25,
    keywords: ['editor', 'refine', 'variations', 'edit', 'modal'],
  },

  // Video
  {
    id: 'video-overview',
    title: 'Introduction to Video Creation',
    description: 'Transform your generated images into eye-catching videos for social media.',
    duration: '4:00',
    category: 'video',
    videoUrl: 'https://www.loom.com/embed/placeholder',
    order: 30,
    keywords: ['video', 'motion', 'animation', 'introduction', 'overview'],
  },
  {
    id: 'image-to-video',
    title: 'Creating Videos from Images',
    description: 'Step-by-step guide to converting any image into a dynamic video with motion prompts.',
    duration: '4:30',
    category: 'video',
    videoUrl: 'https://www.loom.com/embed/placeholder',
    order: 31,
    keywords: ['image to video', 'convert', 'motion', 'animate', 'create'],
  },
  {
    id: 'video-motion-prompts',
    title: 'Writing Effective Motion Prompts',
    description: 'Learn how to describe camera movements, lighting shifts, and ambient effects for best results.',
    duration: '3:30',
    category: 'video',
    videoUrl: 'https://www.loom.com/embed/placeholder',
    order: 32,
    keywords: ['motion prompt', 'camera movement', 'effects', 'description', 'writing'],
  },
  {
    id: 'video-settings',
    title: 'Video Settings: Duration, Resolution & Models',
    description: 'Configure video duration (4-10s), resolution (480p-1080p), and choose AI models.',
    duration: '3:00',
    category: 'video',
    videoUrl: 'https://www.loom.com/embed/placeholder',
    order: 33,
    keywords: ['video settings', 'duration', 'resolution', 'model', 'configuration'],
  },
  {
    id: 'exporting-videos',
    title: 'Exporting & Using Your Videos',
    description: 'Download your videos and use them across Instagram Reels, TikTok, and email campaigns.',
    duration: '2:30',
    category: 'video',
    videoUrl: 'https://www.loom.com/embed/placeholder',
    order: 34,
    keywords: ['export', 'download', 'reels', 'tiktok', 'social media'],
  },

  // Library
  {
    id: 'organizing-content-library',
    title: 'Organizing Your Content Library',
    description: 'Master the Archives: filtering, sorting, and finding your content.',
    duration: '3:45',
    category: 'library',
    videoUrl: 'https://www.loom.com/embed/placeholder',
    order: 40,
    keywords: ['library', 'archives', 'organize', 'filter', 'search'],
  },
  {
    id: 'exporting-content',
    title: 'Exporting & Downloading Content',
    description: 'Learn all the ways to export your content for use across platforms.',
    duration: '3:00',
    category: 'library',
    videoUrl: 'https://www.loom.com/embed/placeholder',
    order: 41,
    keywords: ['export', 'download', 'save', 'share'],
  },

  // Calendar
  {
    id: 'scheduling-content',
    title: 'Scheduling Content',
    description: 'Plan your content calendar and schedule posts strategically.',
    duration: '4:15',
    category: 'calendar',
    videoUrl: 'https://www.loom.com/embed/placeholder',
    order: 50,
    keywords: ['schedule', 'calendar', 'plan', 'timeline'],
  },
  {
    id: 'google-calendar-integration',
    title: 'Google Calendar Integration',
    description: 'Connect Madison with Google Calendar for seamless workflow management.',
    duration: '3:30',
    category: 'calendar',
    videoUrl: 'https://www.loom.com/embed/placeholder',
    order: 51,
    keywords: ['google', 'calendar', 'sync', 'integration'],
  },

  // Settings
  {
    id: 'managing-products',
    title: 'Managing Products & Catalog',
    description: 'Add, organize, and leverage your product catalog for content creation.',
    duration: '4:00',
    category: 'settings',
    videoUrl: 'https://www.loom.com/embed/placeholder',
    order: 60,
    keywords: ['products', 'catalog', 'manage', 'inventory'],
  },
  {
    id: 'collections-organization',
    title: 'Using Collections for Organization',
    description: 'Create custom collections to categorize your content effectively.',
    duration: '3:15',
    category: 'settings',
    videoUrl: 'https://www.loom.com/embed/placeholder',
    order: 61,
    keywords: ['collections', 'categories', 'organize', 'tags'],
  },
  {
    id: 'team-collaboration',
    title: 'Team Collaboration & Permissions',
    description: 'Invite team members and manage collaboration settings.',
    duration: '3:45',
    category: 'settings',
    videoUrl: 'https://www.loom.com/embed/placeholder',
    order: 62,
    keywords: ['team', 'invite', 'collaborate', 'permissions'],
  },
];

// Helper function to get videos by category
export const getVideosByCategory = (category: VideoCategory): HelpVideo[] => {
  return helpVideos
    .filter(video => video.category === category)
    .sort((a, b) => a.order - b.order);
};

// Helper function to search videos
export const searchVideos = (query: string): HelpVideo[] => {
  const lowerQuery = query.toLowerCase();
  return helpVideos.filter(video => 
    video.title.toLowerCase().includes(lowerQuery) ||
    video.description.toLowerCase().includes(lowerQuery) ||
    video.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery))
  );
};
