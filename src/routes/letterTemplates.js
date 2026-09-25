const express = require("express");
const router = express.Router();
const letterService = require("../services/letterService");

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
    let htmlResponse = await letterService.previewLetterTemplate(templateId, tenantId);
    
    if (!htmlResponse) {
      return res.status(404).json({ error: "Letter preview not found" });
    }
    
    res.setHeader("Content-Type", "text/html");
    res.send(htmlResponse);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
