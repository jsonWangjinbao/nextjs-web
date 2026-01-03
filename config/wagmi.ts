import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "My RainbowKit App",
  projectId: "YOUR_PROJECT_ID", // TODO: Get a project ID from WalletConnect Cloud
  chains: [mainnet, sepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
});
