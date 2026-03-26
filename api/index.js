import { createRequestHandler } from "@react-router/express";
import * as build from "../build/server/index.js";

const handler = createRequestHandler({ build, mode: process.env.NODE_ENV });

export default async function (req, res) {
  await handler(req, res, () => {});
}