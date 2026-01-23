"use client";

import React from "react";
import { IoAdd, IoChatbubbleOutline } from "react-icons/io5";

interface ChatItem {
  id: string;
  title: string;
  timestamp: string;
}

interface ChatSidebarProps {
  chats: ChatItem[];
  activeChat: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
}

export default function ChatSidebar({
  chats,
  activeChat,
  onNewChat,
  onSelectChat,
}: ChatSidebarProps) {
  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white rounded-lg px-4 py-3 font-medium transition-all"
        >
          <IoAdd className="w-5 h-5" />
          New Chat
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <div className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase tracking-wider">
            Recent Chats
          </div>
          {chats.length === 0 ? (
            <div className="text-sm text-gray-500 px-3 py-4 text-center">
              No chats yet
            </div>
          ) : (
            <div className="space-y-1">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className={`w-full text-left px-3 py-3 rounded-lg transition-all group ${
                    activeChat === chat.id
                      ? "bg-gray-800 text-gray-100"
                      : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <IoChatbubbleOutline className="w-4 h-4 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {chat.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {chat.timestamp}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="text-xs text-gray-500 text-center">
          Universe-Wang AI Chat
        </div>
      </div>
    </div>
  );
}
