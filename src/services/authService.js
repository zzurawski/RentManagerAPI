const rmClient = require("../helpers/rentManagerClient");
const config = require("../config");
const axios = require("axios");

async function authorize() {
  const client = rmClient.getClient();
  const url = client.defaults.baseURL + 'Authentication/AuthorizeUser';
  const data = {
    Username: process.env.RM_USERNAME || config.username,
    Password: process.env.RM_PASSWORD || config.password,
    LocationID: 1,
  };
  const headers = { 'Content-Type': 'application/json' };

  try {
    console.log('Authorization request:', data);
    const response = await axios.post(url, data, { headers });
    console.log('Authorization response:', response.data);
    let apiToken = response.data;
    if (typeof apiToken === 'string') {
      apiToken = apiToken.replace(/^"|"$/g, '');
    }
    rmClient.setApiToken(apiToken);
    return apiToken;
  } catch (error) {
    console.error('Error during authorization:', error && error.message ? error.message : error);
    throw error;
  }
}

module.exports = { authorize };
