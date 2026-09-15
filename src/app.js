const express = require("express");
const cors = require("cors");
const config = require("./config");
const ensureAuth = require("./helpers/auth");

const colorsRouter = require("./routes/colors");
const tenantsRouter = require("./routes/tenants");
const reportsRouter = require("./routes/reports");
const letterTemplatesRouter = require("./routes/letterTemplates");
const tenantService = require("./services/tenantService");
const letterService = require("./services/letterService");

const app = express();

const allowedOrigins = config.allowedOrigins || [
  "http://localhost:3000",
  "http://localhost:4200",
  "http://localhost:5500",
];

app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      console.log("CORS origin:", origin);
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/", ensureAuth);

app.use("/colors", colorsRouter);
app.use("/tenants", tenantsRouter);
app.use("/reports", reportsRouter);
app.use("/lettertemplates", letterTemplatesRouter);

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.response?.status || 500;
  res.status(status).json({ error: err.message });
});

app.listen(config.port, () => {
  console.log(`RentManager API proxy listening on http://localhost:${config.port}`);
});

module.exports = app;
