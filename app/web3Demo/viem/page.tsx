"use client";

import { ViemDemo } from "@/components/viem/ViemDemo";
import AnimateCard from "@/components/animate/card";

export default function ViemPage() {
  return (
    <AnimateCard>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Viem Demo</h1>
        <ViemDemo />
      </div>
    </AnimateCard>
  );
}
