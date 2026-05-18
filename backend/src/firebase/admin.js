import admin from "firebase-admin";
import dotenv from "dotenv";
import { readFileSync } from "fs";

dotenv.config();

// Only initialize the app if it hasn't been initialized yet
if (!admin.apps.length) {
  try {
    // Prefer environment variables (e.g. for hosting providers),
    // but fall back to the local serviceAccountKey.json when needed.
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    let projectId = process.env.FIREBASE_PROJECT_ID;
    let clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const databaseURL = process.env.FIREBASE_DATABASE_URL;

    if (!privateKey || !projectId || !clientEmail) {
      // Attempt to load the local JSON key file
      try {
        const svcPath = new URL("../../serviceAccountKey.json", import.meta.url);
        const svc = JSON.parse(readFileSync(svcPath, "utf8"));
        privateKey = privateKey || svc.private_key;
        projectId = projectId || svc.project_id;
        clientEmail = clientEmail || svc.client_email;
      } catch (e) {
        // If the file can't be read, keep going and let the validation below fail
        console.warn("Could not read serviceAccountKey.json fallback:", e.message);
      }
    }

    if (!privateKey) {
      throw new Error("Missing Firebase private key (FIREBASE_PRIVATE_KEY or serviceAccountKey.json)");
    }

    // Ensure proper newline formatting for the private key
    if (typeof privateKey === "string") {
      privateKey = privateKey.replace(/\\n/g, "\n");
    }

    // Validate remaining required values
    if (!projectId || !clientEmail) {
      throw new Error("Missing required Firebase configuration variables (projectId or clientEmail)");
    }

    // Initialize the app
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        privateKey,
        clientEmail,
      }),
      ...(databaseURL ? { databaseURL } : {}),
    });
    console.log("Firebase Admin initialized successfully");
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
    // Re-throw the error so calling code can handle it
    throw new Error(`Firebase initialization failed: ${error.message}`);
  }
}

export { admin };