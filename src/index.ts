import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { PORT } from "./config/env";
import connectionToDatabase from "./config/database";
import { routes } from "./controllers/routes";
import errorHandlerMiddleware from "./middleware/error-handler";

const app = new Hono();

// middlewares
app.use(logger());
app.use(secureHeaders());
app.use(
  "*",
  cors({
    origin: ["*"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
    credentials: true,
    maxAge: 600,
  })
);
app.onError(errorHandlerMiddleware);

routes.forEach((route) => {
  app.route("/api/v1", route);
});

connectionToDatabase().then(() => {
  serve(
    {
      fetch: app.fetch,
      port: Number(PORT),
    },
    (info) => {
      console.log(`Server is running on http://localhost:${info.port}`);
    }
  );
});
