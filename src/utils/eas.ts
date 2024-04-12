// @ts-ignore
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";

export async function eas_mint(
  cast_hash: string,
  fid: string,
  cast_content: string,
  cast_image_link: string,
  assoc_brand: string
) {
  const provider = ethers.getDefaultProvider("base-sepolia", {
    alchemy: process.env["ALCHEMY_KEY"],
  });
  const privateKey = process.env.PRIVATE_KEY || "";
  const signer = new ethers.Wallet(privateKey, provider);
  const eas = new EAS("0x4200000000000000000000000000000000000021");
  eas.connect(signer);

  const ts = Math.floor(Date.now() / 1000);

  cast_hash = cast_hash.startsWith("0x") ? cast_hash.substring(2) : cast_hash;
  const schemaEncoder = new SchemaEncoder(
    "uint32 timestamp, uint32 farcasterID, string castHash, string castTextContent, string castImageLink, string associatedBrand"
  );
  const encodedData = schemaEncoder.encodeData([
    { name: "timestamp", value: ts, type: "uint32" },
    { name: "farcasterID", value: fid, type: "uint32" },
    { name: "castHash", value: cast_hash, type: "string" },
    { name: "castTextContent", value: cast_content, type: "string" },
    { name: "castImageLink", value: cast_image_link, type: "string" },
    { name: "associatedBrand", value: assoc_brand, type: "string" },
  ]);
  const SchemaUID = process.env.ATTESTATION_SCHEMA || "";

  const tx = await eas.attest({
    schema: SchemaUID,
    data: {
      recipient: process.env.WALLET_ADDRESS as string,
      revocable: true,
      data: encodedData,
    },
  });

  return tx;
}
