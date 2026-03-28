import admin from "firebase-admin";

function readPrivateKey() {
  return String(process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
}

function assertFirebaseAdminEnv() {
  const projectId = String(process.env.FIREBASE_PROJECT_ID || "").trim();
  const clientEmail = String(process.env.FIREBASE_CLIENT_EMAIL || "").trim();
  const privateKey = readPrivateKey();

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase admin credentials are not configured");
  }

  return { projectId, clientEmail, privateKey };
}

function getFirebaseAdminApp() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const credentials = assertFirebaseAdminEnv();

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: credentials.projectId,
      clientEmail: credentials.clientEmail,
      privateKey: credentials.privateKey,
    }),
  });
}

export function getFirebaseAdminAuth() {
  const app = getFirebaseAdminApp();
  return app.auth();
}
