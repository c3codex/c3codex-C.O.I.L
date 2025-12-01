import { ethers } from "ethers";
import { CID } from "multiformats/cid";
import * as digest from "multiformats/hashes/digest";
import * as pb from "multiformats/codecs/dag-pb";

// -----------------------------------------
// 1) Read environment variables
// -----------------------------------------
const cidv0 = process.env.NEW_IPFS_CID;
const privateKey = process.env.ETH_PRIVATE_KEY;
const infuraId = process.env.INFURA_ID;

if (!cidv0) throw new Error("Missing NEW_IPFS_CID");
if (!privateKey) throw new Error("Missing ETH_PRIVATE_KEY");
if (!infuraId) throw new Error("Missing INFURA_ID");

// -----------------------------------------
// 2) Convert CIDv0 → CIDv1 (required by ENS)
// -----------------------------------------
const cid = CID.parse(cidv0);
const cid1 = cid.toV1();

// Encode contenthash per ENS standard
const contenthashBytes = pb.encode({
  Data: new Uint8Array(),
  Links: []
});

const digestBytes = digest.create(0x12, contenthashBytes);

// Final hex encoding for ENS
const encodedContenthash =
  "0x" + digestBytes.bytes.slice(0, 34).toString("hex");

// -----------------------------------------
// 3) Connect wallet + ENS registry
// -----------------------------------------
const provider = new ethers.JsonRpcProvider(
  `https://mainnet.infura.io/v3/${infuraId}`
);

const wallet = new ethers.Wallet(privateKey, provider);

const ENS_REGISTRY = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
const registryAbi = [
  "function setContenthash(bytes32 node, bytes hash) external"
];

const registry = new ethers.Contract(
  ENS_REGISTRY,
  registryAbi,
  wallet
);

// -----------------------------------------
// 4) Compute namehash(c3dao.eth)
// -----------------------------------------
const node = ethers.namehash("c3dao.eth");

// -----------------------------------------
// 5) Send transaction
// -----------------------------------------
console.log("Writing contenthash to ENS:", encodedContenthash);

const tx = await registry.setContenthash(node, encodedContenthash);
console.log("TX sent:", tx.hash);

const receipt = await tx.wait();
console.log("TX confirmed:", receipt.transactionHash);

console.log("ENS contenthash update complete.");
