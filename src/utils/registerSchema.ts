import { ethers } from "ethers";
const registryAbi = {
  address: "0x0cD376ff9884625bb930e194F48Adf91CA61D74C",
  abi: [
    {
      inputs: [],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [],
      name: "AlreadyExists",
      type: "error",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "uid",
          type: "bytes32",
        },
        {
          indexed: true,
          internalType: "address",
          name: "registerer",
          type: "address",
        },
        {
          components: [
            {
              internalType: "bytes32",
              name: "uid",
              type: "bytes32",
            },
            {
              internalType: "contract ISchemaResolver",
              name: "resolver",
              type: "address",
            },
            {
              internalType: "bool",
              name: "revocable",
              type: "bool",
            },
            {
              internalType: "string",
              name: "schema",
              type: "string",
            },
          ],
          indexed: false,
          internalType: "struct SchemaRecord",
          name: "schema",
          type: "tuple",
        },
      ],
      name: "Registered",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "uid",
          type: "bytes32",
        },
      ],
      name: "getSchema",
      outputs: [
        {
          components: [
            {
              internalType: "bytes32",
              name: "uid",
              type: "bytes32",
            },
            {
              internalType: "contract ISchemaResolver",
              name: "resolver",
              type: "address",
            },
            {
              internalType: "bool",
              name: "revocable",
              type: "bool",
            },
            {
              internalType: "string",
              name: "schema",
              type: "string",
            },
          ],
          internalType: "struct SchemaRecord",
          name: "",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "schema",
          type: "string",
        },
        {
          internalType: "contract ISchemaResolver",
          name: "resolver",
          type: "address",
        },
        {
          internalType: "bool",
          name: "revocable",
          type: "bool",
        },
      ],
      name: "register",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "version",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ],
};
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
