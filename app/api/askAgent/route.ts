import { NextRequest } from "next/server";
import { getWeather } from "@/utils/chat/weatherHandler";
import { translate } from "@/utils/chat/translateHandler";

// Import LLM and tools dynamically
import { callLLM } from "@/utils/chat/LLM";
import { tools as toolList } from "@/utils/chat/tools";

// Type definitions
interface Message {
  role: "user" | "assistant" | "tool";
  content: string;
  tool_calls?: ToolCall[];
}

interface ToolCall {
  index: number;
  id: string;
  type: string;
  function: {
    name: string;
    arguments: string;
  };
}

interface ToolResult {
  tool_call_id: string;
  role: "tool";
  content: string;
}

interface LLMResponse {
  content: string;
  tool_calls?: ToolCall[];
}

interface ToolFunction {
  (args: Record<string, unknown>): Promise<string>;
}

interface Tool {
  type: string;
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

interface ToolsMap {
  [key: string]: ToolFunction;
}

// Tool functions mapping - using static imports with proper type casting
const toolsMap: ToolsMap = {
  getWeather: getWeather as unknown as ToolFunction,
  translate: translate as unknown as ToolFunction,
};

// Conversation history storage (in-memory for demo)
const conversations: Message[] = [];

export async function GET() {
  return new Response("Hello");
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const question: string = body.question || "";

    if (!question) {
      return new Response(JSON.stringify({ error: "Question is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create readable stream for SSE
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const messages: Message[] = [
          ...conversations,
          { role: "user", content: question },
        ];

        try {
          // Call LLM with streaming callback
          const response = (await callLLM(
            messages,
            toolList as any,
            (chunk: string) => {
              // Send chunk to client via SSE
              controller.enqueue(
                encoder.encode(`${JSON.stringify({ response: chunk })}\n\n`),
              );
            },
          )) as string | LLMResponse;

          // Check if response contains tool calls
          if (typeof response === "object" && response.tool_calls) {
            // Handle tool calls
            const toolResults: ToolResult[] = [];

            for (const toolCall of response.tool_calls) {
              try {
                const functionName = toolCall.function.name;
                const args = JSON.parse(toolCall.function.arguments);

                console.log("Calling tool:", functionName, "with args:", args);

                if (toolsMap[functionName]) {
                  const result = await toolsMap[functionName](args);
                  toolResults.push({
                    tool_call_id: toolCall.id,
                    role: "tool",
                    content: result,
                  });
                } else {
                  toolResults.push({
                    tool_call_id: toolCall.id,
                    role: "tool",
                    content: `未知工具: ${functionName}`,
                  });
                }
              } catch (err) {
                const error = err as Error;
                console.error("工具调用失败:", error);
                toolResults.push({
                  tool_call_id: toolCall.id,
                  role: "tool",
                  content: `工具调用失败: ${error.message || "Unknown error"}`,
                });
              }
            }

            // Add tool call results to messages
            messages.push(
              {
                role: "assistant",
                content: response.content,
                tool_calls: response.tool_calls,
              },
              ...toolResults,
            );

            // Call LLM again with tool results
            const finalResponse = (await callLLM(
              messages,
              toolList as any,
              (chunk: string) => {
                controller.enqueue(
                  encoder.encode(`${JSON.stringify({ response: chunk })}\n\n`),
                );
              },
            )) as string;

            // Update conversation history
            conversations.push(
              { role: "user", content: question },
              {
                role: "assistant",
                content: response.content,
                tool_calls: response.tool_calls,
              },
              ...toolResults,
              { role: "assistant", content: finalResponse },
            );
          } else {
            // No tool calls, just save the conversation
            conversations.push(
              { role: "user", content: question },
              { role: "assistant", content: response as string },
            );
          }

          // Limit conversation history to last 20 messages
          if (conversations.length > 20) {
            conversations.splice(0, conversations.length - 20);
          }

          // Send completion signal
          controller.enqueue(encoder.encode("[DONE]\n\n"));
          controller.close();
        } catch (err: any) {
          console.error("LLM调用失败:", err);
          controller.enqueue(
            encoder.encode(
              `${JSON.stringify({ error: err?.message || "LLM调用失败" })}\n\n`,
            ),
          );
          controller.close();
        }
      },
    });

    // Return SSE response
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err: any) {
    console.error("API错误:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
