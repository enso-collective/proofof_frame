import crypto from "crypto";

export function parseSignatureHeader(header: string): {
  timestamp: string;
  signature: string;
} {
  const elements = header.split(",");
  // @ts-ignore
  const timestamp = elements.find((e) => e.startsWith("t=")).split("=")[1];
  // @ts-ignore
  const signature = elements.find((e) => e.startsWith("s=")).split("=")[1];
  return { timestamp, signature };
}

export function generateSignature(
  body: object,
  timestamp: string,
  secret: string
): string {
  const payload = JSON.stringify({
    ...body,
    triggeredAt: timestamp,
  });
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}
