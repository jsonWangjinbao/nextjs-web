import Sidebar from "@/components/Sidebar";

import { Providers } from "@/app/web3/Providers";

export default function Web3Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full h-[calc(100vh-8rem)]">
      <Sidebar />
      <div className="h-[calc(100vh-8rem)] flex-1 overflow-y-auto p-5 border border-gray-800 mt-8 rounded-lg mr-5">
        <Providers>{children}</Providers>
      </div>
    </div>
  );
}
