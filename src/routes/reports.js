const express = require("express");
const router = express.Router();
const reportService = require("../services/reportService");

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

router.get("/occupancy-listing", async (req, res, next) => {
  try {
    const propertyIds = (req.query.propertyIds || "7").split(",").map(Number).filter(Boolean);
    const asOfDate = req.query.asOfDate ? new Date(req.query.asOfDate) : new Date();

    const filePath = await reportService.getOccupancyListingHTML(propertyIds, asOfDate);
    if (!filePath) return res.status(404).json({ error: "Report not found" });
    res.setHeader("Content-Type", "text/html");
    res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
