import { createOpenAI } from "@ai-sdk/openai";
import { streamText, convertToModelMessages } from "ai";
import { auth } from "@clerk/nextjs/server";
import {
  CLIMATE_DIRECTOR_SYSTEM_PROMPT,
  createCityContext,
  createModuleContext,
  createHotspotContext,
  createModuleMetricsContext,
  HotspotContextData
} from "@/lib/openai";

export const runtime = "edge";

// Simple in-memory rate limiting (for Edge runtime)
// In production, use Redis or a proper rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  record.count++;
  return true;
}

// Validation constants
const MAX_MESSAGE_LENGTH = 2000;
const MAX_MESSAGES = 20;
const VALID_MODULE_IDS = [
  "urban-heat",
  "coastal-plastic",
  "ocean-plastic",
  "port-emissions",
  "biodiversity",
  "restoration"
];

// Sanitize user input - remove potential prompt injection patterns
function sanitizeUserInput(text: string): string {
  if (typeof text !== "string") return "";

  // Truncate to max length
  let sanitized = text.slice(0, MAX_MESSAGE_LENGTH);

  // Remove common prompt injection patterns (but don't be too aggressive)
  // These are just basic patterns - the system prompt has stronger defenses
  sanitized = sanitized
    .replace(/\[INST\]/gi, "")
    .replace(/\[\/INST\]/gi, "")
    .replace(/<<SYS>>/gi, "")
    .replace(/<\|im_start\|>/gi, "")
    .replace(/<\|im_end\|>/gi, "")
    .replace(/system:/gi, "")
    .replace(/assistant:/gi, "")
    .replace(/human:/gi, "");

  return sanitized.trim();
}

export async function POST(req: Request) {
  try {
    // Verify authentication (defense-in-depth, middleware also checks)
    const { userId } = await auth();
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Use userId for rate limiting (more reliable than IP for authenticated users)
    const rateLimitKey = userId;

    // Check rate limit
    if (!checkRateLimit(rateLimitKey)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    // Lazily create OpenAI instance at request time (not build time)
    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const {
      messages,
      city,
      moduleId,
      moduleName,
      selectedHotspot,
      moduleMetrics
    } = body;

    // Validate messages array
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (messages.length > MAX_MESSAGES) {
      return new Response(
        JSON.stringify({ error: "Too many messages in conversation" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate moduleId if provided
    if (moduleId && !VALID_MODULE_IDS.includes(moduleId)) {
      return new Response(
        JSON.stringify({ error: "Invalid module ID" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build the system prompt with context
    let systemPrompt = CLIMATE_DIRECTOR_SYSTEM_PROMPT;

    if (city) {
      systemPrompt += createCityContext(city);
    }

    if (moduleId && moduleName) {
      systemPrompt += createModuleContext(moduleId, moduleName);
    }

    // Add hotspot context if a hotspot is selected
    if (selectedHotspot) {
      systemPrompt += createHotspotContext(selectedHotspot as HotspotContextData);
    }

    // Add module-specific metrics if available
    if (moduleMetrics && moduleId) {
      systemPrompt += createModuleMetricsContext(moduleId, moduleMetrics);
    }

    // Sanitize message content in place before conversion
    // This modifies text parts while keeping the original structure
    for (const msg of messages) {
      if (msg.parts && Array.isArray(msg.parts)) {
        for (const part of msg.parts) {
          if (part.type === "text" && typeof part.text === "string") {
            part.text = sanitizeUserInput(part.text);
          }
        }
      }
    }

    // Convert UIMessages to ModelMessages for streamText
    const modelMessages = convertToModelMessages(messages);

    const result = streamText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      messages: modelMessages,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process chat request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
