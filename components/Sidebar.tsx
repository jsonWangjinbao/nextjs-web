"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Home", path: "/" },
  { name: "Wagmi", path: "/wagmi" },
  { name: "Ethers", path: "/ethers" },
  { name: "Viem", path: "/viem" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900 text-white shadow-lg">
      <div className="flex h-16 items-center justify-center border-b border-gray-800 text-xl font-bold">
        Web3 Demo
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  pathname === item.path
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t border-gray-800 p-4">
        <p className="text-xs text-gray-500">Antigravity Demo</p>
      </div>
    </div>
  );
}
