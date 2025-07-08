import { Schema, model } from "mongoose";

const AuditLogSchema = new Schema(
  {
    secretId: {
      type: Schema.Types.ObjectId,
      ref: "Secret",
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
        validator: function (ip: string) {
          // IPv4 regex
          const ipv4Regex =
            /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

          // IPv6 regex (simplified)
          const ipv6Regex =
            /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;

          return ipv4Regex.test(ip) || ipv6Regex.test(ip);
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
