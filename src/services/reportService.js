const fs = require("fs");
const path = require("path");
const os = require("os");
const rmClient = require("../helpers/rentManagerClient");

const DEFAULT_OUTPUT_DIR = process.env.RM_REPORT_DIR || os.tmpdir();

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

async function getOccupancyListingHTML(propertyIds, asOfDate, outputDir = DEFAULT_OUTPUT_DIR) {
  const pIDs = propertyIds.join(",");
  const date = `${asOfDate.getFullYear()}/${asOfDate.getMonth() + 1}/${asOfDate.getDate()}`;

  const url = `/Reports/14/RunReport?parameters=PropertyIDs,(${pIDs});AsOfDate,${date};BatchPropsOrUnits,false&GetOptions=ReturnHTMLUrl`;

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

  const reportFile = path.join(outputDir, "OccupancyListing.html");
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

module.exports = { getBalanceDueReportPdf, getOccupancyListingHTML };
