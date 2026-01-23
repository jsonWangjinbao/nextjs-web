"use client";

import React, { useState } from "react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import MessageList, { ChatMessage } from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";

// Mock data for demonstration
const SAMPLE_ASSISTANT_RESPONSE = `# Welcome to Claude-Style Chat! 🎉

I'm an AI assistant ready to help you with various tasks. I can:

## Capabilities

- **Answer Questions**: Ask me anything you'd like to know
- **Write Code**: I can help with programming in multiple languages
- **Analyze Data**: Share data and I'll help you understand it
- **Creative Writing**: Need help writing? I'm here for you!

### Code Example

Here's a simple TypeScript example:

\`\`\`typescript
interface User {
  id: string;
  name: string;
  email: string;
}

function greetUser(user: User): string {
  return \`Hello, \${user.name}! Welcome back.\`;
}
\`\`\`

### Lists

**Ordered List:**
1. First item
2. Second item
3. Third item

**Unordered List:**
- Item A
- Item B
- Item C

### Blockquote

> "The only way to do great work is to love what you do." - Steve Jobs

### Table

| Feature | Supported |
|---------|-----------|
| Markdown | ✅ |
| Code Highlighting | ✅ |
| Tables | ✅ |

Feel free to test any markdown syntax!`;

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chats, setChats] = useState<
    Array<{ id: string; title: string; timestamp: string }>
  >([]);
  const [inputDisabled, setInputDisabled] = useState<boolean>(false);
  const [activeChat, setActiveChat] = useState<string | null>(null);

  const handleSendMessage = async (content: string) => {
    setInputDisabled(true);
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
    };

    setMessages((prev) => [...prev, userMessage]);

    // 3. 发送请求到代理服务器
    const res = await fetch("/api/askAgent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: content }),
    });

    // 现在 res 拿到的是流
    const reader = res.body?.getReader(); // 先创建一个 reader 对象
    if (!reader) {
      console.error("响应流为空");
      return;
    }

    // 创建一个解码器
    const decoder = new TextDecoder("utf-8");

    let botMessage = ""; // 用于拼接大模型返回的完整消息
    const id = `ai-${Date.now()}`;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // 对于当前读取出来的块儿的数据进行处理
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter((line) => line.trim());

      for (const line of lines) {
        try {
          const data = line === "[DONE]" ? null : JSON.parse(line); // data = {"response":"你好"}
          if (data?.response) {
            // 只要开始有数据回来了
            botMessage += data.response; // 每次回来的数据拼接到之前的数据里面
            const aiMessage: ChatMessage = {
              id,
              role: "assistant",
              content: botMessage,
            };
            setMessages((prev) => {
              const newMessages = [...prev];
              const curBotMessage = newMessages.find((item) => item.id === id);
              if (curBotMessage) {
                // 直接使用累加后的 botMessage，避免重复添加
                curBotMessage.content = botMessage;
              } else {
                newMessages.push(aiMessage);
              }
              return newMessages;
            });
          }
        } catch (e) {
          console.error("JSON解析失败☹️", e);
        }
      }
      setInputDisabled(false);
    }
  };

  const handleNewChat = () => {
    if (messages.length > 0) {
      // Save current chat to history
      const newChat = {
        id: `chat-${Date.now()}`,
        title: messages[0]?.content.slice(0, 50) || "New Chat",
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setChats((prev) => [newChat, ...prev]);
    }
    setMessages([]);
    setActiveChat(null);
  };

  const handleSelectChat = (id: string) => {
    setActiveChat(id);
    // In a real app, load chat messages from storage
    setMessages([]);
  };

  return (
    <div className="flex max-w-[1280px] mx-auto h-[calc(100vh-15rem)] bg-gray-900 text-gray-100 rounded-xl overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.6),0_2px_8px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.05)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.7),0_3px_10px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.08)] transition-shadow duration-300">
      {/* Sidebar */}
      <ChatSidebar
        chats={chats}
        activeChat={activeChat}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <MessageList messages={messages} />
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={inputDisabled}
        />
      </div>
    </div>
  );
}
