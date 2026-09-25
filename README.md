# RentManager API QuickStart — JavaScript Port (Express + Angular)

This is a JavaScript port of LCS's original **RentManager 12 Web API QuickStart** (a
C#/.NET console app). It's split into two parts on purpose:

- **`src/`** — an Express (Node.js) backend that talks to RentManager. It authenticates,
  holds the API token, and proxies requests. **This is where your RentManager
  credentials live.**
- **`angular-example/`** — an Angular service + component showing how a frontend calls
  *your* Express API instead of calling RentManager directly.

## Why not call RentManager straight from Angular?

RentManager's auth flow returns a bearer-style token (`X-RM12Api-ApiToken`) that must be
sent on every request. Angular code runs in the user's browser — anything in it,
including that token, is visible in dev tools / network tab. Routing through Express
keeps the token and your RentManager username/password server-side only.

## File-by-file mapping from the original C# project

| Original (.NET)                                   | JS equivalent                              |
|-----------------------------------------------------|---------------------------------------------|
| `Helpers/HttpClientHelper.cs`                        | `src/helpers/rentManagerClient.js`           |
| `ApiSamples/AuthorizationSamples.cs`                 | `src/services/authService.js`                |
| `ApiSamples/ColorSamples.cs`                         | `src/services/colorService.js`               |
| `ApiSamples/TenantSamples.cs`                        | `src/services/tenantService.js`              |
| `ApiSamples/ReportSamples.cs`                        | `src/services/reportService.js`              |
| `Program.cs` (demo run)                              | `src/index.js` (`npm run demo`)              |
| `App.config`                                         | `.env` (via `src/config.js`)                 |
| Models (`ColorModel.cs`, `TenantModel.cs`, etc.)     | Plain JS objects — RentManager already returns JSON, so no class definitions are needed; `angular-example/rent-manager.service.ts` has TypeScript interfaces for the fields you'll touch most. |
| N/A (new)                                            | `src/app.js`, `src/routes/*.js` — Express server exposing the above as a small REST API for your frontend |

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
```

Then in Angular, copy `angular-example/rent-manager.service.ts` into your app
(`ng generate service rent-manager` and paste the contents, or drop the file in and
register it), point `baseUrl` at your Express server, and inject `RentManagerService`
wherever you need RentManager data. `example-usage.component.ts` shows a minimal
usage pattern, including downloading a PDF report as a `Blob` (the Angular equivalent
of the original app's `Process.Start(reportFile)`).

**Option B — one-off demo script (like the original console app):**
```bash
npm run demo
# Runs through the same sequence as Program.cs and logs progress to the console
```

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
- **Secrets**: never commit your real `.env`. Use your host's secret manager in production.
