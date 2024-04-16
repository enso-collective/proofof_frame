import { EventEmitter } from "events";
import { eas_mint } from "./utils/eas";
import axios from "axios";
import { db } from "./utils/db";

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
  try {
    const mintPayload = JSON.parse(data) as MintPayload;
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
    const { data: responsePayload } = await axios.post(
      process.env.MINT_FRAME_URL || "",
      {
        key: process.env.ENSO_KEY,
        username: user.username,
        imageUrl: mintPayload.image,
        message: mintPayload.text,
        castHash: mintPayload.castHash,
        wallet: ethAddress,
      },
      {
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
      }
    );
    if (responsePayload.message) {
      await db.from("attestations").insert({
        job_id: mintPayload.jobId,
        is_valid: false,
        cast: mintPayload.castHash,
        message: responsePayload.message,
      });
    }
    if (responsePayload.url) {
      await db.from("attestations").insert({
        job_id: mintPayload.jobId,
        is_valid: true,
        cast: mintPayload.castHash,
        tx: responsePayload.url,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

// const tx = await eas_mint(
//   frameData?.castId?.hash as string,
//   String(frameData?.fid),
//   returnedText,
//   embedWithImage.url,
//   "Testing"
// );

// returnedText += `\n \n https://www.onceupon.gg/${tx.tx.hash}`;
// willRedirect = `https://www.onceupon.gg/${tx.tx.hash}`;

// if (willRedirect) {
//   buttons.push(<Button.Link href={willRedirect}>Visit</Button.Link>);
// }

// let { data: user } = await db
//     .from("users")
//     .select()
//     .eq("id", payload.user_id)
//     .limit(1)
//     .single();

//   await db.from("stories").insert({
//     ...payload,
//     user_id: payload.user_id,
//   });
