"use client";

import Link from "next/link";
import { Tabs, Tab } from "@heroui/react";
import { usePathname } from "next/navigation";

interface SidebarProps {
  navItems: { name: string; path: string }[];
}

export default function Sidebar({ navItems }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col  align-center px-5 mt-24 font-bold">
      <Tabs
        aria-label="Options"
        isVertical={true}
        selectedKey={pathname}
        color="primary"
        variant="solid"
      >
        {navItems.map((item) => (
          <Tab
            key={item.path}
            title={<Link href={item.path}>{item.name}</Link>}
          />
        ))}
      </Tabs>
    </div>
  );
}
