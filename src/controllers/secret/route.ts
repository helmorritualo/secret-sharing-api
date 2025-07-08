import { Hono } from "hono";
import { createSecret, getSecret } from "./secret.controller";

const secretRouter = new Hono()
  .post("/secrets", createSecret)
  .get("/secrets/:id", getSecret);

export default secretRouter;
