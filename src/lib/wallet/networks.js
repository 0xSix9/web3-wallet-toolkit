import {
  arbitrum,
  base,
  bsc,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from "@reown/appkit/networks";

// Edit this array to control which EVM networks your dApp supports.
export const supportedNetworks = [
  mainnet,
  bsc,
  base,
  arbitrum,
  optimism,
  polygon,
  sepolia,
];

export const defaultNetwork = mainnet;

export function findNetwork(chainId) {
  const numericChainId = Number(chainId);

  if (!Number.isSafeInteger(numericChainId)) {
    return undefined;
  }

  return supportedNetworks.find((network) => network.id === numericChainId);
}
