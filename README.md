# Web3 Wallet Toolkit

[![Build](https://github.com/0xSix9/web3-wallet-toolkit/actions/workflows/build.yml/badge.svg)](https://github.com/0xSix9/web3-wallet-toolkit/actions/workflows/build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

A reusable **EVM wallet connection starter** built with Vanilla JavaScript, [Reown AppKit](https://reown.com/appkit), and ethers v6.

The repository is organized into three numbered sections so you can quickly find what you need:

## Project structure

```text
web3-wallet-toolkit/
│
├── 01-demo/                     # 1. Runnable example application
│   ├── index.html               # Demo page
│   ├── main.js                  # Demo interactions
│   └── styles.css               # Demo styling
│
├── 02-wallet-module/            # 2. Reusable wallet integration code
│   ├── appkit.js                # Reown AppKit initialization
│   ├── index.js                 # Public API / exports
│   ├── networks.js              # Supported EVM networks
│   ├── network-utils.js         # Chain ID validation and lookup
│   └── wallet.js                # Wallet state and actions
│
├── 03-tests/                    # 3. Unit tests
│   └── network-utils.test.js    # Network utility tests
│
├── .github/workflows/           # GitHub Actions CI
├── .env.example                 # Environment variable template
├── .gitignore
├── package.json                 # Dependencies and commands
├── vite.config.js               # Vite paths and build configuration
├── README.md
└── LICENSE
```

### Where should I start?

| Your goal | Open this |
| --- | --- |
| See the wallet UI and run the example | `01-demo/` |
| Reuse wallet connection in another dApp | `02-wallet-module/` |
| Understand or run the automated tests | `03-tests/` |
| Change dependencies or run commands | `package.json` |
| Configure the Reown Project ID | `.env` |

## Features

- Reown AppKit connection modal and `<appkit-button>`
- Injected wallet connections and WalletConnect QR connections supported by AppKit
- Account address and connection state
- EVM network information and network switching
- Disconnect through the active AppKit session
- Ethers v6 `BrowserProvider` and signer helpers
- One network list shared by AppKit and the demo

## Supported networks

| Network | Chain ID |
| --- | ---: |
| Ethereum | `1` |
| BNB Smart Chain | `56` |
| Base | `8453` |
| Arbitrum One | `42161` |
| Optimism | `10` |
| Polygon | `137` |
| Sepolia Testnet | `11155111` |

Edit `02-wallet-module/networks.js` to add or remove networks supported by Reown AppKit.

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- A Reown AppKit Project ID from the [Reown Dashboard](https://dashboard.reown.com/)

### Reown package versions

The AppKit core and Ethers adapter are intentionally pinned to the same `1.8.24` release because this starter uses the Reown 1.x API. Reown AppKit 2.x is a separate major-version migration. Before upgrading, review the official migration guidance, update both Reown packages together, and test the complete wallet flow. Do not upgrade only one package.

## Run the demo

### 1. Get a Reown Project ID

1. Open the [Reown Dashboard](https://dashboard.reown.com/).
2. Create a project and select **AppKit**.
3. Open the project and copy its **Project ID**.

The Project ID identifies your frontend application. It is not a private key, seed phrase, or wallet password.

### 2. Configure the environment

Run this command in the repository root:

```bash
cp .env.example .env
```

Add your own Project ID to the `.env` file:

```env
VITE_REOWN_PROJECT_ID=your_actual_reown_project_id
```

Keep `.env` private and do not commit it. The repository's `.gitignore` already excludes it.

### 3. Install and start

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, then click the Reown connect button.

### 4. Build and test

```bash
npm test
npm run build
npm run preview
```

The tests cover Chain ID normalization, configured network lookup, unsupported networks, and invalid input. GitHub Actions runs the tests and production build on pushes and pull requests targeting `main`.

## Reuse the wallet module in your own Vite project

You do not need the demo or its CSS. Copy only the contents of `02-wallet-module/` into your own project's wallet folder. For example:

```text
your-dapp/
└── src/
    └── lib/
        └── wallet/
            ├── appkit.js
            ├── index.js
            ├── networks.js
            ├── network-utils.js
            └── wallet.js
```

### 1. Install the dependencies

In your dApp project, run:

```bash
npm install @reown/appkit@1.8.24 @reown/appkit-adapter-ethers@1.8.24 ethers
```

### 2. Add your Project ID

Create or update the `.env` file in your dApp's project root:

```env
VITE_REOWN_PROJECT_ID=your_actual_reown_project_id
```

This module expects a Vite-style `import.meta.env` environment. Other build tools may require adapting how the Project ID is provided.

### 3. Import the wallet API

For the example folder structure above:

```js
import {
  openConnectModal,
  openAccountModal,
  disconnectWallet,
  switchNetwork,
  getWalletState,
  subscribeToWallet,
  getWalletProvider,
  getEthersProvider,
  getSigner,
} from "./lib/wallet/index.js";
```

Importing this module initializes Reown AppKit and registers its web components.

### 4. Add a connection button

The simplest option is Reown's ready-made button:

```html
<appkit-button></appkit-button>
```

Or use your own button:

```html
<button id="connect-wallet" type="button">Connect wallet</button>
```

```js
import { openConnectModal } from "./lib/wallet/index.js";

document
  .getElementById("connect-wallet")
  .addEventListener("click", () => openConnectModal());
```

### 5. Read wallet state

`subscribeToWallet` immediately invokes the callback with the current state and then reports account and network updates:

```js
import {
  getWalletState,
  subscribeToWallet,
} from "./lib/wallet/index.js";

console.log(getWalletState());

const unsubscribe = subscribeToWallet((wallet) => {
  console.log("Connected:", wallet.isConnected);
  console.log("Address:", wallet.address);
  console.log("Chain:", wallet.chainName);
  console.log("Chain ID:", wallet.chainId);
});

// Call this when the part of your app using the subscription is removed.
unsubscribe();
```

The state has this shape:

```js
{
  isConnected: true,
  address: "0x...",
  chainId: 1,
  chainName: "Ethereum"
}
```

Address, Chain ID, and Chain Name are `null` when the related information is unavailable.

### 6. Switch networks

Pass a configured Chain ID:

```js
import { switchNetwork } from "./lib/wallet/index.js";

await switchNetwork(8453); // Base
await switchNetwork(1);    // Ethereum
```

Only networks listed in `02-wallet-module/networks.js` can be selected through this helper.

### 7. Use ethers v6

After the wallet connects:

```js
import {
  getEthersProvider,
  getSigner,
} from "./lib/wallet/index.js";

const provider = getEthersProvider();
const signer = await getSigner();

console.log("Wallet address:", await signer.getAddress());
```

Use the provider for read-only blockchain calls and the signer for user-approved contract interactions.

## Configuration guide

| File | What it controls |
| --- | --- |
| `.env` | Your Reown Project ID |
| `02-wallet-module/networks.js` | Supported networks and default network |
| `02-wallet-module/appkit.js` | AppKit metadata and theme |
| `01-demo/main.js` | Example page behavior |
| `01-demo/styles.css` | Example page styling |

## Security and production notes

- Never request or store a user's seed phrase or private key.
- Never put private keys or server-side secrets in frontend code.
- The Project ID is used by a browser application, so it is not a secret. Configure allowed domains and usage controls in the Reown Dashboard where available.
- A connected wallet does not mean a user has approved a transaction. Always let the wallet show transaction details and require explicit approval.
- Verify chain IDs, token addresses, contract addresses, and transaction parameters before asking users to sign.
- This repository is a reusable starter, not a security-audited wallet or smart-contract SDK. Test your integration and review it before production use.

## References

- [Reown AppKit documentation](https://docs.reown.com/)
- [Official Reown Vanilla JavaScript + ethers example](https://github.com/reown-com/appkit-web-examples/tree/main/javascript/javascript-ethers)
- [Ethers v6 documentation](https://docs.ethers.org/v6/)
- [Vite environment variables](https://vite.dev/guide/env-and-mode)

## License

The original code in this repository is MIT licensed; see [LICENSE](./LICENSE). Third-party dependencies, including Reown AppKit, remain subject to their own licenses and terms. Review the [Reown AppKit Community License](https://github.com/reown-com/appkit#license-and-use) before using it in a commercial product.
