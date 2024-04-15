import { EventEmitter } from "events";
import { eas_mint } from "./utils/eas";

interface MintPayload {
  castHash: string;
  userFid: string;
  text: string;
  image: string;
  label: string;
  jobId: string;
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
    console.log(mintPayload);
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
