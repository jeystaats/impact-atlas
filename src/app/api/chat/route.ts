import { createOpenAI } from "@ai-sdk/openai";
import { streamText, convertToModelMessages } from "ai";
import { CLIMATE_DIRECTOR_SYSTEM_PROMPT, createCityContext, createModuleContext } from "@/lib/openai";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    // Lazily create OpenAI instance at request time (not build time)
    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { messages, city, moduleId, moduleName } = await req.json();

    // Build the system prompt with context
    let systemPrompt = CLIMATE_DIRECTOR_SYSTEM_PROMPT;

    if (city) {
      systemPrompt += createCityContext(city);
    }

    if (moduleId && moduleName) {
      systemPrompt += createModuleContext(moduleId, moduleName);
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
