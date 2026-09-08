const express = require("express");
const router = express.Router();
const tenantService = require("../services/tenantService");

// GET /api/tenants?propertyId=1&nameStartsWith=A&embedContacts=true
router.get("/", async (req, res, next) => {
  try {
    const { propertyId, nameStartsWith, embedContacts } = req.query;
    let embedBalance = true;
    if (propertyId && nameStartsWith) {
      return res.json(
        await tenantService.getFilteredByPropertyIdAndNameStartsWithOrderedByName(
          propertyId,
          nameStartsWith
        )
      );
    }
    if (propertyId) {
      return res.json(await tenantService.getFilteredByPropertyId(propertyId));
    }
    else if (embedContacts === "true") {
      return res.json(await tenantService.getAllWithEmbeddedContacts());
    }
    else if (embedBalance) {
      console.log("Fetching tenants balance...");
      return res.json(await tenantService.getTenantsBalance());
    }
    res.json(await tenantService.getAll());
  } catch (err) {
    next(err);
  }
});

// GET /api/tenants/:id?embeds=full|addressesAndContacts
router.get("/:id", async (req, res, next) => {
  try {
    const { embeds } = req.query;
    let tenant;
    if (embeds === "full") {
      tenant = await tenantService.getWithEmbeds(req.params.id);
    } else if (embeds === "addressesAndContacts") {
      tenant = await tenantService.getWithEmbeddedAddressesAndContacts(req.params.id);
    } else {
      tenant = await tenantService.getById(req.params.id);
    }

    if (!tenant) return res.status(404).json({ error: "Tenant not found" });
    res.json(tenant);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/tenants/:id  body: { firstName, comment }
router.patch("/:id", async (req, res, next) => {
  try {
    const updated = await tenantService.updateBasicInfo(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.get("/:id/contacts", async (req, res, next) => {
  try {
    res.json(await tenantService.getContacts(req.params.id));
  } catch (err) {
    next(err);
  }
});

router.get("/:id/addresses", async (req, res, next) => {
  try {
    res.json(await tenantService.getAddresses(req.params.id));
  } catch (err) {
    next(err);
  }
});

router.get("/:id/primary-contact", async (req, res, next) => {
  try {
    res.json(await tenantService.getPrimaryContact(req.params.id));
  } catch (err) {
    next(err);
  }
});

/*
router.get("/balance", async (req, res, next) => {
  try {
    console.log("Fetching tenants balance...");
    res.json(await tenantService.getTenantsBalance());
  } catch (err) {
    next(err);
  }
});
*/

module.exports = router;
