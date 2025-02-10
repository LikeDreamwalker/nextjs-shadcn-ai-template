import { streamText } from "ai";

import { createDeepSeek } from "@ai-sdk/deepseek";

import { customOpenAI } from "@/lib/providers/custom-openai";

const customFetch = async (
  url: string | Request | URL,
  options: RequestInit | undefined
) => {
  const newUrl = "https://cloud.luchentech.com/api/maas/chat/completions";
  const newBody = JSON.parse(options!.body! as string);
  newBody.model = "deepseek_r1";
  newBody.max_tokens = 30;
  newBody.messages.unshift({
    role: "assistant",
    content: "Hi",
  });
  newBody.stream_options = {
    include_usage: true,
  };

  console.log("URL", newUrl);
  console.log("Headers", JSON.stringify(options!.headers, null, 2));
  console.log("Body", JSON.stringify(newBody, null, 2));

  return await fetch(newUrl, {
    ...options,
    body: JSON.stringify(newBody),
  });
};

const deepseek = createDeepSeek({
  apiKey: "3b1f5b23-cf2a-496e-a97b-9cc8c4379d6f",
  fetch: customFetch,
});

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  console.log("Request Messages:", JSON.stringify(messages, null, 2));

  const result = streamText({
    model: customOpenAI("gpt-4"),
    // model: deepseek("deepseek_r1"),
    messages,
  });

  return result.toDataStreamResponse({
    getErrorMessage: errorHandler,
    sendReasoning: true,
  });
}

export function errorHandler(error: unknown) {
  if (error == null) {
    return "unknown error";
  }

  if (typeof error === "string") {
    console.log("error string", error);
    return error;
  }

  if (error instanceof Error) {
    console.log("error instanceof Error", error);
    return error.message;
  }

  return JSON.stringify(error);
}
