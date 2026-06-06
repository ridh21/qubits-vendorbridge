import NextAuth, { type DefaultSession } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

import { prisma } from "@/lib/prisma"
import { loginSchema } from "@/lib/validation/auth"
import type { Role } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
      vendorId: string | null
    } & DefaultSession["user"]
  }

  interface User {
    role: Role
    vendorId: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: Role
    vendorId: string | null
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (raw) => {
        const parsed = loginSchema.safeParse(raw)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        })
        if (!user || user.disabled) return null

        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash)
        if (!ok) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          vendorId: user.vendorId,
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id as string
        token.role = user.role
        token.vendorId = user.vendorId
      }
      return token
    },
    session: async ({ session, token }) => {
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.vendorId = token.vendorId
      }
      return session
    },
  },
})
