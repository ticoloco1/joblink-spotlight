import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SIGNING_KEY = Deno.env.get("ALCHEMY_SIGNING_KEY") ?? "whsec_5QmJ4yM7rcCzAKyP0FkatTnz";
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/polygon-webhook`;
const RECEIVING_WALLET = (Deno.env.get("POLYGON_RECEIVING_WALLET") ?? "").toLowerCase();

async function computeHmacSha256(key: string, body: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signed = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(body));
  return Array.from(new Uint8Array(signed))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.test("polygon-webhook: rejects invalid signature", async () => {
  const payload = JSON.stringify({ type: "ADDRESS_ACTIVITY", event: { activity: [] } });

  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-alchemy-signature": "invalidsignature",
    },
    body: payload,
  });

  assertEquals(res.status, 403);
  const data = await res.json();
  assertEquals(data.error, "Invalid signature");
  console.log("✅ Invalid signature correctly rejected with 403");
});

Deno.test("polygon-webhook: accepts valid HMAC signature (empty activity)", async () => {
  const payload = JSON.stringify({ type: "ADDRESS_ACTIVITY", event: { activity: [] } });
  const signature = await computeHmacSha256(SIGNING_KEY, payload);

  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-alchemy-signature": signature,
    },
    body: payload,
  });

  const data = await res.json();
  console.log("Response status:", res.status);
  console.log("Response body:", JSON.stringify(data));
  assertEquals(res.status, 200);
  assertEquals(data.ok, true);
  console.log("✅ Valid signature accepted with empty activity");
});

Deno.test("polygon-webhook: skips non-ADDRESS_ACTIVITY events", async () => {
  const payload = JSON.stringify({ type: "MINED_TRANSACTION", event: {} });
  const signature = await computeHmacSha256(SIGNING_KEY, payload);

  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-alchemy-signature": signature,
    },
    body: payload,
  });

  const data = await res.json();
  console.log("Response body:", JSON.stringify(data));
  assertEquals(res.status, 200);
  assertEquals(data.skipped, true);
  console.log("✅ Non-ADDRESS_ACTIVITY correctly skipped");
});

Deno.test("polygon-webhook: USDC transfer simulation (unmatched wallet)", async () => {
  const payload = JSON.stringify({
    type: "ADDRESS_ACTIVITY",
    event: {
      activity: [
        {
          category: "token",
          fromAddress: "0x000000000000000000000000000000000000dead",
          toAddress: RECEIVING_WALLET || "0xf841d9f5ba7eac3802e9a476a85775e23d0836f4",
          hash: `0xtest${Date.now()}`,
          value: 10,
          asset: "USDC",
          rawContract: {
            address: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
            rawValue: "10000000",
          },
        },
      ],
    },
  });

  const signature = await computeHmacSha256(SIGNING_KEY, payload);

  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-alchemy-signature": signature,
    },
    body: payload,
  });

  const data = await res.json();
  console.log("USDC simulation response:", JSON.stringify(data));
  assertEquals(res.status, 200);
  assertEquals(data.ok, true);
  const result = data.results?.[0];
  console.log(`✅ USDC simulation result: ${result?.status}`);
});
