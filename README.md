# RentManager API Letter Viewer

This is a JavaScript web app that displays all available Letter Templates within RentManager as rendered HTML. The reason it displays as HTML is so the User can view the Letter/Email Template as it is rendered for the Tenant. RentManager offers HTML in-line styling to be sent as a Letter Template, but, there is no way to view the HTML (other than an outside source) as it is rendered for the Tenant. Current solution is to go through the steps of sending an Email to an entity and waiting for the result in the inbox.



## Setup

```bash
npm install
cp .env.example .env
# edit .env with your RM_CORPORATE_ID, RM_USERNAME, RM_PASSWORD, RM_LOCATION_ID
```

## Run

**Option A — as an API server for Angular (recommended):**
```bash
npm start
# Express listens on http://localhost:3000


## Express API surface

| Method | Route                                            | Mirrors                                                  |
|--------|---------------------------------------------------|-----------------------------------------------------------|
| GET    | `/api/colors`                                     | `ColorSamples.GetAllReturningModels/Json`                  |
| GET    | `/api/colors/:id`                                 | `ColorSamples.GetReturningModel/Json`                       |
| PUT    | `/api/colors/:id`                                 | `ColorSamples.Update`                                       |
| PUT    | `/api/colors`                                     | `ColorSamples.UpdateCollection`                              |
| GET    | `/api/tenants`                                    | `TenantSamples.GetAll` (+ query filters)                     |
| GET    | `/api/tenants/:id`                                | `TenantSamples.Get` (+ `?embeds=full`/`addressesAndContacts`)|
| PATCH  | `/api/tenants/:id`                                | `TenantSamples.SaveExistingUsingCustomModelAndIncludedFields`|
| GET    | `/api/tenants/:id/contacts`                       | `TenantSamples.GetContacts`                                  |
| GET    | `/api/tenants/:id/addresses`                      | `TenantSamples.GetAddresses`                                 |
| GET    | `/api/tenants/:id/primary-contact`                | `TenantSamples.GetPrimaryContact`                             |
| GET    | `/api/reports/balance-due/:propertyId`            | `ReportSamples.GetBalanceDueReportAsPdfAndSaveToDisk`         |
| GET    | `/api/reports/occupancy-listing`                  | `ReportSamples.GetOccupancyListing`                           |

## Notes / things to adjust for production

- **Token refresh**: `ensureAuth.js` authorizes once and reuses the token. RentManager
  tokens expire — add a retry-on-401 that re-authorizes and replays the request.
- **CORS**: `app.js` uses permissive `cors()` for local development. Lock this to your
  Angular app's origin before deploying.
- **Report storage**: `reportService.js` writes PDFs to the OS temp dir by default
  (`RM_REPORT_DIR` env var to override). For a multi-user server, generate unique
  filenames per request instead of the fixed `BalanceDue.pdf` / `OccupancyListing.pdf`
  names carried over from the original single-user desktop sample.
- **Users**: Right now it currently just uses my login and has no auth form for other logins/locations/company codes
