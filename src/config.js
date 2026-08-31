require("dotenv").config();

const config = {
  companyCode: process.env.RM_CORPORATE_ID || "companyCode",
  baseURL: `https://lcs-cxteam.api.rentmanager.com/`,
  username: process.env.RM_USERNAME || "zz",
  password: process.env.RM_PASSWORD || "LCS-cxteamMFSB1099",
  locationID: 1,
  port: parseInt(process.env.PORT || "3000", 10),
};

module.exports = config;
