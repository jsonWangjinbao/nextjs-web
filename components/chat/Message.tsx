"use client";

import React from "react";
import MarkdownRenderer from "./MarkdownRenderer";

interface MessageProps {
  role: "user" | "assistant";
  content: string;
}

export default function Message({ role, content }: MessageProps) {
  const isUser = role === "user";

  return (
    <div className="flex w-full py-6 px-4 bg-gray-800/50">
      <div
        className={`max-w-3xl mx-auto w-full flex gap-4 ${isUser ? "flex-row-reverse" : ""}`}
      >
        {/* Avatar */}
        <div className="shrink-0">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isUser
                ? "bg-linear-to-br from-orange-500 to-orange-600"
                : "bg-linear-to-br from-purple-600 to-pink-600"
            }`}
          >
            <span className="text-white font-medium text-sm">
              {isUser ? "U" : "AI"}
            </span>
          </div>
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          <div
            className={`text-sm font-medium mb-2 text-gray-300 ${isUser ? "text-right" : ""}`}
          >
            {isUser ? "You" : "Assistant"}
          </div>
          <div className={`text-gray-100 ${isUser ? "text-right" : ""}`}>
            {isUser ? (
              <p className="whitespace-pre-wrap">{content}</p>
            ) : (
              <MarkdownRenderer content={content} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
