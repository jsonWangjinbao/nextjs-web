"use client";

import { Balance } from "@/components/wagmi/Balance";
import { SendEth } from "@/components/wagmi/SendEth";
import { TokenOperations } from "@/components/wagmi/TokenOperations";
import AnimateCard from "@/components/animate/card";

export default function WagmiPage() {
  return (
    <AnimateCard>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Wagmi Demo</h1>

        <div className="p-4 border border-gray-700 rounded-lg bg-gray-800">
          <h2 className="text-xl font-semibold mb-4">1. Native Balance</h2>
          <Balance />
        </div>

        <div className="p-4 border border-gray-700 rounded-lg bg-gray-800">
          <h2 className="text-xl font-semibold mb-4">2. Send ETH</h2>
          <SendEth />
        </div>

        <div className="p-4 border border-gray-700 rounded-lg bg-gray-800">
          <h2 className="text-xl font-semibold mb-4">
            3 & 4. ERC-20 Operations
          </h2>
          <TokenOperations />
        </div>
      </div>
    </AnimateCard>
  );
}
