const encoder = new TextEncoder();

export function toHex(bytes: Uint8Array): string {
  let out = "";
  for (const byte of bytes) {
    out += byte.toString(16).padStart(2, "0");
  }
  return out;
}

export function fromHex(value: string): Uint8Array | null {
  if (value.length === 0 || value.length % 2 !== 0) {
    return null;
  }
  if (!/^[0-9a-f]+$/i.test(value)) {
    return null;
  }
  const out = new Uint8Array(value.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = Number.parseInt(value.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

/**
 * Compare two byte strings without an early exit on the first difference.
 * The length check leaks only the length, which is fixed for HMAC digests.
 */
export function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let difference = 0;
  for (let i = 0; i < a.length; i += 1) {
    difference |= a[i] ^ b[i];
  }
  return difference === 0;
}

export async function sha256(value: string): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return new Uint8Array(digest);
}

export async function computeHmacSha256(
  secret: string,
  rawBody: string
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(rawBody)
  );
  return new Uint8Array(signature);
}

export type SignatureResult = "ok" | "missing" | "invalid";

/**
 * Verify `X-Hub-Signature-256` over the raw body before any JSON parse.
 * The expected and provided digests are compared in constant time.
 */
export async function verifyWebhookSignature(
  rawBody: string,
  secret: string,
  signatureHeader: string | null
): Promise<SignatureResult> {
  if (!signatureHeader) {
    return "missing";
  }
  if (!secret) {
    return "invalid";
  }
  if (!signatureHeader.startsWith("sha256=")) {
    return "invalid";
  }
  const provided = fromHex(signatureHeader.slice("sha256=".length));
  if (!provided || provided.length !== 32) {
    return "invalid";
  }
  const expected = await computeHmacSha256(secret, rawBody);
  return timingSafeEqual(expected, provided) ? "ok" : "invalid";
}

/**
 * Compare a Bearer token with a shared secret. Both sides are hashed first so
 * the compare does not reveal the secret length.
 */
export async function verifyBearer(
  authorization: string | null,
  secret: string
): Promise<boolean> {
  if (!authorization || !secret) {
    return false;
  }
  const match = /^Bearer\s+(.+)$/i.exec(authorization.trim());
  if (!match) {
    return false;
  }
  const provided = await sha256(match[1].trim());
  const expected = await sha256(secret);
  return timingSafeEqual(provided, expected);
}
