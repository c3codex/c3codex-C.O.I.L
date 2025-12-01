// scripts/update-ens.mjs

import { createWalletClient, http } from "viem";
import { mainnet } from "viem/chains";
import * as contentHash from "@ensdomains/content-hash";
import { namehash } from "viem/ens";

// ENV VARS
const CID = process.env.NEW_IPFS_CID;
const PRIVATE_KEY = process.env.ETH_PRIVATE_KEY;
const INFURA_ID = process.env.INFURA_ID;

if (!CID) throw new Error("❌ Missing NEW_IPFS_CID");
if (!PRIVATE_KEY) throw new Error("❌ Missing ETH_PRIVATE_KEY");
if (!INFURA_ID) throw new Error("❌ Missing INFURA_ID");

// ENS NAME
const ENS_NAME = "c3dao.eth";

// Encode IPFS contenthash
const encoded = "0x" + contentHash.encode("ipfs-ns", CID);

console.log("✨ Updating ENS contenthash for:", ENS_NAME);
console.log("→ CID:", CID);
console.log("→ Encoded:", encoded);

// Wallet client
const client = createWalletClient({
  chain: mainnet,
  transport: http(`https://mainnet.infura.io/v3/${INFURA_ID}`),
  account: PRIVATE_KEY
});

// ENS Registry interface
const ENS_REGISTRY = {
  address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
  abi: [
    {
      inputs: [
        { name: "node", type: "bytes32" },
        { name: "hash", type: "bytes" }
      ],
      name: "setContenthash",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    }
  ]
};

// Compute namehash
const node = namehash(ENS_NAME);

// Send TX
const txHash = await client.writeContract({
  ...ENS_REGISTRY,
  functionName: "setContenthash",
  args: [node, encoded]
});

console.log("⏳ Transaction sent:", txHash);

// Wait for confirmation
await client.waitForTransactionReceipt({ hash: txHash });

console.log("✅ ENS contenthash updated successfully!");
