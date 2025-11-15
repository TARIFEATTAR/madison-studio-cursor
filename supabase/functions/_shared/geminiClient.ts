export const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

const DEFAULT_MODEL = "models/gemini-2.0-flash-exp";

type OpenAIContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export type OpenAIMessage = {
  role: "system" | "user" | "assistant";
  content: string | OpenAIContentPart[];
};

interface GeminiRequestOptions {
  model?: string;
  systemPrompt?: string;
  messages: OpenAIMessage[];
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
  responseMimeType?: string;
  safetySettings?: Record<string, unknown>[];
}

interface GeminiTextOptions extends GeminiRequestOptions {
  chunkSize?: number;
}

function ensureGeminiKey(): string {
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return key;
}

export function getGeminiApiKey(): string {
  return ensureGeminiKey();
}

function toArrayContent(content: OpenAIMessage["content"]): OpenAIContentPart[] {
  if (typeof content === "string") {
    return [{ type: "text", text: content }];
  }
  if (Array.isArray(content)) {
    return content;
  }
  return [];
}

function convertDataUrl(
  url: string,
): { mimeType: string; data: string } | null {
  if (!url.startsWith("data:")) return null;
  const commaIndex = url.indexOf(",");
  if (commaIndex === -1) return null;
  const meta = url.slice(5, commaIndex); // remove "data:"
  const data = url.slice(commaIndex + 1);
  const mimeType = meta.split(";")[0] || "application/octet-stream";
  return { mimeType, data };
}

function convertPart(part: OpenAIContentPart) {
  if (part.type === "text") {
    return { text: part.text };
  }
  if (part.type === "image_url" && part.image_url?.url) {
    const dataUrl = convertDataUrl(part.image_url.url);
    if (dataUrl) {
      return {
        inlineData: {
          mimeType: dataUrl.mimeType,
          data: dataUrl.data,
        },
      };
    }
    // Remote URLs are not supported yet; fall back to textual reference
    return { text: `Image reference: ${part.image_url.url}` };
  }
  return { text: "" };
}

function splitSystemMessages(messages: OpenAIMessage[], explicit?: string) {
  let systemPrompt = explicit || "";
  const chatMessages: OpenAIMessage[] = [];

  for (const message of messages) {
    if (message.role === "system") {
      const parts = toArrayContent(message.content)
        .filter((part) => part.type === "text")
        .map((part) => (part as { type: "text"; text: string }).text)
        .filter(Boolean);
      if (parts.length > 0) {
        const combined = parts.join("\n");
        systemPrompt = systemPrompt
          ? `${systemPrompt}\n\n${combined}`
          : combined;
      }
    } else {
      chatMessages.push(message);
    }
  }

  return { systemPrompt, chatMessages };
}

function convertMessages(messages: OpenAIMessage[]) {
  return messages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: toArrayContent(message.content).map(convertPart),
  }));
}

async function handleGeminiError(response: Response) {
  const text = await response.text();
  try {
    const json = JSON.parse(text);
    const errorMessage = json.error?.message || text;
    throw new Error(`Gemini API error: ${errorMessage}`);
  } catch {
    throw new Error(`Gemini API error (${response.status}): ${text}`);
  }
}

export async function generateGeminiContent(options: GeminiRequestOptions) {
  const apiKey = ensureGeminiKey();
  const { systemPrompt: explicitSystemPrompt, messages, ...rest } = options;
  const { systemPrompt, chatMessages } = splitSystemMessages(
    messages,
    explicitSystemPrompt,
  );

  const body: Record<string, unknown> = {
    contents: convertMessages(chatMessages),
    generationConfig: {
      temperature: rest.temperature ?? 0.7,
      topP: rest.topP ?? 0.95,
      topK: rest.topK,
      maxOutputTokens: rest.maxOutputTokens ?? 2048,
    },
  };

  if (systemPrompt) {
    body.systemInstruction = { parts: [{ text: systemPrompt }] };
  }

  if (rest.responseMimeType) {
    body.responseMimeType = rest.responseMimeType;
  }

  if (rest.safetySettings) {
    body.safetySettings = rest.safetySettings;
  }

  if (!rest.topK) {
    delete (body.generationConfig as Record<string, unknown>).topK;
  }

  const model = rest.model ? `models/${rest.model.replace(/^models\//, "")}` : DEFAULT_MODEL;

  const response = await fetch(`${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    await handleGeminiError(response);
  }

  return await response.json();
}

export function extractTextFromGeminiResponse(data: any): string {
  if (!data?.candidates?.length) return "";
  for (const candidate of data.candidates) {
    const parts = candidate?.content?.parts;
    if (Array.isArray(parts)) {
      const textParts = parts
        .filter((part: any) => typeof part.text === "string")
        .map((part: any) => part.text as string);
      if (textParts.length > 0) {
        return textParts.join("\n").trim();
      }
    }
  }
  return "";
}

function chunkText(text: string, chunkSize = 200) {
  if (!text) return [];
  const chunks: string[] = [];
  let pointer = 0;
  while (pointer < text.length) {
    chunks.push(text.slice(pointer, pointer + chunkSize));
    pointer += chunkSize;
  }
  return chunks;
}

export function createOpenAISSEStream(text: string, chunkSize = 200) {
  const encoder = new TextEncoder();
  const chunks = chunkText(text, chunkSize);

  return new ReadableStream({
    start(controller) {
      if (chunks.length === 0) {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
        return;
      }

      for (const chunk of chunks) {
        const payload = {
          id: "chatcmpl-gemini",
          object: "chat.completion.chunk",
          created: Date.now(),
          choices: [
            {
              delta: { content: chunk },
              index: 0,
              finish_reason: null,
            },
          ],
        };
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(payload)}\n\n`),
        );
      }

      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
}

export async function streamGeminiTextResponse(
  options: GeminiTextOptions,
  headers: HeadersInit,
) {
  const data = await generateGeminiContent(options);
  const text = extractTextFromGeminiResponse(data);
  const stream = createOpenAISSEStream(text, options.chunkSize);
  return new Response(stream, {
    headers: typeof headers === "object"
      ? { ...headers, "Content-Type": "text/event-stream" }
      : { "Content-Type": "text/event-stream" },
  });
}

export function convertContentToGeminiParts(
  content: OpenAIMessage["content"],
) {
  return toArrayContent(content).map(convertPart);
}

