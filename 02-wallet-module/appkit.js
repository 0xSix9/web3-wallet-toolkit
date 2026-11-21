import { createAppKit } from "@reown/appkit";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { defaultNetwork, supportedNetworks } from "./networks.js";

const projectId = import.meta.env.VITE_REOWN_PROJECT_ID?.trim();

if (!projectId || projectId === "your_reown_project_id") {
  throw new Error(
    "Reown Project ID is missing. Copy .env.example to .env and set VITE_REOWN_PROJECT_ID.",
  );
}

const metadata = {
  name: "Web3 Wallet Toolkit",
  description: "Reusable EVM wallet connection starter",
  url: window.location.origin,
};

export const appKit = createAppKit({
  adapters: [new EthersAdapter()],
  networks: supportedNetworks,
  defaultNetwork,
  projectId,
  metadata,
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "#F5C34F",
  },
  features: {
    analytics: false,
  },
});
