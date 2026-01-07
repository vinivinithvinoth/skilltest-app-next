import OtpForm from "./OtpForm";
import { normalizePhone } from "@/lib/otpStore";

export default async function OtpVerificationPage({
  searchParams,
}: {
  searchParams: { phone?: string };
}) {
  const { phone = "" } = searchParams;
  return <OtpForm phone={normalizePhone(phone)} />;
}


