import { EventEmitter } from "events";
import axios from "axios";
import { db } from "./utils/db";
import { ethers } from "ethers";

const degenProvider = new ethers.JsonRpcProvider(
  "https://rpc.degen.tips",
  666666666
);
interface MintPayload {
  castHash: string;
  userFid: string;
  text: string;
  image: string;
  label: string;
  jobId: string;
  ethAddress: string;
}

interface User {
  object: string;
  fid: number;
  custody_address: string;
  username: string;
  display_name: string;
  pfp_url: string;
  profile: {
    bio: {
      text: string;
      mentioned_profiles: any[];
    };
  };
  follower_count: number;
  following_count: number;
  verifications: string[];
  verified_addresses: {
    eth_addresses: string[];
    sol_addresses: string[];
  };
  active_status: string;
  power_badge: boolean;
}

interface Payload {
  users: User[];
}

class StartMintProcess extends EventEmitter {
  constructor() {
    super();
  }
}
export const mintProcess = new StartMintProcess();

mintProcess.on("START_MINTING", async (data) => {
  const mintPayload = JSON.parse(data) as MintPayload;
  try {
    let { data: attestation } = await db
      .from("validations")
      .select()
      .eq("job_id", mintPayload.jobId)
      .limit(1)
      .single();

    const { data: mintResponse } = await axios.post(
      "https://us-central1-enso-collective.cloudfunctions.net/internalMintWebhook",
      {
        key: process.env.ENSO_KEY!,
        username: attestation.username,
        attestWallet: attestation.address,
        postUrl: `https://warpcast.com/${
          attestation.username
        }/${mintPayload.castHash.slice(0, 10)}`,
        postImageLink: mintPayload.image,
        postContent: mintPayload.text,
        questId: "General",
      },

      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log(mintResponse);
    const { data: transactionResponse } = await axios.post(
      "https://api.syndicate.io/transact/sendTransaction",
      {
        projectId: process.env.SYNDICATE_PROJECT_ID!,
        contractAddress: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed",
        chainId: 8453,
        functionSignature: "transfer(address account, uint256 value)",
        args: {
          account: attestation.address,
          value: ethers.parseEther("0.1"),
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SYNDICATE_API_KEY!}`,
        },
      }
    );

    await db.from("attestations").insert({
      job_id: mintPayload.jobId,
      is_valid: true,
      cast: mintPayload.castHash,
      // tx: `https://www.onceupon.xyz/${degenHash}`,
      tx: mintResponse.url,
      tx_id: transactionResponse.transactionId,
      // degenTx: `https://www.onceupon.xyz/${secondTx.hash}`,
    });
  } catch (error: any) {
    console.log(error);
  }
});

mintProcess.on("START_VALIDATING", async (data) => {
  const mintPayload = JSON.parse(data) as MintPayload;
  let withError = true;
  let address = "";
  let username = "";

  try {
    const url = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${mintPayload.userFid}`;
    const headers = {
      accept: "application/json",
      api_key: process.env.NEYNAR_API_KEY,
    };
    const {
      data: { users },
    } = await axios.get<Payload>(url, { headers });
    const [user] = users;
    if (!user) {
      return;
    }
    const addresses = user?.verified_addresses?.eth_addresses;
    if (!Array.isArray(addresses) || !addresses[0]) {
      return;
    }
    const [ethAddress] = addresses;
    address = ethAddress;
    username = user.username;
    const { data: responsePayload } = await axios.post(
      "https://us-central1-enso-collective.cloudfunctions.net/validationWebhook",
      {
        key: process.env.ENSO_KEY,
        username: user.username,
        imageUrl: mintPayload.image,
        message: mintPayload.text,
      },
      {
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
      }
    );
    if (responsePayload?.brand) {
      withError = false;
    }
  } catch (error: any) {
    withError = true;
    console.log(error);
  } finally {
    try {
      await db.from("validations").insert({
        job_id: mintPayload.jobId,
        cast: mintPayload.castHash,
        text: mintPayload.text,
        image: mintPayload.image,
        fid: mintPayload.userFid,
        is_valid: !withError,
        address,
        username,
      });
    } catch (error) {
      console.log(error);
    }
  }
});
