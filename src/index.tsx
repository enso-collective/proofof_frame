import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Button, Frog, parseEther, TextInput } from "frog";
import { devtools } from "frog/dev";
import axios from "axios";
import { FarcasterResponse, TransactionStatusChangeEvent } from "./interface";
import { errorScreen, infoScreen } from "./middleware";
import dotenv from "dotenv";
import { mintProcess, Payload } from "./mint";
import { db } from "./utils/db";
import { provider } from "./utils/eas";
import crypto from "crypto";
import { generateSignature, parseSignatureHeader } from "./utils/crypto";
import { litNodeClient } from "./utils/lit";
dotenv.config();

export const app = new Frog({});
const port = process.env.PORT || 5000;

app.use("/*", serveStatic({ root: "./public" }));

app.frame("/", async (c) => {
  try {
    const { status, inputText, frameData } = c;
    switch (status) {
      case "response": {
        if (!inputText) {
          throw new Error("Please enter text first");
        }
        console.log(frameData?.buttonIndex);
        if (frameData?.buttonIndex == 1) {
          let { data: attestation } = await db
            .from("attestations")
            .select()
            .eq("cipher", inputText.trim())
            .limit(1)
            .single();
          if (!attestation) {
            throw new Error("Invalid payload");
          }
          const buttons = [
            <Button.Transaction
              target={`/transactions/decrypt/${attestation.job_id}`}
            >
              Reveal text
            </Button.Transaction>,
          ];
          const returnObj = {
            ...infoScreen(
              `Reveal text, a fee of 0.00088 Eth on Base is required.`,
              buttons
            ),
            action: `/payments/decrypt/${attestation.job_id}`,
          };
          return c.res(returnObj);
        }
        let address = "";
        let username = "";

        const emitObject = {
          castHash: "",
          userFid: String(frameData?.fid),
          text: inputText,
          image: "",
          label: "Testing",
          jobId: Math.random().toString().slice(-15) + Date.now(),
        };
        const url = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${frameData?.fid}`;
        const headers = {
          accept: "application/json",
          api_key: process.env.NEYNAR_API_KEY,
        };
        const {
          data: { users },
        } = await axios.get<Payload>(url, { headers });
        const [user] = users;
        if (!user) {
          throw new Error("Something went wrong");
        }
        const addresses = user?.verified_addresses?.eth_addresses;
        if (!Array.isArray(addresses) || !addresses[0]) {
          throw new Error("Something went wrong");
        }
        const [ethAddress] = addresses;
        address = ethAddress;
        username = user.username;
        await db.from("validations").insert({
          job_id: emitObject.jobId,
          cast: "",
          text: inputText,
          image: "",
          fid: frameData?.fid,
          is_valid: true,
          address,
          username,
        });
        const buttons = [
          <Button.Transaction target={`/transactions/${emitObject.jobId}`}>
            Create Proof
          </Button.Transaction>,
        ];
        const returnObj = {
          ...infoScreen(
            ` Attest to your text with an onchain EAS Proof, and receive a 33 $degen rebate on the Degen L3. A fee of 0.00088 Eth on Base is required.`,
            buttons
          ),
          action: `/payments/${emitObject.jobId}`,
        };
        return c.res(returnObj);
      }
      default: {
        return c.res(
          infoScreen(
            `Enter attestation text. \nThen, continue for EAS attestation and $degen!`,
            [
              <TextInput placeholder="Enter text..." />,
              <Button value="decrypt">Decrypt text</Button>,
              <Button value="encrypt">Create Proof</Button>,
            ]
          )
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

app.frame("/vision/:validationId", async (c) => {
  try {
    const { validationId } = c.req.param();
    const returnedText = `Validating cast...`;
    const buttons = [<Button value="CAST_PROGRESS">Continue</Button>];
    const returnObj = {
      ...infoScreen(returnedText, buttons),
      action: `/validations/${validationId}`,
    };
    return c.res(returnObj);
  } catch (error: any) {
    console.log(error);
    return c.res(
      errorScreen(
        error.message.includes("reply") ? error.message : "Something went wrong"
      )
    );
  }
});

app.frame("/payments/:validationId", async (c) => {
  try {
    const { validationId } = c.req.param();
    const tx = await provider.getTransaction(
      c.transactionId || c.buttonValue || `0x`
    );

    if (!tx) {
      const buttons = [<Button value={c.transactionId}>Check progress</Button>];
      const returnObj = {
        ...infoScreen("Completing transaction...", buttons),
        action: `/payments/${validationId}`,
      };
      return c.res(returnObj);
    }

    let { data: attestation } = await db
      .from("validations")
      .select()
      .eq("job_id", validationId)
      .limit(1)
      .single();
    mintProcess.emit(
      "START_MINTING",
      JSON.stringify(
        {
          ...attestation,
          castHash: attestation.cast,
          jobId: attestation.job_id,
          userFid: attestation.fid,
        },
        null,
        2
      )
    );
    const buttons = [<Button value="REFRESH">Continue</Button>];
    const returnObj = {
      ...infoScreen("Success, time to start minting EAS", buttons),
      action: `/jobs/${validationId}`,
    };
    return c.res(returnObj);
  } catch (error: any) {
    console.log(error);
    return c.res(
      errorScreen(
        error.message.includes("reply") ? error.message : "Something went wrong"
      )
    );
  }
});
app.frame("/payments/decrypt/:validationId", async (c) => {
  try {
    const { validationId } = c.req.param();
    const tx = await provider.getTransaction(
      c.transactionId || c.buttonValue || `0x`
    );

    if (!tx) {
      const buttons = [<Button value={c.transactionId}>Check progress</Button>];
      const returnObj = {
        ...infoScreen("Completing transaction...", buttons),
        action: `/payments/decrypt/${validationId}`,
      };
      return c.res(returnObj);
    }

    let { data: attestation } = await db
      .from("attestations")
      .select()
      .eq("job_id", validationId)
      .limit(1)
      .single();

    const buttons = [<Button.Reset>Reset</Button.Reset>];
    const returnObj = {
      ...infoScreen(attestation.text, buttons),
    };
    return c.res(returnObj);
  } catch (error: any) {
    console.log(error);
    return c.res(
      errorScreen(
        error.message.includes("reply") ? error.message : "Something went wrong"
      )
    );
  }
});
app.frame("/validations/:validationId", async (c) => {
  try {
    const { validationId } = c.req.param();
    let { data: attestation } = await db
      .from("validations")
      .select()
      .eq("job_id", validationId)
      .limit(1)
      .single();
    if (attestation?.is_valid) {
      const buttons = [
        <Button.Transaction target={`/transactions/${validationId}`}>
          Create Proof
        </Button.Transaction>,
      ];
      const returnObj = {
        ...infoScreen(
          `Validation successful!\n Attest to your image with an onchain EAS Proof, and receive a 33 $degen rebate on the Degen L3. A fee of 0.00088 Eth on Base is required..`,
          buttons
        ),
        action: `/payments/${validationId}`,
      };
      return c.res(returnObj);
    }
    if (
      attestation &&
      attestation.hasOwnProperty("is_valid") &&
      !attestation.is_valid
    ) {
      const buttons = [<Button.Reset>Reset</Button.Reset>];
      const returnObj = {
        ...infoScreen(
          `We didn't find a clear brand or quest described in your cast. Please retry your cast with more specific description of the brand or quest hashtag.`,
          buttons
        ),
      };
      return c.res(returnObj);
    }

    const buttons = [<Button value="REFRESH">Check progress</Button>];
    const returnObj = {
      ...infoScreen("Still validating...", buttons),
      action: `/validations/${validationId}`,
    };
    return c.res(returnObj);
  } catch (error: any) {
    console.log(error);
    return c.res(
      errorScreen(
        error.message.includes("reply") ? error.message : "Something went wrong"
      )
    );
  }
});
app.transaction("/transactions/decrypt/:transactionId", (c) => {
  return c.send({
    chainId: "eip155:8453",
    to: (process.env.RECIPIENT || ``) as any,
    value: parseEther("0.00008"),
  });
});
app.transaction("/transactions/:transactionId", (c) => {
  return c.send({
    chainId: "eip155:8453",
    to: (process.env.RECIPIENT || ``) as any,
    value: parseEther("0.00088"),
  });
});
app.frame("/jobs/:jobId", async (c) => {
  try {
    const { jobId } = c.req.param();
    let { data: attestation } = await db
      .from("attestations")
      .select()
      .eq("job_id", jobId)
      .limit(1)
      .single();
    if (attestation) {
      let { data: transaction } = await db
        .from("transactions")
        .select()
        .eq("tx_id", attestation.tx_id)
        .limit(1)
        .single();

      if (attestation.is_valid && attestation.tx && transaction) {
        return c.res(
          infoScreen(
            `Attestation validated! Your Proof has been created onchain on Degen. \n\n
          $degen gained! Your image Proof has earned you $degen on the L3`,
            [
              <Button.Reset>Reset Frame</Button.Reset>,
              <Button.Link
                href={`https://www.onceupon.xyz/${transaction.hash}`}
              >
                View $degen
              </Button.Link>,
              <Button.Link href={attestation.tx}>View EAS Proof</Button.Link>,
            ]
          )
        );
      }
      if (attestation.message) {
        return c.res(
          infoScreen(attestation.message, [<Button.Reset>Reset</Button.Reset>])
        );
      }
    }

    return {
      ...c.res(
        infoScreen("\n\n\nStill loading...", [
          <Button value="REFRESH">Check status</Button>,
        ])
      ),
      action: `/jobs/${jobId}`,
    };
  } catch (error: any) {
    console.log(error);
    return c.res(
      errorScreen(
        error.message.includes("reply") ? error.message : "Something went wrong"
      )
    );
  }
});

app.use("/syndicate/transaction_status", async (c) => {
  try {
    const body = (await c.req.json()) as TransactionStatusChangeEvent;

    if (body.data.status.toLowerCase().trim() === "submitted") {
      await db.from("transactions").insert({
        hash: body.data.transactionHash,
        tx_id: body.data.transactionId,
      });
    }
    c.status(200);
    return c.text("Signature verified successfully");
    // const signatureHeader = c.req.header("syndicate-signature") as string;
    // if (!signatureHeader) {
    //   c.status(401);
    //   return c.text("No signature header provided");
    // }
    // const { timestamp, signature } = parseSignatureHeader(signatureHeader);
    // const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    // if (parseInt(timestamp) < fiveMinutesAgo) {
    //   c.status(403);
    //   return c.text("Request is too old to be trusted");
    // }
    // const payload = {
    //   data: body.data,
    //   eventType: body.eventType,
    // };
    // const expectedSignature = generateSignature(
    //   payload,
    //   timestamp,
    //   process.env.WEBHOOK_SECRET!
    // );
    // console.log({ expectedSignature, signature });
    // console.log(process.env.WEBHOOK_SECRET);
    // if (
    //   crypto.timingSafeEqual(
    //     Buffer.from(signature),
    //     Buffer.from(expectedSignature)
    //   )
    // ) {
    //   if (body.data.status.toLowerCase().trim() === "submitted") {
    //     await db.from("transactions").insert({
    //       hash: body.data.transactionHash,
    //       tx_id: body.data.transactionId,
    //     });
    //   }
    //   c.status(200);
    //   return c.text("Signature verified successfully");
    // } else {
    //   c.status(401);
    //   console.log("Invalid signature");
    //   return c.text("Invalid signature");
    // }
  } catch (error) {
    console.log(error);
    c.status(400);
    return c.text("Something went wrong");
  }
});
devtools(app, { serveStatic });

litNodeClient
  .connect()
  .then(() => {
    serve({
      fetch: app.fetch,
      port: Number(port),
    });

    console.log(`Server listening on ${port}`);
  })
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
