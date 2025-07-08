import { Schema, model } from "mongoose";

const AuditLogSchema = new Schema(
  {
    secretId: {
      type: String,
      required: [true, "secretId is required"],
    },
    event: {
      type: String,
      required: [true, "event type is required"],
      enum: {
        values: ["VIEWED", "EXPIRED", "INVALID_OTP"],
        message: "event must be one of: VIEWED, EXPIRED, INVALID_OTP",
      },
    },
    ip: {
      type: String,
      validate: {
        validator: (ip: string) =>
          ip === "unknown" || /^[\d.:a-fA-F]+$/.test(ip),
        message: "Invalid IP address format",
      },
    },
    userAgent: {
      type: String,
      maxlength: [255, "userAgent string is too long"],
    },
  },
  {
    timestamps: true,
  }
);

const AuditLog = model("AuditLog", AuditLogSchema);

export default AuditLog;
