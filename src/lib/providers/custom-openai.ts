import { createOpenAI } from "@ai-sdk/openai";

export const customOpenAI = createOpenAI({
  apiKey: "3b1f5b23-cf2a-496e-a97b-9cc8c4379d6f",
  baseURL: "https://cloud.luchentech.com/api/maas",
  fetch: async (url, options = {}) => {
    const body = options.body ? JSON.parse(options.body as string) : {};

    const transformedBody = {
      model: "deepseek_r1",
      messages: body.messages,
      stream: body.stream || false,
      max_tokens: body.max_tokens || 512,
    };

    const modifiedOptions = {
      ...options,
      method: "POST",
      body: JSON.stringify(transformedBody),
      headers: {
        ...options.headers,
        "Content-Type": "application/json",
        Authorization: `Bearer 3b1f5b23-cf2a-496e-a97b-9cc8c4379d6f`,
      },
    };

    const modifiedUrl = new URL(
      "https://cloud.luchentech.com/api/maas/chat/completions"
    );

    console.log("Request URL:", modifiedUrl.toString());
    console.log("Request Options:", JSON.stringify(modifiedOptions, null, 2));

    const response = await fetch(modifiedUrl, modifiedOptions);

    console.log("Response Status:", response.status);
    console.log(
      "Response Headers:",
      JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Error Response Body:", errorBody);
      throw new Error(
        `HTTP error! status: ${response.status}, body: ${errorBody}`
      );
    }

    if (body.stream) {
      let isReasoningStarted = false;
      let isReasoningEnded = false;

      const transformStream = new TransformStream({
        transform(chunk, controller) {
          const text = new TextDecoder().decode(chunk);
          const lines = text.split("\n").filter((line) => line.trim() !== "");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const content = line.slice(5).trim();

              if (content === "[DONE]") {
                // Stream is finished, no need to process further
                return;
              }

              let data;
              try {
                data = JSON.parse(content);
                console.log(
                  "Parsed streaming data:",
                  JSON.stringify(data, null, 2)
                );
              } catch (error) {
                console.error("Error parsing streaming data:", error);
                continue;
              }

              if (!data.choices || !data.choices[0]) {
                console.error("Unexpected data structure:", data);
                continue;
              }

              const reasoningContent =
                data.choices[0].delta?.reasoning_content || "";
              const contentDelta = data.choices[0].delta?.content || "";

              let combinedContent = "";

              if (reasoningContent) {
                if (!isReasoningStarted) {
                  isReasoningStarted = true;
                  combinedContent += "> ";
                }
                combinedContent += reasoningContent;
              } else if (
                contentDelta &&
                isReasoningStarted &&
                !isReasoningEnded
              ) {
                isReasoningEnded = true;
                combinedContent += "\n\n";
              }

              combinedContent += contentDelta;

              if (combinedContent) {
                const transformedChunk = {
                  id: data.id || "unknown",
                  object: data.object || "chat.completion.chunk",
                  created: data.created || Date.now(),
                  model: data.model || "deepseek_r1",
                  choices: [
                    {
                      index: data.choices[0].index || 0,
                      delta: {
                        content: combinedContent,
                        role: "assistant",
                      },
                    },
                  ],
                };

                console.log(
                  "Transformed chunk:",
                  JSON.stringify(transformedChunk, null, 2)
                );

                controller.enqueue(
                  new TextEncoder().encode(
                    `data: ${JSON.stringify(transformedChunk)}\n\n`
                  )
                );
              }
            }
          }
        },
      });

      return new Response(response.body?.pipeThrough(transformStream), {
        headers: response.headers,
        status: response.status,
        statusText: response.statusText,
      });
    }

    const data = await response.json();
    console.log("Response Data:", JSON.stringify(data, null, 2));

    const reasoningContent =
      data.choices?.[0]?.message?.reasoning_content || "";
    const content = data.choices?.[0]?.message?.content || "";
    const combinedContent = reasoningContent
      ? `<${reasoningContent}>\n\n${content}`
      : content;

    const transformedData = {
      id: data.id || "unknown",
      object: "chat.completion",
      created: data.created || Date.now(),
      model: data.model || "deepseek_r1",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: combinedContent,
          },
          finish_reason: data.choices?.[0]?.finish_reason || null,
        },
      ],
      usage: data.usage || {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      },
    };

    return new Response(JSON.stringify(transformedData), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  },
});
