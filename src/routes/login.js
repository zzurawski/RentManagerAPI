const express = require("express");
const router = express.Router();
const axios = require('axios');
const rmClient = require('../helpers/rentManagerClient');

// POST /login expects { user, password, dbid }
router.post('/', async (req, res, next) => {
    try {
        const { user, password, dbid } = req.body || {};
        if (!user || !password || !dbid) return res.status(400).json({ error: 'user, password and dbid are required' });

        // construct baseURL from dbid, prefer provided dbid; do not mutate .env
        const baseURL = `https://${dbid}.api.rentmanager.com/`;
        console.log('Login request for user:', user, 'dbid:', dbid, 'baseURL:', baseURL);

        // create a short-lived axios instance for auth against the target baseURL
        const url = baseURL + 'Authentication/AuthorizeUser';
        const payload = { Username: user, Password: password, LocationID: 1 };
        const headers = { 'Content-Type': 'application/json' };

        const resp = await axios.post(url, payload, { headers });
        let apiToken = resp && resp.data;
        if (typeof apiToken === 'string') apiToken = apiToken.replace(/^"|"$/g, '');
        if (!apiToken) return res.status(401).json({ error: 'authorization failed' });

        // apply the transient token and set the global client baseURL so subsequent requests use it
        const client = rmClient.getClient();
        client.defaults.baseURL = baseURL;
        rmClient.setApiTokenTransient(apiToken);

        return res.json({ apiToken });
    } catch (err) {
        console.error('Login error', err && err.message ? err.message : err);
        if (err.response && err.response.data) {
            try { return res.status(err.response.status || 500).json({ error: err.response.data }); } catch (e) {}
        }
        return next(err);
    }
});

module.exports = router;