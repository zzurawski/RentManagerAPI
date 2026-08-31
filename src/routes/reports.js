const express = require("express");
const router = express.Router();
const reportService = require("../services/reportService");

// GET /api/reports/balance-due/:propertyId
// Streams the PDF straight to the browser/Angular client instead of
// saving-then-launching a viewer (there's no "desktop" on a server).
router.get("/balance-due/:propertyId", async (req, res, next) => {
  try {
    const filePath = await reportService.getBalanceDueReportPdf(req.params.propertyId);
    if (!filePath) return res.status(404).json({ error: "Report not found" });
    res.setHeader("Content-Type", "application/pdf");
    res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/occupancy-listing?propertyIds=1,2,3&unitIds=311,312,313&asOfDate=2026-08-27
router.get("/occupancy-listing", async (req, res, next) => {
  try {
    const propertyIds = (req.query.propertyIds || "").split(",").map(Number).filter(Boolean);
    const unitIds = (req.query.unitIds || "").split(",").map(Number).filter(Boolean);
    const asOfDate = req.query.asOfDate ? new Date(req.query.asOfDate) : new Date();

    const filePath = await reportService.getOccupancyListingPdf(propertyIds, unitIds, asOfDate);
    if (!filePath) return res.status(404).json({ error: "Report not found" });
    res.setHeader("Content-Type", "application/pdf");
    res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
