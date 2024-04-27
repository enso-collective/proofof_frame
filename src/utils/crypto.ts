import crypto from "crypto";

export function parseSignatureHeader(header: string): {
  timestamp: string;
  signature: string;
} {
  const elements = header.split(",");
  const timestamp =
    elements.find((e) => e.startsWith("t="))?.split("=")[1] || "";
  const signature =
    elements.find((e) => e.startsWith("s="))?.split("=")[1] || "";
  return { timestamp, signature };
}

export function generateSignature(
  body: object,
  timestamp: string,
  secret: string
): string {
  const payload = JSON.stringify({ ...body, triggeredAt: timestamp });
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  return hmac.digest("hex");
}
