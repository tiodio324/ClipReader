/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onCall} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
admin.initializeApp();

exports.deleteUserAccount = onCall(async (request) => {
  try {
    const {uid} = request.data;

    if (!uid) throw new Error("UID is required");

    await admin.auth().deleteUser(uid);

    return {
      success: true,
      message: "User account deleted successfully",
      uid: uid,
    };
  } catch (error) {
    throw new Error(`Failed to delete user: ${error.message}`);
  }
});

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
