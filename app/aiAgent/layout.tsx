import Sidebar from "@/components/Sidebar";

export default function AiAgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { name: "MCP", path: "/aiAgent/mcp" },
    { name: "Langchain", path: "/aiAgent/langchain" },
    { name: "Langgraph", path: "/aiAgent/langgraph" },
  ];
  return (
    <div className="flex w-full h-[calc(100vh-8rem)]">
      <Sidebar navItems={navItems} />
      <div className="h-[calc(100vh-10rem)] flex-1 overflow-y-auto p-5 mt-8 rounded-lg mr-5">
        {children}
      </div>
    </div>
  );
}
