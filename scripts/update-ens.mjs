// scripts/update-ens.mjs

import { createWalletClient, http, formatBytes32String } from "viem";
import { mainnet } from "viem/chains";
import * as contentHash from "@ensdomains/content-hash";

// ENV VARS
const CID = process.env.NEW_IPFS_CID;
const PRIVATE_KEY = process.env.ETH_PRIVATE_KEY;
const INFURA_ID = process.env.INFURA_ID;

if (!CID) throw new Error("❌ Missing NEW_IPFS_CID");
if (!PRIVATE_KEY) throw new Error("❌ Missing ETH_PRIVATE_KEY");
if (!INFURA_ID) throw new Error("❌ Missing INFURA_ID");

// ENS NAME YOU ARE UPDATING
const ENS_NAME = "c3dao.eth";

// Build IPFS contenthash
const encoded = "0x" + contentHash.encode("ipfs-ns", CID);

console.log("✨ Updating ENS contenthash for", ENS_NAME);
console.log("→ CID:", CID);
console.log("→ Encoded contenthash:", encoded);

// Wallet client
const client = createWalletClient({
  chain: mainnet,
  transport: http(`https://mainnet.infura.io/v3/${INFURA_ID}`),
  account: PRIVATE_KEY
});

// ENS Registry contract
const ENS_REGISTRY = {
  address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
  abi: [
    {
      constant: false,
      inputs: [
        { name: "node", type: "bytes32" },
        { name: "hash", type: "bytes" }
      ],
      name: "setContenthash",
      type: "function"
    }
  ]
};

// Compute namehash manually (viem style)
import { namehash } from "viem/ens";

const node = namehash(ENS_NAME);

// Send the TX
const txHash = await client.writeContract({
  ...ENS_REGISTRY,
  functionName: "setContenthash",
  args: [node, encoded]
});

console.log("⏳ TX submitted:", txHash);

// Wait for confirmation
await client.waitForTransactionReceipt({ hash: txHash });

console.log("✅ ENS contenthash updated successfully!");
