"use server"

import { redirect } from "next/navigation"

import { signOut } from "@/lib/auth"

export async function signOutAction() {
  // Clear the session without letting Auth.js compute an absolute redirect URL
  // (which can fall back to AUTH_URL / NEXTAUTH_URL = localhost on misconfigured
  // deploys). We do the redirect ourselves with a relative path — the browser
  // resolves it against whatever origin it's currently on.
  await signOut({ redirect: false })
  redirect("/login")
}
