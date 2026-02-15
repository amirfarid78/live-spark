import admin from "firebase-admin";

const projectId = process.env.VITE_FIREBASE_PROJECT_ID;

if (projectId && !admin.apps.length) {
  try {
    admin.initializeApp({
      projectId,
    });
    console.log(`Firebase Admin initialized for project: ${projectId}`);
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
  }
}

export async function verifyFirebaseToken(idToken: string): Promise<admin.auth.DecodedIdToken | null> {
  if (!admin.apps.length) {
    console.error("Firebase Admin not initialized - cannot verify tokens");
    return null;
  }
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    return decoded;
  } catch (error) {
    console.error("Firebase token verification failed:", error);
    return null;
  }
}
