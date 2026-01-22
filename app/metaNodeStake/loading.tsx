"use client";
import { Spinner } from "@heroui/react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-[calc(80vh-8rem)] w-full">
      <Spinner
        classNames={{ label: "text-foreground mt-4" }}
        label="loading..."
        variant="default"
      />
    </div>
  );
}
