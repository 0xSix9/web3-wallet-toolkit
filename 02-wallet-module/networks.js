import {
  arbitrum,
  base,
  bsc,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from "@reown/appkit/networks";
import { findNetworkByChainId } from "./network-utils.js";

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
  return findNetworkByChainId(chainId, supportedNetworks);
}
