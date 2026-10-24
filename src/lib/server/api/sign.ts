import { createHash, createHmac, randomBytes } from "node:crypto";

export function signHeaders(
  { appId, secret }: { appId?: string, secret?: string },
  method: string,
  target: string,
  body: string
): Record<string, string> {
  if (!appId || !secret) return {};

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = randomBytes(16).toString("hex");
  const digest = createHash("sha256").update(body).digest("hex");
  const canonical = `${method}\n${target}\n${timestamp}\n${nonce}\n${digest}`;
  const signature = createHmac("sha256", Buffer.from(secret, "base64"))
    .update(canonical)
    .digest("hex");

  return {
    "X-App-Id": appId,
    "X-App-Timestamp": timestamp,
    "X-App-Nonce": nonce,
    "X-App-Signature": signature
  };
}
