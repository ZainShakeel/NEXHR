import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where:   { email: credentials.email },
          include: { company: true, employee: true },
        });

        if (!user || !user.isActive) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        await prisma.user.update({
          where: { id: user.id },
          data:  { lastLoginAt: new Date() },
        });

        return {
          id:          user.id,
          email:       user.email,
          role:        user.role,
          companyId:   user.companyId,
          companyName: user.company.name,
          employeeId:  user.employee?.id ?? null,
          name:        user.employee ? `${user.employee.firstName} ${user.employee.lastName}` : user.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role       = (user as any).role;
        token.companyId  = (user as any).companyId;
        token.companyName = (user as any).companyName;
        token.employeeId = (user as any).employeeId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role       = token.role;
        (session.user as any).companyId  = token.companyId;
        (session.user as any).companyName = token.companyName;
        (session.user as any).employeeId = token.employeeId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error:  "/login",
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
