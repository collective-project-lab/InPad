import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!admin.apps.length) {
  try {
    let serviceAccount;

    // Production (Railway)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
      serviceAccount = JSON.parse(
        Buffer.from(
          process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
          "base64"
        ).toString("utf8")
      );

      console.log("Using Firebase credentials from Railway env");
    }

    // Local development
    else {
      const serviceAccountPath = path.join(
        __dirname,
        "../../serviceAccountKey.json"
      );

      serviceAccount = JSON.parse(
        fs.readFileSync(serviceAccountPath, "utf8")
      );

      console.log("Using local Firebase service account file");
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });

    console.log("Firebase Admin initialized successfully");
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
    throw new Error(`Firebase initialization failed: ${error.message}`);
  }
}

export { admin };