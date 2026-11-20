import { NETWORKS } from "./networks.js";

function getProvider() {
  if (!window.ethereum) {
    throw new Error("No injected wallet found. Install a wallet such as MetaMask.");
  }
  return window.ethereum;
}

export function hasWalletProvider() {
  return typeof window !== "undefined" && Boolean(window.ethereum);
}

export async function connectWallet() {
  const provider = getProvider();
  const accounts = await provider.request({ method: "eth_requestAccounts" });
  if (!accounts?.length) throw new Error("The wallet did not return an account.");

  const chainId = await provider.request({ method: "eth_chainId" });
  return { account: accounts[0], chainId };
}

export async function getWalletState() {
  const provider = getProvider();
  const accounts = await provider.request({ method: "eth_accounts" });
  const chainId = await provider.request({ method: "eth_chainId" });
  return { account: accounts?.[0] ?? null, chainId };
}

export async function switchNetwork(chainId) {
  const provider = getProvider();
  const network = NETWORKS[chainId];
  if (!network) throw new Error("This network is not configured in the toolkit.");

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: network.chainId }],
    });
  } catch (error) {
    // Error 4902 means the wallet does not know this chain yet.
    if (error.code !== 4902) throw error;

    await provider.request({
      method: "wallet_addEthereumChain",
      params: [network],
    });
  }
}

// Returns a cleanup function so apps can remove listeners when they are no longer needed.
export function subscribeToWalletEvents(handlers) {
  const provider = getProvider();
  const onAccountsChanged = (accounts) => handlers.onAccountsChanged?.(accounts);
  const onChainChanged = (chainId) => handlers.onChainChanged?.(chainId);
  const onDisconnect = (error) => handlers.onDisconnect?.(error);

  provider.on("accountsChanged", onAccountsChanged);
  provider.on("chainChanged", onChainChanged);
  provider.on("disconnect", onDisconnect);

  return () => {
    provider.removeListener?.("accountsChanged", onAccountsChanged);
    provider.removeListener?.("chainChanged", onChainChanged);
    provider.removeListener?.("disconnect", onDisconnect);
  };
}
