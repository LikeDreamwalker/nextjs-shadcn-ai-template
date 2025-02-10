"use client";

import { useChat } from "ai/react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontal, User, Bot } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MemoizedMarkdown } from "@/components/memoized-markdown";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, error } = useChat({
    api: "/api/chat",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log(messages, "?>?>?>asd");
    return () => {};
  }, [messages]);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    await handleSubmit(e);
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col w-full mx-auto h-[calc(100vh-2rem)] p-4">
      <Card className="flex-1 mb-4">
        <CardContent className="p-4">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`mb-4 flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start space-x-2 w-full ${
                    m.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`p-2 rounded-full ${
                      m.role === "user"
                        ? "bg-primary ml-4"
                        : "bg-secondary mr-4"
                    }`}
                  >
                    {m.role === "user" ? (
                      <User className="w-4 h-4 text-primary-foreground" />
                    ) : (
                      <Bot className="w-4 h-4 text-secondary-foreground" />
                    )}
                  </div>
                  <div
                    className={`p-3 rounded-lg ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    <MemoizedMarkdown id={m.id} content={m.content} />
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
      <form onSubmit={onSubmit} className="flex space-x-2">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message here..."
          className="flex-1"
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            "Sending..."
          ) : (
            <>
              Send <SendHorizontal className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
