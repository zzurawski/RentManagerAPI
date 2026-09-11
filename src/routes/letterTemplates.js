const express = require("express");
const router = express.Router();
const letterService = require("../services/letterService");

router.get("/lettertemplates", async (req, res, next) => {
  try {
    const letters = await letterService.getLetterTemplates();
    res.json(letters);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
