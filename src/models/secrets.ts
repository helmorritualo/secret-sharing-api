import { Schema, model } from "mongoose";

const SecretSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      minlength: [1, "Content must not be empty"],
      maxlength: [10000, "Content is too long"], // optional
    },
    otp: {
      type: String,
      validate: {
        validator: function (v: string) {
          return typeof v === "string" && v.length >= 6;
        },
        message: "OTP must be a valid hash",
      },
    },
    expiresAt: {
      type: Date,
      required: true,
      validate: {
        validator: function (value: Date) {
          return value.getTime() > Date.now();
        },
        message: "Expiry time must be in the future",
      },
    },
    viewed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Secret = model("Secret", SecretSchema);
export default Secret;
