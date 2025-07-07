import { Schema, model } from "mongoose";

const SecretSchema = new Schema(
  {
    _id: { type: String, required: true },
    content: { type: String, required: true },
    otp: { type: String }, // Optional hashed OTP
    expiresAt: { type: Date, required: true },
    viewed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Secret = model("Secret", SecretSchema);

export default Secret;
