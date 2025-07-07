import { Schema, model } from "mongoose";

const SecretSchema = new Schema({
  _id: { type: String, required: true },
  content: { type: String, required: true },
  otp: { type: String }, // Optional hashed OTP
  expiresAt: { type: Date, required: true },
  viewed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Secret = model("Secret", SecretSchema);

export default Secret;
