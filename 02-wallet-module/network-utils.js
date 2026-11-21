// Keep chain ID normalization independent from Reown so this helper is easy to test.
export function findNetworkByChainId(chainId, networks) {
  if (!Array.isArray(networks)) {
    throw new TypeError("findNetworkByChainId expects a network array.");
  }

  if (typeof chainId !== "number" && typeof chainId !== "string") {
    return undefined;
  }

  if (typeof chainId === "string" && chainId.trim() === "") {
    return undefined;
  }

  const numericChainId = Number(chainId);

  if (!Number.isSafeInteger(numericChainId)) {
    return undefined;
  }

  return networks.find((network) => network?.id === numericChainId);
}
