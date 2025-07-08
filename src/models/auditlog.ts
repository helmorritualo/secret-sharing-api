import { Schema, model } from "mongoose";

const AuditLogSchema = new Schema(
  {
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
        validator: function (v: string) {
          return (
            !v || /^(([0-9]{1,3}\.){3}[0-9]{1,3})$/.test(v) || v.includes(":")
          );
        },
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
