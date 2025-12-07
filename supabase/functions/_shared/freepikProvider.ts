/**
 * Freepik API Provider for Madison Studio
 * 
 * Provides access to Freepik's AI image and video generation services:
 * - Mystic: Photorealistic images up to 4K
 * - Flux Dev/Pro: Fast, high-quality images
 * - Seedance: Image-to-video conversion
 * - Upscaler: 2x-16x image upscaling
 * - Relight: AI-powered relighting
 * 
 * API Docs: https://docs.freepik.com/
 */

const FREEPIK_API_BASE = "https://api.freepik.com/v1/ai";

// ============================================
// TYPES
// ============================================

export type FreepikModel = 
  | "mystic" 
  | "flux-dev" 
  | "flux-pro-v1-1";

export type FreepikResolution = "1k" | "2k" | "4k";

export type FreepikAspectRatio = 
  | "square_1_1" 
  | "classic_4_3" 
  | "traditional_3_4" 
  | "widescreen_16_9" 
  | "social_story_9_16"
  | "film_horizontal_21_9"
  | "film_vertical_9_21";

export type VideoDuration = "5" | "10";

export type VideoResolution = "720p" | "1080p";

export interface FreepikImageParams {
  prompt: string;
  model?: FreepikModel;
  resolution?: FreepikResolution;
  aspectRatio?: FreepikAspectRatio;
  seed?: number;
  webhookUrl?: string;
  // Mystic-specific
  styling?: {
    effects?: string;
    color?: string;
    lighting?: string;
    framing?: string;
  };
}

export interface FreepikVideoParams {
  imageUrl: string;
  prompt: string;
  duration?: VideoDuration;
  aspectRatio?: FreepikAspectRatio;
  cameraFixed?: boolean;
  resolution?: VideoResolution;
  seed?: number;
  webhookUrl?: string;
}

export interface FreepikUpscaleParams {
  imageUrl: string;
  scale: 2 | 4 | 8 | 16;
  webhookUrl?: string;
}

export interface FreepikRelightParams {
  imageUrl: string;
  prompt?: string;
  lightMapUrl?: string;
  referenceImageUrl?: string;
  webhookUrl?: string;
}

export interface FreepikTaskResponse {
  data: {
    task_id: string;
    status: "CREATED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  };
}

export interface FreepikCompletedTask {
  data: {
    task_id: string;
    status: "COMPLETED";
    generated?: Array<{ url: string; content_type: string }>;
    result?: { url: string };
  };
}

export interface FreepikError {
  error: {
    code: string;
    message: string;
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getApiKey(): string {
  const key = Deno.env.get("FREEPIK_API_KEY");
  if (!key) {
    throw new Error("FREEPIK_API_KEY not configured");
  }
  return key;
}

function mapAspectRatio(ratio?: string): FreepikAspectRatio {
  if (!ratio) return "square_1_1";
  
  const mapping: Record<string, FreepikAspectRatio> = {
    "1:1": "square_1_1",
    "4:3": "classic_4_3",
    "3:4": "traditional_3_4",
    "16:9": "widescreen_16_9",
    "9:16": "social_story_9_16",
    "21:9": "film_horizontal_21_9",
    "9:21": "film_vertical_9_21",
    // Pass through if already in Freepik format
    "square_1_1": "square_1_1",
    "classic_4_3": "classic_4_3",
    "traditional_3_4": "traditional_3_4",
    "widescreen_16_9": "widescreen_16_9",
    "social_story_9_16": "social_story_9_16",
  };
  
  return mapping[ratio] || "square_1_1";
}

async function makeFreepikRequest<T>(
  endpoint: string,
  body: Record<string, unknown>,
  method: "POST" | "GET" = "POST"
): Promise<T> {
  const url = `${FREEPIK_API_BASE}${endpoint}`;
  
  console.log(`[Freepik] ${method} ${endpoint}`, { 
    bodyKeys: Object.keys(body),
    promptLength: typeof body.prompt === 'string' ? body.prompt.length : 0 
  });

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-freepik-api-key": getApiKey(),
    },
    body: method === "POST" ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error(`[Freepik] Error ${response.status}:`, errorData);
    throw new Error(
      errorData?.error?.message || 
      `Freepik API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

async function pollForCompletion(
  endpoint: string,
  taskId: string,
  maxAttempts = 60,
  intervalMs = 2000
): Promise<FreepikCompletedTask> {
  const statusUrl = `${endpoint}/${taskId}`;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(`${FREEPIK_API_BASE}${statusUrl}`, {
      method: "GET",
      headers: {
        "x-freepik-api-key": getApiKey(),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to check task status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[Freepik] Poll attempt ${attempt + 1}: ${data.data?.status}`);

    if (data.data?.status === "COMPLETED") {
      return data;
    }

    if (data.data?.status === "FAILED") {
      throw new Error("Freepik task failed");
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error("Freepik task timed out");
}

// ============================================
// IMAGE GENERATION
// ============================================

/**
 * Generate an image using Freepik's Mystic model (up to 4K)
 */
export async function generateWithMystic(
  params: FreepikImageParams
): Promise<{ imageUrl: string; taskId: string }> {
  const body: Record<string, unknown> = {
    prompt: params.prompt,
    aspect_ratio: mapAspectRatio(params.aspectRatio),
    resolution: params.resolution || "2k",
  };

  if (params.seed !== undefined && params.seed >= 0) {
    body.seed = params.seed;
  }

  if (params.styling) {
    body.styling = params.styling;
  }

  if (params.webhookUrl) {
    body.webhook_url = params.webhookUrl;
  }

  // Create the task
  const taskResponse = await makeFreepikRequest<FreepikTaskResponse>(
    "/mystic",
    body
  );

  const taskId = taskResponse.data.task_id;
  console.log(`[Freepik] Mystic task created: ${taskId}`);

  // Poll for completion
  const completed = await pollForCompletion("/mystic", taskId);
  
  const imageUrl = completed.data.generated?.[0]?.url;
  if (!imageUrl) {
    throw new Error("No image URL in Mystic response");
  }

  return { imageUrl, taskId };
}

/**
 * Generate an image using Freepik's Flux models (fast)
 */
export async function generateWithFlux(
  params: FreepikImageParams
): Promise<{ imageUrl: string; taskId: string }> {
  const model = params.model === "flux-pro-v1-1" ? "flux-pro-v1-1" : "flux-dev";
  const endpoint = `/text-to-image/${model}`;

  const body: Record<string, unknown> = {
    prompt: params.prompt,
    aspect_ratio: mapAspectRatio(params.aspectRatio),
  };

  if (params.seed !== undefined && params.seed >= 0) {
    body.seed = params.seed;
  }

  if (params.webhookUrl) {
    body.webhook_url = params.webhookUrl;
  }

  // Create the task
  const taskResponse = await makeFreepikRequest<FreepikTaskResponse>(
    endpoint,
    body
  );

  const taskId = taskResponse.data.task_id;
  console.log(`[Freepik] Flux task created: ${taskId}`);

  // Poll for completion
  const completed = await pollForCompletion(`/text-to-image/${model}`, taskId);
  
  const imageUrl = completed.data.generated?.[0]?.url;
  if (!imageUrl) {
    throw new Error("No image URL in Flux response");
  }

  return { imageUrl, taskId };
}

/**
 * Main image generation function - auto-selects model based on requirements
 */
export async function generateImage(
  params: FreepikImageParams
): Promise<{ imageUrl: string; taskId: string; model: FreepikModel }> {
  const model = params.model || "mystic";

  if (model === "mystic") {
    const result = await generateWithMystic(params);
    return { ...result, model: "mystic" };
  } else {
    const result = await generateWithFlux(params);
    return { ...result, model };
  }
}

// ============================================
// VIDEO GENERATION
// ============================================

/**
 * Generate a video from an image using Freepik's Seedance model
 */
export async function generateVideo(
  params: FreepikVideoParams
): Promise<{ videoUrl: string; taskId: string }> {
  const resolution = params.resolution || "720p";
  const endpoint = `/image-to-video/seedance-pro-${resolution}`;

  const body: Record<string, unknown> = {
    image: params.imageUrl,
    prompt: params.prompt,
    duration: params.duration || "5",
    aspect_ratio: mapAspectRatio(params.aspectRatio),
    camera_fixed: params.cameraFixed ?? false,
    frames_per_second: 24,
  };

  if (params.seed !== undefined && params.seed >= 0) {
    body.seed = params.seed;
  }

  if (params.webhookUrl) {
    body.webhook_url = params.webhookUrl;
  }

  // Create the task
  const taskResponse = await makeFreepikRequest<FreepikTaskResponse>(
    endpoint,
    body
  );

  const taskId = taskResponse.data.task_id;
  console.log(`[Freepik] Video task created: ${taskId}`);

  // Poll for completion (videos take longer)
  const completed = await pollForCompletion(
    `/image-to-video/seedance-pro-${resolution}`,
    taskId,
    120, // More attempts for video
    3000 // Longer interval
  );

  const videoUrl = completed.data.generated?.[0]?.url || completed.data.result?.url;
  if (!videoUrl) {
    throw new Error("No video URL in response");
  }

  return { videoUrl, taskId };
}

// ============================================
// IMAGE EDITING
// ============================================

/**
 * Upscale an image using Freepik's AI Upscaler
 */
export async function upscaleImage(
  params: FreepikUpscaleParams
): Promise<{ imageUrl: string; taskId: string }> {
  const body: Record<string, unknown> = {
    image: params.imageUrl,
    scale: `${params.scale}x`,
  };

  if (params.webhookUrl) {
    body.webhook_url = params.webhookUrl;
  }

  // Create the task
  const taskResponse = await makeFreepikRequest<FreepikTaskResponse>(
    "/upscale",
    body
  );

  const taskId = taskResponse.data.task_id;
  console.log(`[Freepik] Upscale task created: ${taskId}`);

  // Poll for completion
  const completed = await pollForCompletion("/upscale", taskId);
  
  const imageUrl = completed.data.generated?.[0]?.url;
  if (!imageUrl) {
    throw new Error("No image URL in upscale response");
  }

  return { imageUrl, taskId };
}

/**
 * Relight an image using Freepik's AI Relight
 */
export async function relightImage(
  params: FreepikRelightParams
): Promise<{ imageUrl: string; taskId: string }> {
  const body: Record<string, unknown> = {
    image: params.imageUrl,
  };

  if (params.prompt) {
    body.prompt = params.prompt;
  }

  if (params.lightMapUrl) {
    body.light_map = params.lightMapUrl;
  }

  if (params.referenceImageUrl) {
    body.reference_image = params.referenceImageUrl;
  }

  if (params.webhookUrl) {
    body.webhook_url = params.webhookUrl;
  }

  // Create the task
  const taskResponse = await makeFreepikRequest<FreepikTaskResponse>(
    "/relight",
    body
  );

  const taskId = taskResponse.data.task_id;
  console.log(`[Freepik] Relight task created: ${taskId}`);

  // Poll for completion
  const completed = await pollForCompletion("/relight", taskId);
  
  const imageUrl = completed.data.generated?.[0]?.url;
  if (!imageUrl) {
    throw new Error("No image URL in relight response");
  }

  return { imageUrl, taskId };
}

// ============================================
// UTILITY EXPORTS
// ============================================

export const FreepikProvider = {
  // Image generation
  generateImage,
  generateWithMystic,
  generateWithFlux,
  
  // Video generation
  generateVideo,
  
  // Image editing
  upscaleImage,
  relightImage,
  
  // Helpers
  mapAspectRatio,
};

export default FreepikProvider;
