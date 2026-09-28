const express = require("express");
const router = express.Router();
const scriptService = require("../services/scriptService");

// POST script request to local backend pulling data from RM API
router.post("/tenant", async (req, res, next) => {
    try {
        // Accept JSON body: { script: "[Lease.Unit.Name]", tenantId: 2 }
        const { script = "[Lease.Unit.Name]", tenantId = 2 } = req.body || {};
        console.log('script returned: ', script, ' tenantId: ', tenantId);

        const result = await scriptService.testTenantScript(script, tenantId);
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