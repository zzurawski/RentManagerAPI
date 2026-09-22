const axios = require("axios");
const config = require("../config");
const fs = require("fs");
const path = require("path");

let _client = null;
let _apiToken = null;

const ENV_PATH = path.join(__dirname, '..', '..', '.env');
const INACTIVITY_MS = 15 * 60 * 1000; // 15 minutes for the RM inactivity
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours for max active time

function readEnvSync(envPath) {
  const result = {};
  if (!fs.existsSync(envPath)) return result;
  const txt = fs.readFileSync(envPath, { encoding: 'utf8' });
  const lines = txt.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const idx = trimmed.indexOf('=');
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    result[key] = val;
  }
  return result;
}

function writeEnvSync(envPath, updates) {
  let lines = [];
  if (fs.existsSync(envPath)) {
    lines = fs.readFileSync(envPath, { encoding: 'utf8' }).split(/\r?\n/);
  }

  const out = [];
  const handled = new Set();
  for (let line of lines) {
    if (!line || line.trim().startsWith('#') || !line.includes('=')) {
      out.push(line);
      continue;
    }
    const idx = line.indexOf('=');
    const key = line.slice(0, idx).trim();
    if (Object.prototype.hasOwnProperty.call(updates, key)) {
      const v = updates[key];
      handled.add(key);
      if (v === undefined || v === null || v === '') {
        // remove this key by skipping
        continue;
      }
      out.push(`${key}=${String(v)}`);
    } else {
      out.push(line);
    }
  }

  // add any new keys
  for (const k of Object.keys(updates)) {
    if (handled.has(k)) continue;
    const v = updates[k];
    if (v === undefined || v === null || v === '') continue;
    out.push(`${k}=${String(v)}`);
  }

  fs.writeFileSync(envPath, out.join('\n'), { encoding: 'utf8' });
}

function getClient() {
  if (!_client) {
    _client = axios.create({
      baseURL: config.baseURL,
      headers: {
        Accept: "application/json",
      },
    });

    // Attach current token to outgoing requests
    _client.interceptors.request.use((cfg) => {
      try {
        const token = getApiToken();
        if (token) cfg.headers['X-RM12Api-ApiToken'] = token;
      } catch (e) {
        // ignore
      }
      return cfg;
    }, (err) => Promise.reject(err));

    // On 401, try to reauthorize once and retry the request
    _client.interceptors.response.use(resp => resp, async (error) => {
      const originalRequest = error.config;
      if (error.response && error.response.status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          await reauthorize();
          // update header and retry
          originalRequest.headers = originalRequest.headers || {};
          if (_apiToken) originalRequest.headers['X-RM12Api-ApiToken'] = _apiToken;
          return _client(originalRequest);
        } catch (reauthErr) {
          return Promise.reject(error);
        }
      }
      return Promise.reject(error);
    });
  }
  return _client;
}

async function reauthorize() {
  // Perform a lightweight authorization POST to obtain a new token.
  try {
    const url = (config.baseURL || '') + 'Authentication/AuthorizeUser';
    const data = {
      Username: process.env.RM_USERNAME || config.username,
      Password: process.env.RM_PASSWORD || config.password,
      LocationID: 1,
    };
    const headers = { 'Content-Type': 'application/json' };
    const response = await axios.post(url, data, { headers });
    let apiToken = response.data;
    if (typeof apiToken === 'string') apiToken = apiToken.replace(/^"|"$/g, '');
    setApiToken(apiToken);
    return apiToken;
  } catch (err) {
    console.error('Reauthorization failed:', err && err.message ? err.message : err);
    throw err;
  }
}

function clearStoredToken() {
  _apiToken = null;
  if (getClient()) {
    try { getClient().defaults.headers.common['X-RM12Api-ApiToken'] = undefined; } catch (e) {}
  }
  process.env.API_TOKEN = '';
  writeEnvSync(ENV_PATH, { API_TOKEN: '', API_TOKEN_CREATED: '', API_TOKEN_LAST_ACTIVITY: '' });
}

function setApiToken(apiToken) {
  _apiToken = apiToken;
  console.log("setApiToken called, new token:", _apiToken);
  const client = getClient();
  client.defaults.headers.common["X-RM12Api-ApiToken"] = apiToken;
  process.env.API_TOKEN = apiToken || '';

  if (!apiToken) {
    // clear stored token
    writeEnvSync(ENV_PATH, { API_TOKEN: '', API_TOKEN_CREATED: '', API_TOKEN_LAST_ACTIVITY: '' });
    return apiToken;
  }

  const now = new Date().toISOString();
  const updates = {
    API_TOKEN: apiToken,
    API_TOKEN_CREATED: now,
    API_TOKEN_LAST_ACTIVITY: now,
  };
  try {
    writeEnvSync(ENV_PATH, updates);
  } catch (e) {
    console.error('Failed writing .env with API token:', e && e.message ? e.message : e);
  }
  return apiToken;
}

function getApiToken() {
  // Prefer in-memory but validate against stored timestamps
  try {
    const env = readEnvSync(ENV_PATH);
    const token = env.API_TOKEN || process.env.API_TOKEN || _apiToken;
    if (!token) return null;

    const created = env.API_TOKEN_CREATED;
    const lastActivity = env.API_TOKEN_LAST_ACTIVITY;
    const now = Date.now();

    if (created) {
      const createdAt = Date.parse(created);
      if (!isNaN(createdAt) && (now - createdAt) > MAX_AGE_MS) {
        // expired by age
        clearStoredToken();
        return null;
      }
    }
    if (lastActivity) {
      const lastAt = Date.parse(lastActivity);
      if (!isNaN(lastAt) && (now - lastAt) > INACTIVITY_MS) {
        // expired by inactivity
        clearStoredToken();
        return null;
      }
    }

    // token is valid — update in-memory and bump last activity
    _apiToken = token;
    try { getClient().defaults.headers.common['X-RM12Api-ApiToken'] = _apiToken; } catch (e) {}
    const nowIso = new Date().toISOString();
    try { writeEnvSync(ENV_PATH, { API_TOKEN_LAST_ACTIVITY: nowIso, API_TOKEN: _apiToken }); } catch (e) {}
    process.env.API_TOKEN = _apiToken;
    return _apiToken;
  } catch (e) {
    console.error('Error reading API token from .env:', e && e.message ? e.message : e);
    return _apiToken || process.env.API_TOKEN || null;
  }
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
