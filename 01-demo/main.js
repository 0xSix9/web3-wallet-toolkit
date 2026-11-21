import "./styles.css";
import {
  disconnectWallet,
  getWalletState,
  subscribeToWallet,
  supportedNetworks,
  switchNetwork,
} from "../02-wallet-module/index.js";

const connectionStatus = document.getElementById("connection-status");
const accountAddress = document.getElementById("account-address");
const networkName = document.getElementById("network-name");
const chainId = document.getElementById("chain-id");
const networkSelect = document.getElementById("network-select");
const disconnectButton = document.getElementById("disconnect-button");
const feedback = document.getElementById("feedback");

function getErrorMessage(error, fallback) {
  return error?.shortMessage ?? error?.message ?? fallback;
}

// Build the selector from the same network list used by AppKit.
// This avoids keeping two separate network lists in sync by hand.
function populateNetworkSelect() {
  const options = supportedNetworks.map((network) => {
    const option = document.createElement("option");
    option.value = String(network.id);
    option.textContent = network.name;
    return option;
  });

  networkSelect.append(...options);
}

function shortenAddress(address) {
  if (!address) return "—";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function renderWallet(state) {
  const connected = Boolean(state.isConnected);

  connectionStatus.textContent = connected ? "Connected" : "Not connected";
  connectionStatus.classList.toggle("is-connected", connected);

  accountAddress.textContent = state.address
    ? shortenAddress(state.address)
    : "—";

  accountAddress.title = state.address ?? "";
  networkName.textContent = state.chainName ?? "—";
  chainId.textContent = state.chainId ?? "—";

  networkSelect.disabled = !connected;
  disconnectButton.disabled = !connected;
  networkSelect.value = state.chainId == null ? "" : String(state.chainId);
}

populateNetworkSelect();

// subscribeToWallet immediately emits the current snapshot, so a separate
// getWalletState() render here would duplicate the initial UI update.
subscribeToWallet(renderWallet);

disconnectButton.addEventListener("click", async () => {
  disconnectButton.disabled = true;
  feedback.textContent = "Disconnecting…";

  try {
    await disconnectWallet();
    feedback.textContent = "Wallet disconnected.";
  } catch (error) {
    feedback.textContent = getErrorMessage(
      error,
      "Could not disconnect the wallet.",
    );
    renderWallet(getWalletState());
  }
});

networkSelect.addEventListener("change", async (event) => {
  const selectedChainId = Number(event.target.value);
  networkSelect.disabled = true;
  feedback.textContent = "Waiting for wallet network switch…";

  try {
    await switchNetwork(selectedChainId);
    feedback.textContent = "Network switch request completed.";
  } catch (error) {
    feedback.textContent = getErrorMessage(
      error,
      "Could not switch network.",
    );
  } finally {
    // Restore the selector to the wallet's actual network if the request fails.
    // A later AppKit subscription update will render the new network on success.
    renderWallet(getWalletState());
  }
});
