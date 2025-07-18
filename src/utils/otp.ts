import bcrypt from "bcrypt";

export function generateSecureOTP(length = 6) {
  const digits = "0123456789";

  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((n) => digits[n % digits.length])
    .join("");
}

export async function hashOTP(otp: string): Promise<string> {
  return await bcrypt.hash(otp, 10);
}

export async function verifyOtpHeader(
  otpHeader: string | undefined,
  hashedOtp: string | undefined
) {
  if (!hashedOtp) return true;
  if (!otpHeader) return false;
  return await bcrypt.compare(otpHeader, hashedOtp);
}
