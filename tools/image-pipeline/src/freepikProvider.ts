/**
 * Freepik API Provider - Standalone
 *
 * Extracted from Madison Studio. Complete Freepik AI image generation client.
 * Supports: Seedream 4, Flux Pro, Hyperflux, Mystic, and more.
 *
 * API Docs: https://docs.freepik.com/
 */

const FREEPIK_API_BASE = "https://api.freepik.com/v1/ai";

// ============================================
// TYPES
// ============================================

export type FreepikImageModel =
  | "mystic"
  | "classic-fast"
  | "flux-dev"
  | "flux-pro-v1-1"
  | "hyperflux"
  | "seedream"
  | "seedream-4"
  | "seedream-4-edit";

export type FreepikResolution = "1k" | "2k" | "4k";

export type FreepikAspectRatio =
  | "square_1_1"
  | "widescreen_16_9"
  | "social_story_9_16"
  | "portrait_2_3"
  | "traditional_3_4"
  | "vertical_1_2"
  | "horizontal_2_1"
  | "social_post_4_5"
  | "standard_3_2"
  | "classic_4_3"
  | "film_horizontal_21_9"
  | "film_vertical_9_21";

export interface FreepikImageParams {
  prompt: string;
  model?: FreepikImageModel;
  resolution?: FreepikResolution;
  aspectRatio?: string;
  seed?: number;
  referenceImages?: Array<{ url: string; weight?: number }>;
  negativePrompt?: string;
  styling?: { effects?: string; color?: string; lighting?: string; framing?: string };
}

interface FreepikTaskResponse {
  data: { task_id: string; status: string };
}

interface FreepikCompletedTask {
  data: {
    task_id: string;
    status: string;
    generated?: string[];
    result?: { url: string };
  };
}

// ============================================
// HELPERS
// ============================================

let _apiKey: string | undefined;

export function setApiKey(key: string) {
  _apiKey = key;
}

function getApiKey(): string {
  const key = _apiKey || process.env.FREEPIK_API_KEY;
  if (!key) throw new Error("FREEPIK_API_KEY not set. Pass it via setApiKey() or env var.");
  return key;
}

export function mapAspectRatio(ratio?: string): FreepikAspectRatio {
  if (!ratio) return "square_1_1";

  const mapping: Record<string, FreepikAspectRatio> = {
    "1:1": "square_1_1",
    "16:9": "widescreen_16_9",
    "9:16": "social_story_9_16",
    "2:3": "portrait_2_3",
    "3:4": "traditional_3_4",
    "1:2": "vertical_1_2",
    "2:1": "horizontal_2_1",
    "4:5": "social_post_4_5",
    "3:2": "standard_3_2",
    "4:3": "classic_4_3",
    "21:9": "film_horizontal_21_9",
    "9:21": "film_vertical_9_21",
    // Pass through if already in Freepik format
    "square_1_1": "square_1_1",
    "widescreen_16_9": "widescreen_16_9",
    "social_story_9_16": "social_story_9_16",
    "portrait_2_3": "portrait_2_3",
    "traditional_3_4": "traditional_3_4",
    "vertical_1_2": "vertical_1_2",
    "horizontal_2_1": "horizontal_2_1",
    "social_post_4_5": "social_post_4_5",
    "standard_3_2": "standard_3_2",
    "classic_4_3": "classic_4_3",
    "film_horizontal_21_9": "film_horizontal_21_9",
    "film_vertical_9_21": "film_vertical_9_21",
  };

  return mapping[ratio] || "square_1_1";
}

function getImageEndpoint(model: FreepikImageModel): string {
  const endpoints: Record<FreepikImageModel, string> = {
    "mystic": "/mystic",
    "classic-fast": "/text-to-image",
    "flux-dev": "/text-to-image/flux-dev",
    "flux-pro-v1-1": "/text-to-image/flux-pro-v1-1",
    "hyperflux": "/text-to-image/hyperflux",
    "seedream": "/text-to-image/seedream",
    "seedream-4": "/text-to-image/seedream-4",
    "seedream-4-edit": "/text-to-image/seedream-4-edit",
  };
  return endpoints[model] || "/mystic";
}

async function makeFreepikRequest<T>(
  endpoint: string,
  body: Record<string, unknown>,
  method: "POST" | "GET" = "POST"
): Promise<T> {
  const url = `${FREEPIK_API_BASE}${endpoint}`;

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
    throw new Error(
      (errorData as any)?.error?.message ||
      `Freepik API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json() as Promise<T>;
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
      headers: { "x-freepik-api-key": getApiKey() },
    });

    if (!response.ok) {
      throw new Error(`Failed to check task status: ${response.status}`);
    }

    const data = (await response.json()) as FreepikCompletedTask;

    if (data.data?.status === "COMPLETED") return data;
    if (data.data?.status === "FAILED") throw new Error("Freepik task failed");

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error("Freepik task timed out");
}

// ============================================
// IMAGE GENERATION
// ============================================

/**
 * Generate an image using any Freepik model
 */
export async function generateImage(
  params: FreepikImageParams
): Promise<{ imageUrl: string; taskId: string; model: FreepikImageModel }> {
  const model = params.model || "mystic";
  const endpoint = getImageEndpoint(model);

  const body: Record<string, unknown> = {
    prompt: params.prompt,
    aspect_ratio: mapAspectRatio(params.aspectRatio),
  };

  if (model === "mystic" || model === "seedream-4") {
    body.resolution = params.resolution || "2k";
  }

  if (params.seed !== undefined && params.seed >= 0) body.seed = params.seed;
  if (params.negativePrompt) body.negative_prompt = params.negativePrompt;

  if (params.referenceImages?.length && (model === "seedream-4" || model === "seedream")) {
    body.reference_images = params.referenceImages.map(ref => ({
      url: ref.url,
      weight: ref.weight ?? 0.8,
    }));
  }

  if (params.styling && model === "mystic") body.styling = params.styling;

  console.log(`[Freepik] Generating with ${model}...`);

  const taskResponse = await makeFreepikRequest<FreepikTaskResponse>(endpoint, body);
  const taskId = taskResponse.data.task_id;
  console.log(`[Freepik] Task created: ${taskId}`);

  const completed = await pollForCompletion(endpoint, taskId);

  const imageUrl = completed.data.generated?.[0] || completed.data.result?.url;
  if (!imageUrl || typeof imageUrl !== 'string') {
    throw new Error(`No image URL in ${model} response.`);
  }

  return { imageUrl, taskId, model };
}

/**
 * Upscale an image
 */
export async function upscaleImage(
  imageUrl: string,
  scale: 2 | 4 | 8 | 16 = 4
): Promise<{ imageUrl: string; taskId: string }> {
  const taskResponse = await makeFreepikRequest<FreepikTaskResponse>("/upscale", {
    image: imageUrl,
    scale: `${scale}x`,
  });

  const taskId = taskResponse.data.task_id;
  const completed = await pollForCompletion("/upscale", taskId);

  const resultUrl = completed.data.generated?.[0];
  if (!resultUrl) throw new Error("No image URL in upscale response");

  return { imageUrl: resultUrl, taskId };
}

// ============================================
// MODEL METADATA
// ============================================

export const IMAGE_MODELS = [
  { id: "seedream-4" as const, name: "Seedream 4", description: "Best quality with 4K support", supportsReferences: true },
  { id: "flux-pro-v1-1" as const, name: "Flux Pro v1.1", description: "Premium Flux model", supportsReferences: false },
  { id: "hyperflux" as const, name: "Hyperflux", description: "Ultra-fast Flux variant", supportsReferences: false },
  { id: "flux-dev" as const, name: "Flux Dev", description: "Community favorite", supportsReferences: false },
  { id: "seedream" as const, name: "Seedream", description: "Exceptional creativity", supportsReferences: true },
  { id: "mystic" as const, name: "Mystic", description: "Freepik AI at 2K resolution", supportsReferences: false },
  { id: "classic-fast" as const, name: "Classic Fast", description: "Quick generation", supportsReferences: false },
];

export const ASPECT_RATIOS = [
  { id: "1:1", name: "Square", freepikId: "square_1_1" },
  { id: "16:9", name: "Widescreen", freepikId: "widescreen_16_9" },
  { id: "9:16", name: "Social story", freepikId: "social_story_9_16" },
  { id: "2:3", name: "Portrait", freepikId: "portrait_2_3" },
  { id: "3:4", name: "Traditional", freepikId: "traditional_3_4" },
  { id: "1:2", name: "Vertical", freepikId: "vertical_1_2" },
  { id: "2:1", name: "Horizontal", freepikId: "horizontal_2_1" },
  { id: "4:5", name: "Social post", freepikId: "social_post_4_5" },
  { id: "3:2", name: "Standard", freepikId: "standard_3_2" },
  { id: "4:3", name: "Classic", freepikId: "classic_4_3" },
];
