const express = require("express");
const router = express.Router();
const letterService = require("../services/letterService");
const reportService = require("../services/reportService");

router.get("/", async (req, res, next) => {
  try {
    const letters = await letterService.getLetterTemplates();
    return res.json(letters);
  } catch (err) {
    next(err);
  }
});

router.get("/:templateId/preview/:tenantId", async (req, res, next) => {
  try {
    const { templateId, tenantId = 2 } = req.params;
    const htmlUrl = await letterService.previewLetterTemplate(templateId, tenantId);

    if (!htmlUrl) {
      return res.status(404).json({ error: "Letter preview not found" });
    }

    const axios = require("axios");
    const response = await axios.get(htmlUrl, { responseType: "html" });

    return res.type("html").send(response.data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
