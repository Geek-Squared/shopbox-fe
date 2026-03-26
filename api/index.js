import pkg from "@react-router/node";

console.log("@react-router/node exports:", Object.keys(pkg));

const { createRequestHandler } = pkg;
import * as build from "../build/server/index.js";

export default createRequestHandler({
  build,
  mode: process.env.NODE_ENV,
});