const express = require("express");
const router = express.Router();
const tenantService = require("../services/tenantService");
const entityService = require("../services/entityService");

router.get("/:entityType", async (req, res, next) => {
  try {
    const { entityType } = req.params;
    const entities = await entityService.getEntities(entityType);
    return res.json(entities);
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

module.exports = router;