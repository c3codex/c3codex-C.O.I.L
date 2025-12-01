import { createPublicClient, http, namehash, encodeAbiParameters } from "viem";
import { mainnet } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import contentHash from "@ensdomains/content-hash";

// ------------------------------
// ENV
// ------------------------------
const cid = process.env.NEW_IPFS_CID;
const pk = process.env.ETH_PRIVATE_KEY;
const infura = process.env.INFURA_ID;

if (!cid) throw new Error("Missing NEW_IPFS_CID");
if (!pk) throw new Error("Missing ETH_PRIVATE_KEY");
if (!infura) throw new Error("Missing INFURA_ID");

// ------------------------------
// Encode contenthash (IPFS → ENS format)
// ------------------------------
const encoded = "0x" + contentHash.encode("ipfs-ns", cid);

console.log("Encoded contenthash:", encoded);

// ------------------------------
// Connect wallet
// ------------------------------
const account = privateKeyToAccount(`0x${pk}`);

const client = createPublicClient({
  chain: mainnet,
  transport: http(`https://mainnet.infura.io/v3/${infura}`),
});

// ------------------------------
// ENS registry contract
// ------------------------------
const ENS_REGISTRY = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";

const registryAbi = [
  {
    name: "setContenthash",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "node", type: "bytes32" },
      { name: "hash", type: "bytes" },
    ],
    outputs: [],
  },
];

// ------------------------------
// Compute namehash
// ------------------------------
const node = namehash("c3dao.eth");

// ------------------------------
// Send transaction
// ------------------------------
console.log("Sending transaction…");

const hash = await client.writeContract({
  address: ENS_REGISTRY,
  abi: registryAbi,
  functionName: "setContenthash",
  args: [node, encoded],
  account,
});

console.log("TX sent:", hash);

console.log("Waiting for confirmation…");

await client.waitForTransactionReceipt({ hash });

console.log("ENS contenthash updated successfully.");
