import { Hono } from "hono";
import { createSecret, getSecret } from "./secret.controller";
import fileHandlerMiddleware from "@/middleware/file-handler";

const secretRouter = new Hono()
  .post("/secrets", fileHandlerMiddleware, createSecret)
  .get("/secrets/:id", getSecret);

export default secretRouter;
