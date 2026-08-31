const rmClient = require("./rentManagerClient");
const authService = require("../services/authService");

async function ensureAuth(req, res, next) {
  console.log("Ensuring authorization with RentManager API...");
  try {
    if (!rmClient.getApiToken()) {
      await authService.authorize();
    }
    next();
  } catch (err) {
    console.error("RentManager authorization failed:", err.message);
    res.status(502).json({ error: "Failed to authorize with RentManager API" });
  }
}

module.exports = ensureAuth;
