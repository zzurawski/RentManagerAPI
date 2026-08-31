// JavaScript port of ApiSamples/ReportSamples.cs
//
// Note on design: the original desktop app saved PDFs to disk and opened
// them with Process.Start (a local viewer). A server has no "desktop" to
// open a viewer on, so these functions save to disk and/or return the
// file path or stream so an Express route can send it to the browser
// instead (see src/routes/reports.js).

const fs = require("fs");
const path = require("path");
const os = require("os");
const rmClient = require("../helpers/rentManagerClient");

const DEFAULT_OUTPUT_DIR = process.env.RM_REPORT_DIR || os.tmpdir();

/**
 * Mirrors ReportSamples.GetBalanceDueReportAsPdfAndSaveToDisk(propertyID).
 * Streams the "Balance Due" report (report ID 82) to a local PDF file.
 * Returns the saved file path, or null if RentManager returned 404.
 */
async function getBalanceDueReportPdf(propertyId, outputDir = DEFAULT_OUTPUT_DIR) {
  const url = `/Reports/82/RunReport?parameters=PropertyIDs,${propertyId}&GetOptions=ReturnPDFStream`;

  let response;
  try {
    response = await rmClient.getStream(url);
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return null;
    }
    throw err;
  }

  const reportFile = path.join(outputDir, "BalanceDue.pdf");
  await streamToFile(response.data, reportFile);
  return reportFile;
}

/**
 * Mirrors ReportSamples.GetOccupancyListing(propertyIDs, unitIDs, asOfDate).
 * This report type returns a URL to the generated PDF (ReturnPDFUrl) rather
 * than a raw stream, so we download it from that URL afterward.
 */
async function getOccupancyListingPdf(propertyIds, unitIds, asOfDate, outputDir = DEFAULT_OUTPUT_DIR) {
  const pIDs = propertyIds.join(",");
  const uIDs = unitIds.join(",");
  const date = `${asOfDate.getFullYear()}/${asOfDate.getMonth() + 1}/${asOfDate.getDate()}`;

  const url = `/Reports/14/RunReport?parameters=PropertyIDs,(${pIDs});UNITIDS,(${uIDs});AsOfDate,${date}&GetOptions=ReturnPDFUrl`;

  let reportUrl;
  try {
    const client = rmClient.getClient();
    const response = await client.get(url);
    reportUrl = response.data; // a URL string
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return null;
    }
    throw err;
  }

  const axios = require("axios");
  const fileResponse = await axios.get(reportUrl, { responseType: "stream" });

  const reportFile = path.join(outputDir, "OccupancyListing.pdf");
  await streamToFile(fileResponse.data, reportFile);
  return reportFile;
}

function streamToFile(readableStream, destPath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(destPath)) {
      fs.unlinkSync(destPath);
    }
    const writer = fs.createWriteStream(destPath);
    readableStream.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

module.exports = { getBalanceDueReportPdf, getOccupancyListingPdf };
