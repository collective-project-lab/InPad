import admin from "firebase-admin";

// Only initialize the app if it hasn't been initialized yet
if (!admin.apps.length) {
  try {
    // Get the private key and ensure proper formatting
    let privateKey;
    try {
      privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    } catch (e) {
      console.error("Error processing private key:", e);
      throw new Error("Invalid private key format");
    }

    // Check that all required environment variables are present
    if (!process.env.FIREBASE_PROJECT_ID || 
        !privateKey || 
        !process.env.FIREBASE_CLIENT_EMAIL || 
        !process.env.FIREBASE_DATABASE_URL) {
      throw new Error("Missing required Firebase configuration variables");
    }

    // Initialize the app
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: privateKey,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
    console.log("Firebase Admin initialized successfully");
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
    // Re-throw the error so calling code can handle it
    throw new Error(`Firebase initialization failed: ${error.message}`);
  }
}

export { admin };