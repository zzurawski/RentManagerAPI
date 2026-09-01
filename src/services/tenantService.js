// JavaScript port of ApiSamples/TenantSamples.cs

const rmClient = require("../helpers/rentManagerClient");

// ---- Tenant collection ----------------------------------------------------

async function getAll() {
  return rmClient.getCollection("/tenants");
}

async function getAllWithEmbeddedContacts() {
  return rmClient.getCollection("/tenants?embeds=Contacts");
}

async function getFilteredByPropertyId(propertyId) {
  return rmClient.getCollection(`/tenants?filters=PropertyID,eq,${propertyId}`);
}

async function getFilteredByPropertyIdAndNameStartsWith(propertyId, nameStartsWith) {
  return rmClient.getCollection(
    `/tenants?filters=PropertyID,eq,${propertyId};Name,sw,${nameStartsWith}`
  );
}

async function getFilteredByPropertyIdAndNameStartsWithOrderedByName(propertyId, nameStartsWith) {
  return rmClient.getCollection(
    `/tenants?filters=PropertyID,eq,${propertyId};Name,sw,${nameStartsWith}&orderingOptions=TenantName`
  );
}

async function getSelectedFields() {
  return rmClient.getCollection("/tenants?fields=ActiveStartDate,Name");
}

// ---- Single tenant ----------------------------------------------------

async function getById(tenantId) {
  return rmClient.getSingle(`/tenants/${tenantId}`);
}

async function getWithEmbeddedAddressesAndContacts(tenantId) {
  return rmClient.getSingle(`/tenants/${tenantId}?embeds=Addresses,Contacts`);
}

async function getWithEmbeds(tenantId) {
  return rmClient.getSingle(
    `/tenants/${tenantId}?embeds=Addresses,Color,Contacts,PrimaryContact,PrimaryContactPhoneNumbers,Property`
  );
}

async function getWithFilterOnBalanceGreaterThanZero() {
  return rmClient.getCollection("/tenants?filters=Balance,gt,0");
}

/**
 * Mirrors TenantSamples.SaveExistingUsingCustomModelAndIncludedFields():
 * fetches a tenant, builds a partial update payload, and posts only the
 * included fields back.
 */
async function updateBasicInfo(tenantId, { firstName, comment }) {
  const tenant = await rmClient.getSingle(`/tenants/${tenantId}`);
  if (!tenant) return null;

  const tenantToUpdate = {
    TenantID: tenant.TenantID,
    FirstName: firstName,
    LastName: tenant.LastName,
    Comment: comment,
    UpdateDate: tenant.UpdateDate,
    UpdateUserID: tenant.UpdateUserID,
  };

  return rmClient.postSingle(
    "/tenants?fields=TenantID,FirstName,LastName,Comment,UpdateDate,UpdateUserID",
    tenantToUpdate
  );
}

// ---- Tenant sub-resources ----------------------------------------------------

async function getContacts(tenantId) {
  return rmClient.getCollection(`/tenants/${tenantId}/Contacts`);
}

async function getAddresses(tenantId) {
  return rmClient.getCollection(`/tenants/${tenantId}/Addresses`);
}

async function getPrimaryContact(tenantId) {
  return rmClient.getSingle(`/tenants/${tenantId}/PrimaryContact`);
}

module.exports = {
  getAll,
  getAllWithEmbeddedContacts,
  getFilteredByPropertyId,
  getFilteredByPropertyIdAndNameStartsWith,
  getFilteredByPropertyIdAndNameStartsWithOrderedByName,
  getSelectedFields,
  getById,
  getWithEmbeddedAddressesAndContacts,
  getWithEmbeds,
  getWithFilterOnBalanceGreaterThanZero,
  updateBasicInfo,
  getContacts,
  getAddresses,
  getPrimaryContact,
};
