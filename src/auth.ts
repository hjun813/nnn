import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import { findUserByEmail } from "@/db/queries";
import { consumeRateLimit, getRequestIp } from "@/lib/rate-limit";

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(128),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(input, request) {
        const parsed = credentialsSchema.safeParse(input);
        if (!parsed.success) return null;
        const rateLimit = await consumeRateLimit({
          action: "login",
          identifier: `${getRequestIp(request)}:${parsed.data.email}`,
          limit: 10,
          windowMs: 15 * 60 * 1000,
        });
        if (!rateLimit.allowed) return null;
        const user = await findUserByEmail(parsed.data.email);
        if (!user || !(await compare(parsed.data.password, user.passwordHash))) return null;
        return { id: user.id, email: user.email };
      },
    }),
  ],
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
