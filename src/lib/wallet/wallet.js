import { BrowserProvider } from "ethers";
import { appKit } from "./appkit.js";
import { findNetwork } from "./networks.js";

let accountState = {};
let networkState = {};
let walletProvider = null;

const walletListeners = new Set();

function getSnapshot() {
  return {
    isConnected: accountState?.isConnected ?? appKit.getIsConnectedState(),
    address: accountState?.address ?? null,
    chainId: networkState?.chainId ?? null,
    chainName: networkState?.caipNetwork?.name ?? null,
  };
}

function notifyWalletListeners() {
  const state = getSnapshot();

  for (const listener of walletListeners) {
    listener(state);
  }
}

// Keep the local state in sync with Reown AppKit.
appKit.subscribeAccount((state) => {
  accountState = state ?? {};
  notifyWalletListeners();
});

appKit.subscribeNetwork((state) => {
  networkState = state ?? {};
  notifyWalletListeners();
});

appKit.subscribeProviders((providers) => {
  walletProvider = providers?.eip155 ?? null;
});

// Open Reown's connection modal.
export function openConnectModal() {
  return appKit.open();
}

// Open the connected-account view.
export function openAccountModal() {
  return appKit.open({ view: "Account" });
}

// Disconnect the active session through Reown AppKit.
export function disconnectWallet() {
  return appKit.disconnect();
}

// Switch to one of the networks configured in networks.js.
export function switchNetwork(chainId) {
  const network = findNetwork(chainId);

  if (!network) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  return appKit.switchNetwork(network);
}

// Read the latest connection details.
export function getWalletState() {
  return getSnapshot();
}

// Subscribe to account and network changes.
// The returned function removes this listener.
export function subscribeToWallet(callback) {
  if (typeof callback !== "function") {
    throw new TypeError("subscribeToWallet expects a callback function.");
  }

  walletListeners.add(callback);
  callback(getSnapshot());

  return () => {
    walletListeners.delete(callback);
  };
}

// Access the active EIP-1193 provider when connected.
export function getWalletProvider() {
  if (!walletProvider) {
    throw new Error("No wallet provider is available. Connect a wallet first.");
  }

  return walletProvider;
}

// Get an ethers v6 BrowserProvider for contract and RPC operations.
export function getEthersProvider() {
  return new BrowserProvider(getWalletProvider());
}

// Get the currently connected wallet signer.
export async function getSigner() {
  return getEthersProvider().getSigner();
}
