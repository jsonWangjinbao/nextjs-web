"use client";

import "@wangjinbao/wallet-connect/styles.css";

import {
  WalletProvider,
  ConnectButton,
  useWallet,
  mainnet,
  sepolia,
} from "@wangjinbao/wallet-connect";

function WalletInfo() {
  const { state, switchChain, supportedChains } = useWallet();

  if (!state.isConnected) {
    return null;
  }

  return (
    <div
      style={{
        marginTop: "2rem",
        padding: "1.5rem",
        background: "white",
        borderRadius: "1rem",
        boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
        maxWidth: "500px",
      }}
    >
      <h3 style={{ marginTop: 0, color: "#1f2937" }}>Wallet Information</h3>
      <div style={{ fontSize: "0.875rem", color: "#4b5563" }}>
        <p>
          <strong>Wallet:</strong> {state.wallet?.name}
        </p>
        <p>
          <strong>Account:</strong> {state.account}
        </p>
        <p>
          <strong>Chain ID:</strong> {state.chainId}
        </p>
        <p>
          <strong>Network:</strong>{" "}
          {state.chainId === "0x1" && "Ethereum Mainnet"}
          {state.chainId === "0xaa36a7" && "Sepolia Testnet"}
        </p>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <p
          style={{
            fontSize: "0.875rem",
            fontWeight: 600,
            marginBottom: "0.5rem",
          }}
        >
          Available Networks:
        </p>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {supportedChains.map((chain) => (
            <button
              key={chain.chainId}
              onClick={() => switchChain(chain.chainId)}
              disabled={chain.chainId === state.chainId}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                border: "none",
                background:
                  chain.chainId === state.chainId ? "#3b82f6" : "#e5e7eb",
                color: chain.chainId === state.chainId ? "white" : "#1f2937",
                cursor:
                  chain.chainId === state.chainId ? "not-allowed" : "pointer",
                fontSize: "0.875rem",
                fontWeight: 500,
                opacity: chain.chainId === state.chainId ? 0.6 : 1,
              }}
            >
              {chain.chainName}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CustomConnect() {
  return (
    <WalletProvider
      config={{
        chains: [mainnet, sepolia],
        autoConnect: true,
        appName: "Wallet Connect Example",
      }}
    >
      <div className="flex flex-col items-center justify-center h-full gap-2">
        <h1 className="text-5xl font-bold">Custom Wallet Connect Library</h1>
        <p className="text-2xl">Connect your wallet to get started</p>
        <ConnectButton />
        {/* <WalletInfo /> */}
      </div>
    </WalletProvider>
  );
}
