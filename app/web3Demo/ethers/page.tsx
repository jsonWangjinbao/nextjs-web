"use client";

import { EthersDemo } from "@/components/ethers/EthersDemo";
import AnimateCard from "@/components/animate/card";

export default function EthersPage() {
  return (
    <AnimateCard>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Ethers.js Demo</h1>
        <EthersDemo />
      </div>
    </AnimateCard>
  );
}
