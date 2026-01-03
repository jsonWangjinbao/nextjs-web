import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Connect() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <h1 className="mb-16 text-6xl font-bold">
          Welcome to this demo of{" "}
          <a className="text-blue-600" href="https://www.rainbowkit.com/">
            RainbowKit
          </a>
        </h1>
        <ConnectButton />
      </main>
    </div>
  );
}
