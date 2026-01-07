type OtpEntry = {
  otp: string;
  expiresAt: number;
  accessToken?: string;
  userExists?: boolean;
};

declare global {
  // eslint-disable-next-line no-var
  var __otpStore: Map<string, OtpEntry> | undefined;
}

function store(): Map<string, OtpEntry> {
  if (!globalThis.__otpStore) globalThis.__otpStore = new Map();
  return globalThis.__otpStore;
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\s+/g, "").trim();
}

export function generateOtp(): string {
  // 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function setOtpForPhone(
  phoneRaw: string,
  otpRaw: string,
  opts?: { ttlMs?: number; accessToken?: string; userExists?: boolean },
) {
  const phone = normalizePhone(phoneRaw);
  const otp = otpRaw.trim();
  const ttlMs = opts?.ttlMs ?? 5 * 60 * 1000;
  store().set(phone, {
    otp,
    expiresAt: Date.now() + ttlMs,
    accessToken: opts?.accessToken,
    userExists: opts?.userExists,
  });
  return { phone, otp };
}

export function createOtpForPhone(phoneRaw: string, ttlMs = 5 * 60 * 1000) {
  const phone = normalizePhone(phoneRaw);
  const otp = generateOtp();
  return setOtpForPhone(phone, otp, { ttlMs });
}

export function verifyOtpForPhone(phoneRaw: string, otpRaw: string) {
  const phone = normalizePhone(phoneRaw);
  const otp = otpRaw.trim();
  const entry = store().get(phone);
  if (!entry) return { ok: false as const, reason: "not_found" as const };
  if (Date.now() > entry.expiresAt) {
    store().delete(phone);
    return { ok: false as const, reason: "expired" as const };
  }
  if (entry.otp !== otp) return { ok: false as const, reason: "invalid" as const };
  store().delete(phone);
  return {
    ok: true as const,
    accessToken: entry.accessToken,
    userExists: entry.userExists,
  };
}


