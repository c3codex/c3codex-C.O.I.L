import { createRequire } from "module";
const require = createRequire(import.meta.url);

import { ethers } from "ethers";
const contentHash = require("@ensdomains/content-hash");

// ---- CONFIG ----
const ENS_NAME = "c3dao.eth";
const NEW_IPFS_CID = process.env.NEW_IPFS_CID;
const PRIVATE_KEY = process.env.ETH_PRIVATE_KEY;
const INFURA_ID = process.env.INFURA_ID;

if (!NEW_IPFS_CID) throw new Error("Missing NEW_IPFS_CID");
if (!PRIVATE_KEY) throw new Error("Missing ETH_PRIVATE_KEY");

// ---- CONNECT PROVIDER ----
const provider = new ethers.JsonRpcProvider(
  `https://mainnet.infura.io/v3/${INFURA_ID}`
);

// ---- SIGNER ----
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// ---- ENS REGISTRY ----
const registryAddress = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
const registryABI = [
  "function setContenthash(bytes32 node, bytes hash) external",
];

const registry = new ethers.Contract(registryAddress, registryABI, wallet);

// ---- PREP ENCODED CONTENTHASH ----
const encoded = "0x" + contentHash.encode("ipfs-ns", NEW_IPFS_CID);
const node = ethers.namehash(ENS_NAME);

// ---- UPDATE ENS ----
console.log("Updating ENS contenthash for:", ENS_NAME);
console.log("CID:", NEW_IPFS_CID);

const tx = await registry.setContenthash(node, encoded);
console.log("Transaction sent:", tx.hash);

await tx.wait();
console.log("ENS contenthash updated successfully!");
