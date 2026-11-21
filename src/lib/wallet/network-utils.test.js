import assert from "node:assert/strict";
import test from "node:test";
import { findNetworkByChainId } from "./network-utils.js";

const networks = [
  { id: 1, name: "Ethereum" },
  { id: 8453, name: "Base" },
];

test("finds a configured network from a numeric chain ID", () => {
  assert.equal(findNetworkByChainId(1, networks), networks[0]);
  assert.equal(findNetworkByChainId(8453, networks), networks[1]);
});

test("accepts numeric chain IDs represented as strings", () => {
  assert.equal(findNetworkByChainId("1", networks), networks[0]);
  assert.equal(findNetworkByChainId("8453", networks), networks[1]);
});

test("returns undefined for a network that is not configured", () => {
  assert.equal(findNetworkByChainId(10, networks), undefined);
});

test("returns undefined for invalid or unsafe chain IDs", () => {
  const invalidChainIds = [
    undefined,
    null,
    "",
    "   ",
    "not-a-chain-id",
    true,
    false,
    1.5,
    Number.MAX_SAFE_INTEGER + 1,
    Symbol("chain-id"),
  ];

  for (const chainId of invalidChainIds) {
    assert.doesNotThrow(() => findNetworkByChainId(chainId, networks));
    assert.equal(findNetworkByChainId(chainId, networks), undefined);
  }
});

test("requires a network array", () => {
  assert.throws(
    () => findNetworkByChainId(1, null),
    {
      name: "TypeError",
      message: "findNetworkByChainId expects a network array.",
    },
  );
});
