const express = require("express");
const router = express.Router();
const colorService = require("../services/colorService");

// GET /api/colors
router.get("/", async (req, res, next) => {
  try {
    res.json(await colorService.getAll());
  } catch (err) {
    next(err);
  }
});

// GET /api/colors/:id
router.get("/:id", async (req, res, next) => {
  try {
    const color = await colorService.getById(req.params.id);
    if (!color) return res.status(404).json({ error: "Color not found" });
    res.json(color);
  } catch (err) {
    next(err);
  }
});

// PUT /api/colors/:id  body: { name: "Red1" }
router.put("/:id", async (req, res, next) => {
  try {
    const updated = await colorService.update(req.params.id, req.body.name);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// PUT /api/colors  body: { updates: [{ colorId, newName }, ...] }
router.put("/", async (req, res, next) => {
  try {
    const updated = await colorService.updateMany(req.body.updates || []);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
