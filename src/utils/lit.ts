import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { ethers } from "ethers";
import siwe from "siwe";

export const litNodeClient = new LitJsSdk.LitNodeClientNodeJs({
  alertWhenUnauthorized: false,
  litNetwork: "habanero",
});

const accessControlConditions = [
  {
    contractAddress: "",
    standardContractType: "",
    chain: "ethereum",
    method: "eth_getBalance",
    parameters: [":userAddress", "latest"],
    returnValueTest: {
      comparator: ">=",
      value: "0",
    },
  },
];

export async function litEncrypt(statement: string) {
  console.log({ statement });
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!);
  const address = ethers.getAddress(await wallet.getAddress());
  const domain = "localhost";
  const origin = "https://localhost/login";
  const expirationTime = new Date(
    Date.now() + 1000 * 60 * 60 * 24 * 7 * 10000
  ).toISOString();

  let nonce = await litNodeClient.getLatestBlockhash();
  const siweMessage = new siwe.SiweMessage({
    domain,
    address: address,
    statement,
    uri: origin,
    version: "1",
    chainId: 8453,
    nonce,
    expirationTime,
  });
  const messageToSign = siweMessage.prepareMessage();
  const signature = await wallet.signMessage(messageToSign);

  const authSig = {
    sig: signature,
    derivedVia: "web3.eth.personal.sign",
    signedMessage: messageToSign,
    address: address,
  };
  const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptString(
    {
      accessControlConditions,
      authSig,
      chain: "base",
      dataToEncrypt: statement,
    },
    litNodeClient
  );
  return {
    ciphertext,
    dataToEncryptHash,
  };
}
