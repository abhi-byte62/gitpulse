// api/health.ts
async function handler(_req, res) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.end(
    JSON.stringify({
      status: "ok",
      service: "RepoPulse API",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      version: "1.0.0"
    })
  );
}
export {
  handler as default
};
