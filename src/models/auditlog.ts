import { Schema, model } from "mongoose";

const AuditLogSchema = new Schema({
  secretId: { type: String, required: true },
  event: { type: String, required: true }, // "VIEWED", "EXPIRED", "INVALID_OTP"
  ip: { type: String },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now },
});

const AuditLog = model("AuditLog", AuditLogSchema);

export default AuditLog;
