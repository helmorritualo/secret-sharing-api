import { Context } from "hono";
import { BadRequestError, NotFoundError, ForbiddenError } from "@/utils/error";
import Secret from "@/models/secrets";
import AuditLog from "@/models/auditlog";
import { generateSecureOTP, hashOTP, verifyOtpHeader } from "@/utils/otp";
import { v4 as uuidv4 } from "uuid";

export const createSecret = async (c: Context) => {
  try {
    const { content, expiresAt, otpRequired } = await c.req.json();

    const id = uuidv4();

    let otp: string | undefined;
    let hashedOtp: string | undefined;
    if (otpRequired) {
      otp = generateSecureOTP();
      hashedOtp = await hashOTP(otp);
    }

    const newSecret = new Secret({
      _id: id,
      content,
      otp: hashedOtp,
      expiresAt: new Date(expiresAt),
    });

    await newSecret.save();

    return c.json(
      {
        success: true,
        message: "Secret successfully created",
        data: {
          id,
          expiresAt,
          otp: otp || null, // only return if one was generated
        },
      },
      201
    );
  } catch (error) {
    console.error(`Failed to create secret:`, error);
    throw new BadRequestError("Failed to create secret");
  }
};

export const getSecret = async (c: Context) => {
  try {
    const secretId = c.req.param("id");
    const otpHeader = c.req.header("OTP");
    const userAgent = c.req.header("User-Agent") || "unknown";
    const ip = c.req.header("X-Forwarded-For") || "unknown";

    const secret = await Secret.findById(secretId);
    if (!secret || new Date(secret.expiresAt).getTime() < Date.now()) {
      await AuditLog.create({
        secretId,
        event: "EXPIRED",
        ip,
        userAgent,
      });

      throw new NotFoundError("Secret not found or has expired");
    }

    const isValidOTP = await verifyOtpHeader(otpHeader, secret.otp as string);
    if (!isValidOTP) {
      await AuditLog.create({
        secretId: secretId,
        event: "INVALID OTP",
        ip,
        userAgent,
      });
      throw new ForbiddenError("Invalid or missing OTP");
    }

    await AuditLog.create({
      secretId: secretId,
      event: "VIEWED",
      ip,
      userAgent,
    });

    try {
      await Secret.findByIdAndDelete(secretId);
    } catch (err) {
      console.warn(`Failed to delete viewed secret ${secretId}`, err);
    }

    return c.json(
      {
        success: true,
        data: {
          content: secret.content,
        },
      },
      200
    );
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ForbiddenError) {
      throw error;
    }
  }
};
