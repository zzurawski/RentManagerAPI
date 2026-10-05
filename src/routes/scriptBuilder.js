const express = require("express");
const router = express.Router();
const scriptService = require("../services/scriptService");

// POST script request to local backend pulling data from RM API
router.post("/entity", async (req, res, next) => {
    try {
        // make this plural for the RM API endpoint, e.g. "Property" -> "Properties"
        if (req.body.entityType === "Property") {
            req.body.entityType = "Properties";
        } else {
            req.body.entityType = req.body.entityType + "s";
        };
        const { script, entityId, entityType } = req.body || {};
        console.log('script returned: ', script, ' entityId: ', entityId, ' entityType: ', entityType);

        const result = await scriptService.testEntityScript(script, entityId, entityType);
        if (result === null || result === undefined) {
            return res.status(204).send();
        }
        // Return whatever the service returned (likely JSON)
        return res.json(result);
    } catch (err) {
        console.error(err);
        return next(err);
    }
});

module.exports = router;