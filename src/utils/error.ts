import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";

export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.message = message;
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.message = message;
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.message = message;
  }
}

export class InternalServerError extends Error {
  constructor(message: string) {
    super(message);
    this.message = message;
  }
}

export function makeError<TError extends Error>(error: TError) {
  const defaultError = {
    success: false,
    message: error.message,
  };

  if (error instanceof mongoose.Error.ValidationError) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      error: {
        success: false,
        message: "Validation failed",
        details: Object.values(error.errors).map((e) => e.message),
      },
    };
  }

  if (error.message.includes("LIMIT_UNEXPECTED_FILE")) {
    return {
      StatusCode: StatusCodes.BAD_REQUEST,
      error: {
        success: false,
        message: "You can only upload up to 3 files.",
      },
    };
  }

  //* Custom Errors
  if (error.message.includes("Malformed JSON")) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      error: {
        message: error.message,
      },
    };
  }

  if (error instanceof BadRequestError) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      error: defaultError,
    };
  }

  if (error instanceof ForbiddenError) {
    return {
      statusCode: StatusCodes.FORBIDDEN,
      error: defaultError,
    };
  }

  if (error instanceof NotFoundError) {
    return {
      statusCode: StatusCodes.NOT_FOUND,
      error: defaultError,
    };
  }

  if (error instanceof InternalServerError) {
    return {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      error: defaultError,
    };
  }

  // Default case for unhandled errors
  return {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    error: defaultError,
  };
}
