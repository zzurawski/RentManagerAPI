const rmClient = require("./rentManagerClient");
const authService = require("../services/authService");

async function ensureAuth(req, res, next) {
  try {
    let apiToken = rmClient.getApiToken();
    if (!apiToken) {
      console.log("No API token found — requesting authorization...");
      apiToken = await authService.authorize();
      console.log("Authorization completed. New token:", apiToken);
    }
    if (!apiToken) {
      throw new Error('Authorization did not return an API token');
    }
    next();
  } catch (err) {
    console.error("RentManager authorization failed:", err.message);
    res.status(502).json({ error: "Failed to authorize with RentManager API" });
  }
}

module.exports = ensureAuth;
