import { Hono } from "hono";
import { createSecret, getSecret } from "./secret.controller";

const secretRouter = new Hono()
  .post("/secret", createSecret)
  .get("/secret/:id", getSecret);

export default secretRouter;
