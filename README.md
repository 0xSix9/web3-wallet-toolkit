# Web3 Wallet Toolkit

[![Build](https://github.com/0xSix9/web3-wallet-toolkit/actions/workflows/build.yml/badge.svg)](https://github.com/0xSix9/web3-wallet-toolkit/actions/workflows/build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

A ready-to-use **EVM wallet connection starter** built with Vanilla JavaScript, [Reown AppKit](https://reown.com/appkit), and ethers v6.

This repository is both:
- a working Vite example that you can run and customize;
- a reusable wallet module that you can copy into your own dApp.

It is built around Reown AppKit—not a hand-written `window.ethereum` connection demo.

## What is included

- Reown's wallet connection modal and built-in `<appkit-button>`
- Injected wallet connections and WalletConnect QR connections supported by AppKit
- Account connection state and account address
- Network state and EVM network switching
- Disconnect support through the AppKit session
- Ethers v6 `BrowserProvider` and signer helpers
- A small Vanilla JavaScript example interface
- A central network list you can customize

## Supported networks

The starter is configured for:

| Network | Chain ID |
| --- | ---: |
| Ethereum | `1` |
| BNB Smart Chain | `56` |
| Base | `8453` |
| Arbitrum One | `42161` |
| Optimism | `10` |
| Polygon | `137` |
| Sepolia Testnet | `11155111` |

The supported list is in `src/lib/wallet/networks.js`. Remove networks you do not need or add other networks supported by Reown AppKit.

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- A Reown AppKit Project ID from the [Reown Dashboard](https://dashboard.reown.com/)

### Reown package versions

The AppKit core and Ethers adapter are intentionally pinned to the same `1.8.24` release because this starter uses the Reown 1.x API. Reown AppKit 2.0.0 and its matching Ethers adapter have since been released, but this repository has **not** been migrated to that major version. Treat a v2 upgrade as a separate migration: review the official migration guidance, update both Reown packages together, and test the complete wallet flow. Do not upgrade only one package.

## Run the example

### 1. Get your own Reown Project ID

1. Open the [Reown Dashboard](https://dashboard.reown.com/).
2. Create a project and select **AppKit**.
3. Open the project and copy its **Project ID**.

The Project ID is an application identifier used by Reown AppKit. It is not an Infura API key, private key, or wallet password.

### 2. Add the Project ID

In the repository root, copy the example environment file:

```bash
cp .env.example .env
```

Open `.env` and replace the placeholder:

```env
VITE_REOWN_PROJECT_ID=your_actual_reown_project_id
```

Use your own Project ID. Do not commit your personal `.env` file; it is already ignored by Git.

### 3. Install and run

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. Click the Reown connect button and approve the connection in your wallet.

Create a production build with:

```bash
npm run build
npm run preview
```

### 4. Run the tests

Run the unit tests with:

```bash
npm test
```

The tests cover chain ID normalization, configured network lookup, unsupported networks, and invalid input handling. The GitHub Actions workflow runs the tests and production build on pushes and pull requests targeting `main`.

## Reuse the wallet module in another Vite project

You do not need to copy the demo page or its CSS. Copy only this folder into your own project:

```text
src/lib/wallet/
├── appkit.js
├── index.js
├── networks.js
├── network-utils.js
└── wallet.js
```

Install the required packages in your project:

```bash
npm install @reown/appkit@1.8.24 @reown/appkit-adapter-ethers@1.8.24 ethers
```

Create a `.env` file in your project root and add your own Project ID:

```env
VITE_REOWN_PROJECT_ID=your_actual_reown_project_id
```

Import the API from the module:

```js
import {
  openConnectModal,
  openAccountModal,
  disconnectWallet,
  switchNetwork,
  getWalletState,
  subscribeToWallet,
  getEthersProvider,
  getSigner,
} from "./lib/wallet/index.js";
```

### Add the ready-made connect button

Place this web component wherever you want the connection button to appear:

```html
<appkit-button></appkit-button>
```

You do **not** need to add an HTML `id` or put your Project ID in this element. Importing the wallet module initializes AppKit and registers the component. The Project ID is read from `VITE_REOWN_PROJECT_ID` in your environment file.

### Use a custom connect button instead

```html
<button id="connect-wallet" type="button">Connect wallet</button>
```

```js
import { openConnectModal } from "./lib/wallet/index.js";

document
  .getElementById("connect-wallet")
  .addEventListener("click", () => openConnectModal());
```

### Read wallet state and listen for changes

```js
import {
  getWalletState,
  subscribeToWallet,
} from "./lib/wallet/index.js";

// Read the current state once.
console.log(getWalletState());

// Keep your UI in sync when the user connects, disconnects,
// changes accounts, or switches networks.
const unsubscribe = subscribeToWallet((wallet) => {
  console.log("Connected:", wallet.isConnected);
  console.log("Address:", wallet.address);
  console.log("Chain:", wallet.chainName);
  console.log("Chain ID:", wallet.chainId);
});

// Call unsubscribe() when this part of your app is removed.
```

The callback receives:

```js
{
  isConnected: true,
  address: "0x...",
  chainId: 1,
  chainName: "Ethereum"
}
```

Values are `null` when the related wallet information is not available.

### Switch networks

Pass a configured EVM chain ID:

```js
import { switchNetwork } from "./lib/wallet/index.js";

await switchNetwork(8453); // Base
await switchNetwork(1);    // Ethereum
```

Only networks listed in `src/lib/wallet/networks.js` can be selected through this helper.

### Use ethers v6

After the wallet connects, request an ethers provider or signer:

```js
import {
  getEthersProvider,
  getSigner,
} from "./lib/wallet/index.js";

const provider = getEthersProvider();
const signer = await getSigner();

console.log("Wallet address:", await signer.getAddress());
```

Use the provider and signer with ethers v6 for read-only calls and user-approved contract interactions.

## Project structure

```text
web3-wallet-toolkit/
├── .env.example
├── .gitignore
├── .github/
│   └── workflows/
│       └── build.yml             # Test and production-build checks
├── index.html                    # Runnable example UI
├── package.json
├── README.md
├── LICENSE
└── src/
    ├── main.js                   # Example page event handling
    ├── styles.css                # Example page styles
    └── lib/
        └── wallet/
            ├── appkit.js         # Reown AppKit initialization
            ├── index.js          # Public import surface
            ├── networks.js       # Supported EVM networks
            ├── network-utils.js  # Chain ID normalization and lookup
            ├── network-utils.test.js # Unit tests
            └── wallet.js         # Reusable wallet actions and state
```

## Configuration

- **Reown Project ID:** set `VITE_REOWN_PROJECT_ID` in your local environment file.
- **Supported networks:** edit `src/lib/wallet/networks.js`. The AppKit configuration and the demo's network selector both use this same list, so new entries appear in the selector automatically.
- **Default network:** change the `defaultNetwork` export in `networks.js`.
- **App metadata and theme:** edit `src/lib/wallet/appkit.js`.

This starter targets browser-based Vanilla JavaScript projects using Vite. Other frameworks and bundlers may use different environment-variable naming conventions and initialization patterns.

## Security and production notes

- Never request or store a user's seed phrase or private key.
- Never put private keys or server-side secrets in frontend code.
- The Project ID is used by a browser application, so it is not a secret. Configure allowed domains and usage controls in the Reown Dashboard where available.
- A connected wallet does not mean a user has approved a transaction. Always let the wallet show the transaction details and require the user's explicit approval.
- Verify chain IDs, token addresses, contract addresses, and transaction parameters before asking users to sign.
- This repository is a reusable starter, not a security-audited wallet or smart-contract SDK. Review and test your own integration before production use.

## References

- [Reown AppKit documentation](https://docs.reown.com/)
- [Official Reown Vanilla JavaScript + ethers example](https://github.com/reown-com/appkit-web-examples/tree/main/javascript/javascript-ethers)
- [Ethers v6 documentation](https://docs.ethers.org/v6/)
- [Vite environment variables](https://vite.dev/guide/env-and-mode)

## License

The original code in this repository is MIT licensed; see [LICENSE](./LICENSE). Third-party dependencies, including Reown AppKit, remain subject to their own licenses and terms. Review the [Reown AppKit Community License](https://github.com/reown-com/appkit#license-and-use) before using it in a commercial product.
