import { redirect } from "next/navigation"
import { requireUser } from "@/lib/rbac"
import { prisma } from "@/lib/prisma"
import { ProfileForm } from "@/components/profile/profile-form"
import { PageHeader } from "@/components/layout/page-header"

export default async function ProfilePage() {
  const sessionUser = await requireUser()

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      vendor: {
        select: {
          name: true,
        },
      },
    },
  })

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="Manage your account profile details, email settings, and security preferences."
      />
      <ProfileForm user={user} />
    </div>
  )
}
