"use client";

import React, { useEffect, useRef } from "react";
import Message from "./Message";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface MessageListProps {
  messages: ChatMessage[];
}

export default function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-2xl px-4">
            <div className="w-16 h-16 mx-auto mb-6 bg-linear-to-br from-orange-500 to-pink-600 rounded-full flex items-center justify-center">
              <span className="text-3xl">✨</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-200 mb-4">
              How can I help you today?
            </h2>
            <p className="text-gray-400">
              Start a conversation by typing your message below. I can help
              answer questions, write code, analyze data, and much more.
            </p>
          </div>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <Message
              key={message.id}
              role={message.role}
              content={message.content}
            />
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}
