"use client";

import Link from "next/link";
import { Tabs, Tab } from "@heroui/react";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Connect", path: "/web3" },
  { name: "Wagmi", path: "/web3/wagmi" },
  { name: "Ethers", path: "/web3/ethers" },
  { name: "Viem", path: "/web3/viem" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col  align-center px-5 mt-8">
      <Tabs
        aria-label="Options"
        isVertical={true}
        selectedKey={pathname}
        color="primary"
        variant="bordered"
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
