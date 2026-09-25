// Vercel serverless entry point. Vercel routes every request into this
// single function (see ../vercel.json), which hands it to the same Express
// app used for local development.
module.exports = require("../app");
