import "./styles.css";
import { getNetworkName } from "./networks.js";
import {
  connectWallet,
  getWalletState,
  hasWalletProvider,
  subscribeToWalletEvents,
  switchNetwork,
} from "./wallet.js";

const ui = {
  status: document.querySelector("#connection-status"),
  account: document.querySelector("#account-address"),
  network: document.querySelector("#network-name"),
  chainId: document.querySelector("#chain-id"),
  connect: document.querySelector("#connect-button"),
  disconnect: document.querySelector("#disconnect-button"),
  networkSelect: document.querySelector("#network-select"),
  feedback: document.querySelector("#feedback"),
};

let currentAccount = null;
let removeWalletListeners = null;

function shortenAddress(address) {
  if (!address) return "—";
  return address.length > 12
    ? address.slice(0, 6) + "..." + address.slice(-4)
    : address;
}

function renderWallet(state) {
  currentAccount = state.account;
  const connected = Boolean(state.account);

  ui.status.textContent = connected ? "Connected" : "Not connected";
  ui.status.classList.toggle("is-connected", connected);
  ui.account.textContent = shortenAddress(state.account);
  ui.account.title = state.account ?? "";
  ui.network.textContent = connected ? getNetworkName(state.chainId) : "—";
  ui.chainId.textContent = connected ? state.chainId : "—";
  ui.connect.disabled = connected;
  ui.disconnect.disabled = !connected;
  ui.networkSelect.disabled = !connected;

  if (connected && ui.networkSelect.querySelector('option[value="' + state.chainId + '"]')) {
    ui.networkSelect.value = state.chainId;
  }
}

function showFeedback(message, type = "info") {
  ui.feedback.textContent = message;
  ui.feedback.dataset.type = type;
}

function clearWallet() {
  renderWallet({ account: null, chainId: null });
  if (removeWalletListeners) {
    removeWalletListeners();
    removeWalletListeners = null;
  }
}

// EIP-1193 has no standard method for a dApp to force-disconnect an account.
// This button resets the local demo UI; permissions can be revoked in the wallet.
ui.disconnect.addEventListener("click", () => {
  clearWallet();
  showFeedback("Disconnected from this demo. Revoke site access in your wallet's connected-sites settings.");
});

function listenToWallet() {
  if (removeWalletListeners) removeWalletListeners();

  removeWalletListeners = subscribeToWalletEvents({
    onAccountsChanged: async (accounts) => {
      if (!accounts.length) {
        clearWallet();
        showFeedback("The wallet account was disconnected.", "warning");
        return;
      }
      try {
        renderWallet(await getWalletState());
        showFeedback("Wallet account changed.");
      } catch (error) {
        showFeedback(error.message, "error");
      }
    },
    onChainChanged: async (chainId) => {
      try {
        const state = await getWalletState();
        renderWallet({ ...state, chainId });
        showFeedback("Network changed to " + getNetworkName(chainId) + ".");
      } catch (error) {
        showFeedback(error.message, "error");
      }
    },
    onDisconnect: () => {
      clearWallet();
      showFeedback("The wallet provider disconnected.", "warning");
    },
  });
}

ui.connect.addEventListener("click", async () => {
  ui.connect.disabled = true;
  showFeedback("Waiting for wallet approval...");

  try {
    const state = await connectWallet();
    renderWallet(state);
    listenToWallet();
    showFeedback("Wallet connected successfully.", "success");
  } catch (error) {
    renderWallet({ account: null, chainId: null });
    showFeedback(error.message || "Could not connect wallet.", "error");
  } finally {
    ui.connect.disabled = Boolean(currentAccount);
  }
});

ui.networkSelect.addEventListener("change", async (event) => {
  try {
    showFeedback("Requesting network switch...");
    await switchNetwork(event.target.value);
    const state = await getWalletState();
    renderWallet(state);
    showFeedback("Connected to " + getNetworkName(state.chainId) + ".", "success");
  } catch (error) {
    showFeedback(error.message || "Could not switch network.", "error");
    if (currentAccount) {
      try {
        renderWallet(await getWalletState());
      } catch {
        // Keep the last displayed state if the provider is temporarily unavailable.
      }
    }
  }
});

// Restore an already-authorized account without opening a wallet approval prompt.
async function restoreExistingConnection() {
  if (!hasWalletProvider()) {
    showFeedback("No injected wallet detected. Install MetaMask or another EIP-1193 wallet.");
    return;
  }

  try {
    const state = await getWalletState();
    if (!state.account) return;
    renderWallet(state);
    listenToWallet();
  } catch (error) {
    showFeedback(error.message || "Could not read wallet state.", "error");
  }
}

restoreExistingConnection();
