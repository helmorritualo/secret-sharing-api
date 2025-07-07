import { makeError } from "@/utils/error";
import { type Context } from "hono";

const errorHandlerMiddleware = async (err: Error, c: Context) => {
  const result = makeError(err);
  if (!result) {
    throw new Error("Error handler failed to process error");
  }
  const { error, statusCode } = result;
  console.error(error.message, error);
  return c.json(error, {
    status: statusCode,
  } as any);
};

export default errorHandlerMiddleware;
