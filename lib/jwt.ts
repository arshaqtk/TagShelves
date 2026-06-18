const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key";

// Helper to decode Base64Url
function base64urlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return atob(base64);
}

// Helper to encode Base64Url
function base64urlEncode(str: string): string {
  const base64 = btoa(str);
  return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64urlToBytes(str: string): Uint8Array {
  const binary = base64urlDecode(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// HMAC SHA-256 signature generation using Web Crypto
async function signHMAC(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, messageData);
  
  // Convert ArrayBuffer to binary string securely
  const hashArray = Array.from(new Uint8Array(signature));
  const binaryString = hashArray.map(b => String.fromCharCode(b)).join("");
  return base64urlEncode(binaryString);
}

// HMAC SHA-256 signature verification using Web Crypto
async function verifyHMAC(message: string, signatureStr: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);
  const signatureBytes = base64urlToBytes(signatureStr);

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  return await crypto.subtle.verify("HMAC", key, signatureBytes as any, messageData);
}

export async function signToken(payload: any): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const headerStr = base64urlEncode(JSON.stringify(header));
  const payloadStr = base64urlEncode(JSON.stringify(payload));
  const message = `${headerStr}.${payloadStr}`;
  const signature = await signHMAC(message, JWT_SECRET);
  return `${message}.${signature}`;
}

export async function verifyToken(token: string): Promise<any> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid token format");
  }

  const [headerStr, payloadStr, signatureStr] = parts;
  const message = `${headerStr}.${payloadStr}`;
  const isValid = await verifyHMAC(message, signatureStr, JWT_SECRET);
  if (!isValid) {
    throw new Error("Invalid signature");
  }

  const payloadJson = base64urlDecode(payloadStr);
  return JSON.parse(payloadJson);
}
