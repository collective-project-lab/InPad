import admin from "firebase-admin";
import dotenv from "dotenv";  
dotenv.config(); 

if (!admin.apps.length) {
  try {
    const svc = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString("utf8")
    );

    admin.initializeApp({
      credential: admin.credential.cert(svc),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });

    console.log("Firebase Admin initialized successfully");
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
    throw new Error(`Firebase initialization failed: ${error.message}`);
  }
}

export { admin };