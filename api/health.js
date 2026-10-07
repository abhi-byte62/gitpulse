"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server/src/api/health.ts
var health_exports = {};
__export(health_exports, {
  default: () => handler
});
module.exports = __toCommonJS(health_exports);
async function handler(_req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const data = {
    status: "ok",
    service: "RepoPulse API",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    version: "1.0.0"
  };
  if (typeof res.status === "function") {
    return res.status(200).json(data);
  }
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  return res.end(JSON.stringify(data));
}
