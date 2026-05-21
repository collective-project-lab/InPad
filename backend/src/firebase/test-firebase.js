import { readFileSync } from "fs";
import dotenv from "dotenv";
dotenv.config();

const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

if (!b64) {
  console.error("❌ FIREBASE_SERVICE_ACCOUNT_BASE64 is missing");
  process.exit(1);
}

try {
  const svc = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
  console.log("✅ Decoded successfully");
  console.log("   project_id:   ", svc.project_id);
  console.log("   client_email: ", svc.client_email);
  console.log("   key starts:  ", svc.private_key?.substring(0, 40));
  console.log("   key includes header:", svc.private_key?.includes("BEGIN PRIVATE KEY"));
} catch (e) {
  console.error("❌ Failed to decode/parse:", e.message);
}