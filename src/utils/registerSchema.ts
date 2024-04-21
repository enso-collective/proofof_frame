import { ethers } from "ethers";
import registryAbi from "./registrySchema.json";

const degenProvider = new ethers.JsonRpcProvider(
  "https://rpc.degen.tips",
  666666666
);

const CONTRACT_ADDRESS = "0x0cD376ff9884625bb930e194F48Adf91CA61D74C";
const signer = new ethers.Wallet(
  process.env.PRIVATE_KEY as string,
  degenProvider
);
const reigstryContract = new ethers.Contract(
  CONTRACT_ADDRESS,
  registryAbi as any,
  signer
);

const schema =
  "uint32 timestamp, uint32 farcasterID, string castHash, string castTextContent, string castImageLink, string associatedBrand";

export async function deploySchema() {
  const tx = await reigstryContract.register(
    schema,
    "0xd350f597cef325eccbbe2f26b9cbf16d50c220bd",
    true
  );

  const reciept = tx.wait();
  return { tx, reciept };
}
