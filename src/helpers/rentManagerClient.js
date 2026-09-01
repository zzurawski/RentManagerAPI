const axios = require("axios");
const config = require("../config");

let _client = null;
let _apiToken = null;


function getClient() {
  if (!_client) {
    _client = axios.create({
      baseURL: config.baseURL,
      headers: {
        Accept: "application/json",
      },
    });
  }
  return _client;
}

function setApiToken(apiToken) {
  _apiToken = apiToken;
  console.log("setApiToken called, new token:", _apiToken);
  const client = getClient();
  client.defaults.headers.common["X-RM12Api-ApiToken"] = apiToken;
  return apiToken;
}

function getApiToken() {
  console.log("getApiToken called, current token:", _apiToken);
  return _apiToken;
}

async function getSingle(url) {
  try {
    const response = await getClient().get(url);
    return response.data;
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return null;
    }
    throw err;
  }
}

async function getCollection(url) {
  try {
    const response = await getClient().get(url);
    return response.data;
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return [];
    }
    throw err;
  }
}

async function getStream(url) {
  const response = await getClient().get(url, { responseType: "stream" });
  return response;
}

async function postSingle(url, updateModel) {
  const response = await getClient().post(url, [updateModel]);
  const items = response.data;
  return Array.isArray(items) && items.length > 0 ? items[0] : null;
}

async function postCollection(url, updateModels) {
  const response = await getClient().post(url, updateModels);
  return response.data;
}

module.exports = {
  getClient,
  setApiToken,
  getApiToken,
  getSingle,
  getCollection,
  getStream,
  postSingle,
  postCollection,
};
