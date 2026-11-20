# Web3 Wallet Toolkit

A modular, beginner-friendly EVM wallet connection starter built with **vanilla JavaScript** and **Vite**. Learn how injected wallets work, explore the EIP-1193 provider API, and reuse the wallet helpers in your own dApps.

> Educational starter project — not a production-audited wallet SDK.

## Features

- Connect to an injected EVM wallet such as MetaMask
- Read the connected account and active chain
- Restore an already-authorized account on page load
- React to account, chain, and provider disconnect events
- Switch between Ethereum, BNB Smart Chain, and Base
- Ask the wallet to add a configured network when it is not available
- Keep wallet logic separate from the demo interface

## Requirements

- Node.js 18 or newer
- npm
- An EIP-1193-compatible browser wallet (for example, MetaMask)

## Quick start

1. Clone this repository:

   ```bash
   git clone https://github.com/0xSix9/web3-wallet-toolkit.git
   cd web3-wallet-toolkit
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open the local URL printed by Vite, unlock your browser wallet, and click **Connect wallet**.
5. Create a production build with `npm run build`; preview it with `npm run preview`.

## Do I need an Infura API key?

**No — not for this wallet connection demo.** The browser wallet injects an EIP-1193 provider (commonly available as `window.ethereum`). This toolkit asks that provider for account and chain information. It does not require an Infura project ID or a custom RPC endpoint for these operations.

An RPC provider such as Infura is useful when your app needs to read blockchain data independently of the user's wallet, such as public contract data while no wallet is connected. That can be added as a separate module later.

Never put private credentials in frontend code. Any key shipped to a browser can be inspected by users. If a provider requires a browser-side project key, restrict it by allowed origins and usage limits wherever those controls are available.

## Project structure

```text
web3-wallet-toolkit/
├── index.html
├── package.json
├── .gitignore
└── src/
    ├── main.js       # Demo UI and event wiring
    ├── wallet.js     # Reusable EIP-1193 wallet functions
    ├── networks.js   # Supported chain configuration
    └── styles.css    # Demo styles
```

## Reuse the wallet module

Copy `src/wallet.js` and `src/networks.js` into your application, then import the functions you need:

```js
import {
  connectWallet,
  getWalletState,
  switchNetwork,
  subscribeToWalletEvents,
} from "./wallet.js";

const wallet = await connectWallet();
console.log(wallet.account, wallet.chainId);

// Ask the connected wallet to switch to Base.
await switchNetwork("0x2105");

// Listen for account and chain changes.
const unsubscribe = subscribeToWalletEvents({
  onAccountsChanged: (accounts) => {
    console.log("Selected account:", accounts[0] ?? null);
  },
  onChainChanged: (chainId) => {
    console.log("New chain:", chainId);
  },
});

// Call unsubscribe() when your app no longer needs these listeners.
```

The module expects a browser environment with an injected EIP-1193 provider. It does not create or store private keys, seed phrases, or wallet accounts.

## Supported networks

| Network | Chain ID |
| --- | --- |
| Ethereum | `0x1` |
| BNB Smart Chain | `0x38` |
| Base | `0x2105` |

Network definitions live in `src/networks.js`. Add another chain there using its verified chain ID, native currency, RPC URL, and block explorer. Always check network details against official documentation before using them.

## Important behavior and limitations

- **Connect:** `eth_requestAccounts` asks the user to approve account access.
- **Read state:** `eth_accounts` and `eth_chainId` read the currently authorized account and chain.
- **Switch chain:** `wallet_switchEthereumChain` asks the wallet to change networks. If the wallet returns error code `4902`, the toolkit requests that the chain be added.
- **Disconnect:** EIP-1193 does not define a universal method for a dApp to force-disconnect an account. The demo's Disconnect button clears its local UI and event listeners. To revoke permissions, the user must do so in the wallet's connected-sites settings.
- **Wallet discovery:** This starter uses the common `window.ethereum` injection pattern. Some browsers and multi-wallet setups expose providers differently; production apps should consider EIP-6963 provider discovery.

## Security notes

- Never ask users for their seed phrase or private key.
- Never place private keys or server secrets in frontend files.
- Treat wallet addresses, chain IDs, and provider responses as external input.
- Verify the chain and contract address before signing transactions.
- This starter does not send transactions or interact with smart contracts.

## Learning references

- [EIP-1193: Ethereum Provider JavaScript API](https://eips.ethereum.org/EIPS/eip-1193)
- [EIP-6963: Multi Injected Provider Discovery](https://eips.ethereum.org/EIPS/eip-6963)
- [MetaMask documentation](https://docs.metamask.io/)
- [Vite documentation](https://vite.dev/)

## License

MIT. See [LICENSE](./LICENSE).
