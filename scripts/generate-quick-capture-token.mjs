// Run locally once. Keep the token on your iPhone; only the digest goes to Vercel.
import { randomBytes, createHash } from "node:crypto";
const token = randomBytes(32).toString("base64url");
console.log("iPhone x-quick-capture-token (keep private):", token);
console.log("QUICK_CAPTURE_TOKEN_SHA256=" + createHash("sha256").update(token).digest("hex"));
