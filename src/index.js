const authService = require("./services/authService");
const colorService = require("./services/colorService");
const tenantService = require("./services/tenantService");
const reportService = require("./services/reportService");

async function run() {
  console.log("Starting Rent Manager API Samples...");

  // Authorize
  await authService.authorize();

  // ---- Color samples ----
  console.log("Running color API samples...");
  await colorService.getAll();
  await colorService.getById(1);
  await colorService.update(1, "Red1");
  await colorService.updateMany([
    { colorId: 1, newName: "Red2" },
    { colorId: 2, newName: "White2" },
  ]);

  // ---- Tenant samples ----
  console.log("Running tenant API samples...");
  const propertyId = 1;
  const tenantId = 1;
  const nameStartsWith = "A";

  await tenantService.getAll();
  await tenantService.getAllWithEmbeddedContacts();
  await tenantService.getFilteredByPropertyId(propertyId);
  await tenantService.getFilteredByPropertyIdAndNameStartsWith(propertyId, nameStartsWith);
  await tenantService.getFilteredByPropertyIdAndNameStartsWithOrderedByName(propertyId, nameStartsWith);

  await tenantService.getById(tenantId);
  await tenantService.getWithEmbeddedAddressesAndContacts(tenantId);
  await tenantService.getWithEmbeds(tenantId);

  // !!!!!! This will update existing data to new values !!!!!
  await tenantService.updateBasicInfo(tenantId, { firstName: "Edie", comment: "Sample Comment" });

  await tenantService.getContacts(tenantId);
  await tenantService.getAddresses(tenantId);
  await tenantService.getPrimaryContact(tenantId);

  // ---- Report samples ----
  console.log("Running report API samples...");
  await reportService.getBalanceDueReportPdf(propertyId);
  await reportService.getOccupancyListingPdf([1, 2, 3], [311, 312, 313], new Date());

  console.log("Completion of Rent Manager API Samples...");
}

run().catch((err) => {
  console.error("Rent Manager API Samples failed with the following error:");
  console.error("..." + err.message);
  process.exit(1);
});
