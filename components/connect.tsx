import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Connect() {
  return (
    <div className="flex h-full flex-col items-center justify-center py-2">
      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center h-full">
        <h1 className="mb-16 text-6xl font-bold">
          Connect wallet with{" "}
          <a className="text-blue-600" href="https://www.rainbowkit.com/">
            RainbowKit
          </a>
        </h1>
        <ConnectButton />
      </main>
    </div>
  );
}
