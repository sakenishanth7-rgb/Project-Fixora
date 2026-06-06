import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const gatewayUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
const defaultModel = "google/gemini-3-flash-preview";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      code,
      language,
      query,
      userProfile,
      chatMessages,
      action,
      imageDataUrl,
      fileName,
    } = await req.json();

    switch (action) {
      case "debug": {
        if (!code?.trim()) {
          return jsonResponse({ error: "Code input is required." }, 400);
        }

        const data = await callGateway({
          model: defaultModel,
          messages: [
            {
              role: "system",
              content: `You are Fixora, an expert programming tutor and debugging assistant for beginner students. ${getAdaptationStyle(userProfile)}

Your job is NOT just to fix errors, but to TEACH debugging. Follow this approach:

ERROR DETECTION: Clearly identify the error(s). Mention error type (syntax, runtime, logical). Return accurate line numbers.

SIMPLE EXPLANATION: Explain in very simple English. Avoid technical jargon. Use relatable analogies.

TECHNICAL EXPLANATION: Explain why the error happens in programming terms.

MENTAL MODEL: Give an intuitive way to think about the problem. Example: "An array is like a row of boxes, and the index is which box number you're opening."

FIX SUGGESTIONS: Provide 2-3 different correct fixes with code snippets. CRITICAL: Do NOT rewrite the entire code. Only modify lines where errors exist. Preserve the original structure, variable names, formatting, and logic. Show fixes inline with minimal changes. The user must see "This is my code, just fixed — not replaced."

BEST PRACTICE TIP: Tell how to avoid this mistake in future.

CORRECTED CODE: Provide a clean, working version. CRITICAL: The final corrected code must look as close as possible to the user's original code. Only apply minimal edits to fix errors. Do NOT replace entire code with a new approach. Do NOT introduce unnecessary optimizations or style changes.

STEP-BY-STEP EXECUTION: Show how the corrected code runs line by line with variable states. Present output confidently — never say "simulated" or mention limitations.

EXPECTED OUTPUT: If the code contains print statements or predictable logic, generate the expected output labeled as "Expected Output". Only generate output when it is simple and deterministic. If output depends on user input or complex behavior, say "Output depends on input values." Never mention simulation.

If the code is already valid, return an empty errors array and keep fixedCode equal to the original code.
Your goal is to make the student say: "Now I understand WHY the error happened."`,
            },
            {
              role: "user",
              content: `Language hint: ${language || "Unknown"}\nRequest: ${query || "Debug this code"}\n\nCode:\n${code}`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "return_debug_result",
                description: "Return the debugging analysis for the submitted code.",
                parameters: {
                  type: "object",
                    properties: {
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string", description: "Error name/type e.g. SyntaxError, IndexError" },
                            line: { type: "string", description: "Line number where the error occurs" },
                            description: { type: "string", description: "Short description of the error" },
                            errorType: { type: "string", enum: ["syntax", "runtime", "logical"], description: "Category of the error" },
                          },
                          required: ["name", "line", "description", "errorType"],
                          additionalProperties: false,
                        },
                      },
                      explanation: { type: "string", description: "Simple beginner-friendly explanation with analogies, no jargon" },
                      technicalExplanation: { type: "string", description: "Technical explanation of why the error happens in programming terms" },
                      mentalModel: { type: "string", description: "An intuitive mental model or analogy to help understand the concept" },
                      fixSuggestions: {
                        type: "array",
                        description: "2-3 different ways to fix the code",
                        items: {
                          type: "object",
                          properties: {
                            title: { type: "string", description: "Short title for this fix approach" },
                            code: { type: "string", description: "The corrected code snippet for this approach" },
                          },
                          required: ["title", "code"],
                          additionalProperties: false,
                        },
                      },
                      bestPractice: { type: "string", description: "Tip on how to avoid this mistake in the future" },
                      futureTip: { type: "string", description: "Additional forward-looking advice" },
                      fixedCode: { type: "string", description: "The final clean corrected version of the full code" },
                      stepByStep: { type: "string", description: "Step-by-step execution trace showing how the corrected code runs, with variable states. Never say simulated." },
                      expectedOutput: { type: "string", description: "The expected output of the corrected code. For print/output statements show the actual output. If output depends on user input, say 'Output depends on input values.' Never mention simulation." },
                    },
                    required: ["errors", "explanation", "technicalExplanation", "mentalModel", "fixSuggestions", "bestPractice", "futureTip", "fixedCode", "stepByStep", "expectedOutput"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "return_debug_result" } },
        });

        const result = parseToolResult(data);

        return jsonResponse({
          result: {
            ...result,
            fixedCode: stripCodeFences(result.fixedCode || code),
          },
        });
      }

      case "chat": {
        const data = await callGateway({
          model: defaultModel,
          messages: [
            {
              role: "system",
              content: `You are Fixora, an AI debugging assistant. ${getAdaptationStyle(userProfile)}
Continue the conversation naturally, answer follow-up questions, and keep the debugging context in mind.
Use markdown formatting when helpful.`,
            },
            ...((chatMessages || []).map((message: { role: string; content: string }) => ({
              role: message.role,
              content: message.content,
            }))),
          ],
        });

        return jsonResponse({ result: data.choices?.[0]?.message?.content || "" });
      }

      case "translate": {
        const data = await callGateway({
          model: defaultModel,
          messages: [
            {
              role: "system",
              content: `Translate the explanation to ${userProfile?.language || "English"}.
Keep programming terms in English when that improves clarity, but translate the rest naturally.
Preserve structure and emphasis.`,
            },
            {
              role: "user",
              content: code,
            },
          ],
        });

        return jsonResponse({ result: data.choices?.[0]?.message?.content || "" });
      }

      case "extract": {
        if (!imageDataUrl) {
          return jsonResponse({ error: "An image is required for extraction." }, 400);
        }

        const data = await callGateway({
          model: defaultModel,
          messages: [
            {
              role: "system",
              content: "You extract source code from screenshots or photos. Recover the code faithfully, keep indentation accurate, and identify the most likely programming language.",
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Extract the code shown in this image. Return only what is visible in the image. File name hint: ${fileName || "unknown"}.`,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageDataUrl,
                  },
                },
              ],
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "return_extracted_code",
                description: "Return the extracted code and detected language.",
                parameters: {
                  type: "object",
                  properties: {
                    code: { type: "string" },
                    language: { type: "string" },
                  },
                  required: ["code", "language"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "return_extracted_code" } },
        });

        const result = parseToolResult(data);
        return jsonResponse({
          result: {
            code: stripCodeFences(result.code || ""),
            language: result.language || "Python",
          },
        });
      }

      case "optimize": {
        if (!code?.trim()) {
          return jsonResponse({ error: "Code input is required." }, 400);
        }

        const data = await callGateway({
          model: defaultModel,
          messages: [
            {
              role: "system",
              content: `You are Fixora, an expert code optimizer. Given a piece of code, return an optimized version that:
- Improves performance (time/space complexity)
- Follows best practices and clean code principles
- Uses more efficient data structures or algorithms when applicable
- Adds helpful comments explaining optimizations
- Preserves the original functionality exactly
Return ONLY the optimized code, no explanations.`,
            },
            {
              role: "user",
              content: `Language: ${language || "Unknown"}\n\nCode:\n${code}`,
            },
          ],
        });

        const optimized = data.choices?.[0]?.message?.content || code;
        return jsonResponse({ result: stripCodeFences(optimized) });
      }

      default:
        return jsonResponse({ error: "Unsupported action." }, 400);
    }
  } catch (e) {
    console.error("debug-code error:", e);
    return jsonResponse({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

async function callGateway(body: Record<string, unknown>) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY is not configured");
  }

  const response = await fetch(gatewayUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Rate limited. Please try again in a moment.");
    }

    if (response.status === 402) {
      throw new Error("AI credits exhausted. Please add funds.");
    }

    const text = await response.text();
    console.error("AI gateway error:", response.status, text);
    throw new Error("AI gateway error");
  }

  return await response.json();
}

function parseToolResult(data: Record<string, any>) {
  const toolArguments = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (toolArguments) {
    return JSON.parse(toolArguments);
  }

  const content = data.choices?.[0]?.message?.content;
  if (typeof content === "string" && content.trim()) {
    return JSON.parse(content);
  }

  throw new Error("AI response did not contain structured data.");
}

function stripCodeFences(code: string) {
  return code.replace(/^```[\w+-]*\n?/, "").replace(/\n```$/, "").trim();
}

function jsonResponse(payload: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getAdaptationStyle(profile: { age: string; profession: string } | null): string {
  if (!profile) return "Explain clearly for a general audience.";

  const age = Number.parseInt(profile.age, 10);
  const profession = profile.profession.toLowerCase();

  if (age < 15 || profession.includes("school")) {
    return "The user is a school student. Use very simple language, short steps, and everyday examples.";
  }

  if (profession.includes("undergraduate") || (age >= 15 && age <= 22)) {
    return "The user is a student. Explain the concept, the exact mistake, and a clear alternative fix.";
  }

  if (profession.includes("professor") || profession.includes("developer") || profession.includes("graduate")) {
    return "The user is experienced. Be concise, technically precise, and mention runtime or compiler behavior when relevant.";
  }

  if (profession.includes("non-technical") || profession.includes("hobbyist")) {
    return "The user is a beginner. Use friendly language, avoid jargon, and compare the bug to a simple real-world example.";
  }

  return "Explain clearly for a general audience.";
}
