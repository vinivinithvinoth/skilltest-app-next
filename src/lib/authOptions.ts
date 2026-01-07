import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { normalizePhone, verifyOtpForPhone } from "@/lib/otpStore";

export const authOptions: NextAuthOptions = {
  // NOTE: Set NEXTAUTH_SECRET in production.
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Phone OTP",
      credentials: {
        phone: { label: "Phone", type: "text" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        const phone = credentials?.phone ? normalizePhone(credentials.phone) : "";
        const otp = credentials?.otp ?? "";
        if (!phone || !otp) return null;

        const result = verifyOtpForPhone(phone, otp);
        if (!result.ok) return null;

        // Minimal user object for session creation
        return {
          id: phone,
          name: phone,
          phone,
          accessToken: result.accessToken,
          userExists: result.userExists,
        };
      },
    }),
    CredentialsProvider({
      id: "token",
      name: "Token Login",
      credentials: {
        phone: { label: "Phone", type: "text" },
        accessToken: { label: "Access Token", type: "text" },
        userId: { label: "User ID", type: "text" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        const phone = credentials?.phone ? normalizePhone(credentials.phone) : "";
        const accessToken = credentials?.accessToken?.trim() ?? "";
        if (!phone || !accessToken) return null;

        const userId = credentials?.userId?.trim() || phone;
        const name = credentials?.name?.trim() || phone;

        return {
          id: userId,
          name,
          phone,
          accessToken,
          userExists: true,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const anyUser = user as unknown as {
          accessToken?: string;
          userExists?: boolean;
          phone?: string;
        };
        (token as unknown as { accessToken?: string }).accessToken = anyUser.accessToken;
        (token as unknown as { userExists?: boolean }).userExists = anyUser.userExists;
        (token as unknown as { phone?: string }).phone = anyUser.phone;
      }
      return token;
    },
    async session({ session, token }) {
      const anySession = session as unknown as { accessToken?: string; userExists?: boolean };
      anySession.accessToken = (token as unknown as { accessToken?: string }).accessToken;
      anySession.userExists = (token as unknown as { userExists?: boolean }).userExists;
      (anySession as unknown as { phone?: string }).phone = (token as unknown as { phone?: string }).phone;
      return session;
    },
  },
  pages: {
    signIn: "/home",
  },
};


