require("dotenv").config();

const config = {
  companyCode: process.env.RM_CORPORATE_ID || "companyCode",
  baseURL: `https://${process.env.RM_CORPORATE_ID}.api.rentmanager.com/`,
  username: process.env.RM_USERNAME,
  password: process.env.RM_PASSWORD,
  locationID: 1,
  port: parseInt(process.env.PORT || "3000", 10),
};

module.exports = config;
