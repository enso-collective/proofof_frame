import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Button, Frog } from "frog";
import { devtools } from "frog/dev";
import axios from "axios";
import { FarcasterResponse } from "./interface";
import { errorScreen, infoScreen } from "./middleware";
import dotenv from "dotenv";
import { IMAGE_LINKS_REGEX } from "./utils/misc";
import { eas_mint } from "./utils/eas";
dotenv.config();

export const app = new Frog({});
const port = process.env.PORT || 5000;

app.use("/*", serveStatic({ root: "./public" }));

app.frame("/", async (c) => {
  try {
    const { status, frameData } = c;
    switch (status) {
      case "response": {
        const url = `https://api.neynar.com/v2/farcaster/cast/conversation?identifier=${frameData?.castId?.hash}&type=hash&reply_depth=1&include_chronological_parent_casts=false`;
        const headers = {
          accept: "application/json",
          api_key: process.env.NEYNAR_API_KEY,
        };
        const {
          data: { conversation },
        } = await axios.get<FarcasterResponse>(url, { headers });
        const [firstSortedAndFilteredReply] = conversation?.cast?.direct_replies
          .map((t) => ({
            ...t,
            date: new Date(t.timestamp),
          }))
          .sort((a: any, b: any) => b?.date - a?.date)
          .filter((a) => Number(a.author.fid) === Number(frameData?.fid));

        if (!firstSortedAndFilteredReply?.text) {
          throw new Error("Please reply to this cast first");
        }
        let returnedText = firstSortedAndFilteredReply.text;
        const embedWithImage = firstSortedAndFilteredReply.embeds.find((t) =>
          new RegExp(IMAGE_LINKS_REGEX).test(t.url)
        );
        let willRedirect: string | boolean = false;
        if (embedWithImage) {
          const tx = await eas_mint(
            frameData?.castId?.hash as string,
            String(frameData?.fid),
            returnedText,
            embedWithImage.url,
            "Testing"
          );

          returnedText += `\n \n https://www.onceupon.gg/${tx.tx.hash}`;
          willRedirect = `https://www.onceupon.gg/${tx.tx.hash}`;
        }
        const buttons: any[] = [];
        if (willRedirect) {
          buttons.push(<Button.Link href={willRedirect}>Visit ↗</Button.Link>);
        }
        buttons.push(<Button.Reset>Reset</Button.Reset>);
        return c.res(infoScreen(returnedText, buttons));
      }
      default: {
        return c.res(
          infoScreen("Press button to display your reply to this cast", [
            <Button value="CAST_TEXT">Fetch text</Button>,
          ])
        );
      }
    }
  } catch (error: any) {
    console.log(error);
    return c.res(
      errorScreen(
        error.message.includes("reply") ? error.message : "Something went wrong"
      )
    );
  }
});

devtools(app, { serveStatic });

serve({
  fetch: app.fetch,
  port: Number(port),
});

console.log(`Server listening on ${port}`);
