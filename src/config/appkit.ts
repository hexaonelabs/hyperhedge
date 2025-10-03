import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { arbitrum, mainnet, sepolia } from "@reown/appkit/networks";

const projectId = import.meta.env.VITE_REOWN_PROJECTID || "";

const wagmiAdapter = new WagmiAdapter({
  networks: [mainnet, arbitrum, sepolia],
  projectId,
});

const metadata = {
  name: "Hyperhedge",
  description: "Automated funding rate arbitrage on Hyperliquid.",
  url: "https://hyperhedge.web.app",
  icons: ["./icon.png"],
};

export const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet, arbitrum, sepolia],
  projectId,
  metadata,
  features: {
    analytics: true // Optionnel
  }
});

export { wagmiAdapter };
