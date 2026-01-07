import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/authOptions";
import ProfileCompleteClient from "./profileCompleteClient";

export default async function ProfileCompletePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/home");

  return <ProfileCompleteClient />;
}


