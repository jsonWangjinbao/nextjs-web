import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia } from "wagmi/chains";
import { http } from "wagmi";

export const config = getDefaultConfig({
  appName: "王金保",
  projectId: "3f7749cb16d153ba963556242adea9cf", // TODO: Get a project ID from WalletConnect Cloud
  transports: {
    // 方式 1：使用公共 RPC
    // [sepolia.id]: http("https://ethereum-sepolia-rpc.publicnode.com"),

    // 方式 2：使用 Alchemy（推荐）
    [mainnet.id]: http(
      "https://eth-mainnet.g.alchemy.com/v2/wMRzWF5oQYg2oNxm0sgPG"
    ), // 必须配置所有链的 transport
    [sepolia.id]: http(
      "https://eth-sepolia.g.alchemy.com/v2/wMRzWF5oQYg2oNxm0sgPG"
    ),

    // 方式 3：使用 Infura
    // [sepolia.id]: http('https://sepolia.infura.io/v3/YOUR_API_KEY'),

    // 方式 4：使用 Ankr
    // [sepolia.id]: http('https://rpc.ankr.com/eth_sepolia'),
  },
  chains: [mainnet, sepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
});
