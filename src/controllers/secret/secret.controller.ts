import { Context } from "hono";
import { BadRequestError, NotFoundError, ForbiddenError } from "@/utils/error";
import Secret from "@/models/secrets";
import AuditLog from "@/models/auditlog";
import { generateSecureOTP, hashOTP, verifyOtpHeader } from "@/utils/otp";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import path from "path";

const deleteUploadedFiles = async (files: any) => {
  for (const file of files) {
    try {
      await fs.unlink(path.join("uploads", file.filename));
    } catch (error) {
      console.warn("Failed to delete file:", file.filename);
    }
  }
};

export const createSecret = async (c: Context) => {
  try {
    const { content, expiresAt, otpRequired } = await c.req.parseBody();
    const files = (c.req.raw as any).files;

    const fileMetadata = files?.map((file: Express.Multer.File) => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    }));

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
      files: fileMetadata || [],
      otp: hashedOtp,
      expiresAt,
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
      await deleteUploadedFiles(secret.files);
      await Secret.findByIdAndDelete(secretId);
    } catch (err) {
      throw new BadRequestError("Failed to delete secret");
    }

    return c.json(
      {
        success: true,
        data: {
          content: secret.content,
          files: secret.files.map((file) => ({
            name: file.originalName,
            url: `/api/secret/${secret._id}/download/${file.filename}`,
            type: file.mimetype,
            size: file.size,
          })),
        },
      },
      200
    );
  } catch (error) {
    throw error;
  }
};

export const downloadFiles = async (c: Context) => {
  try {
    const { id, filename } = c.req.param();

    const secret = await Secret.findById(id);
    const fileMeta = secret?.files.find((f) => f.filename === filename);

    if (!fileMeta) {
      throw new NotFoundError("File not found");
    }

    const filePath = path.join("uploads", filename as string);
    const fileBuffer = await fs.readFile(filePath);

    const response = new Response(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": fileMeta.mimetype,
        "Content-Disposition": `attachment; filename="${fileMeta.originalName}"`,
      },
    });

    return response;
  } catch (error) {
    throw error;
  }
};
