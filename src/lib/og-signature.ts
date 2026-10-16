import { createHmac, timingSafeEqual } from "crypto";

/**
 * The generated share image (/{locale}/og?title=…) shows its title over the
 * company's name, colours and domain. Only titles the site itself links to
 * carry a valid signature, so nobody can make the site render arbitrary text
 * under its brand (or force a new render per made-up title). The key is
 * derived from PAYLOAD_SECRET, never used as is.
 */
function key(secret: string): Buffer {
  return createHmac("sha256", secret).update("og-title-signature").digest();
}

export function signOgTitle(title: string, secret = process.env.PAYLOAD_SECRET ?? ""): string {
  return createHmac("sha256", key(secret)).update(title).digest("base64url").slice(0, 22);
}

export function isSignedOgTitle(
  title: string,
  signature: string | null | undefined,
  secret = process.env.PAYLOAD_SECRET ?? "",
): boolean {
  if (!secret || !signature) return false;
  const expected = Buffer.from(signOgTitle(title, secret));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
