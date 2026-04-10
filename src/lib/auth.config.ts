import type { NextAuthConfig } from "next-auth";

/**
 * Shared auth config — safe for Edge middleware (no DB imports).
 * The full auth.ts extends this with the Credentials provider + prisma.
 */
export const authConfig: NextAuthConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: string }).role;
        token.tenantId = (user as { tenantId: string | null }).tenantId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "REVIEWER" | "VIEWER";
        session.user.tenantId = token.tenantId as string | null;
      }
      return session;
    },
  },
  providers: [], // Credentials provider added in auth.ts (server-side only)
};
