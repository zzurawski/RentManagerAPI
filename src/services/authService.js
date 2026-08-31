const rmClient = require("../helpers/rentManagerClient");
const config = require("../config");
const axios = require("axios");

async function authorize() {
  const client = rmClient.getClient();
  /*const response = await client.post("/Authentication/AuthorizeUser", {
    Username: process.env.RM_USERNAME || config.username,
    Password: process.env.RM_PASSWORD || config.password,
    LocationID: 1,
  });*/

  let requestObj = {
      method: 'POST',
      url: client.defaults.baseURL + 'Authentication/AuthorizeUser',
      data: {
        Username:process.env.RM_USERNAME || config.username,
        Password:process.env.RM_PASSWORD || config.password,
        LocationID:1
      },
      headers: [{'Content-Type':'application/json'}]
    };
  console.log('Authorization request:', requestObj.data);

  await axios.post(requestObj.url, requestObj.data, { headers: requestObj.headers })
    .then(response => {
      console.log('Authorization response:', response.data);
      let apiToken = response.data;
      if (typeof apiToken === "string") {
        apiToken = apiToken.replace(/^"|"$/g, "");
      }
      rmClient.setApiToken(apiToken);
      return apiToken;
    })
    .catch(error => {
      console.error('Error during authorization:');
      throw error;
    });
  let apiToken = response.data;
  rmClient.setApiToken(apiToken);
  return apiToken;
}

module.exports = { authorize };
