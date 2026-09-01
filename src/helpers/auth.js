const rmClient = require("./rentManagerClient");
const authService = require("../services/authService");

async function ensureAuth(req, res, next) {
  console.log("Ensuring authorization with RentManager API...");
  try {
    let apiToken = rmClient.getApiToken();
    console.log("Current API token:", apiToken);
    if (!apiToken) {
      console.log("No API token found — requesting authorization...");
      apiToken = await authService.authorize();
      console.log("Authorization completed. New token:", apiToken);
    } else {
      console.log("Already authorized with RentManager API. Current token:", apiToken);
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
