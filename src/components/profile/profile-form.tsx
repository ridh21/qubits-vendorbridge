"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { format } from "date-fns"
import { IconUser, IconLock, IconBuilding, IconShield } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  profileInfoSchema,
  changePasswordSchema,
  type ProfileInfoInput,
  type ChangePasswordInput,
} from "@/lib/validation/profile"
import { updateProfileInfo, changePassword } from "@/lib/actions/profile"
import { ROLE_LABELS } from "@/lib/rbac"
import type { Role } from "@prisma/client"

type ProfileFormProps = {
  user: {
    id: string
    name: string
    email: string
    role: Role
    createdAt: Date
    vendor: { name: string } | null
  }
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [infoPending, startInfoTransition] = useTransition()
  const [passwordPending, startPasswordTransition] = useTransition()

  // Form 1: Profile Info
  const infoForm = useForm<ProfileInfoInput>({
    resolver: zodResolver(profileInfoSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
    },
  })

  // Form 2: Password Change
  const passwordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const onInfoSubmit = (values: ProfileInfoInput) => {
    startInfoTransition(async () => {
      const res = await updateProfileInfo(values)
      if (res.ok) {
        toast.success(res.message ?? "Profile info updated successfully")
      } else {
        toast.error(res.error)
      }
    })
  }

  const onPasswordSubmit = (values: ChangePasswordInput) => {
    startPasswordTransition(async () => {
      const res = await changePassword(values)
      if (res.ok) {
        toast.success(res.message ?? "Password updated successfully")
        passwordForm.reset()
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_250px] lg:grid-cols-[1fr_300px] items-start">
      <div className="space-y-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <IconUser className="size-4" />
              General Details
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <IconLock className="size-4" />
              Password & Security
            </TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Profile Details</CardTitle>
                <CardDescription>
                  Update your display name and email address.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...infoForm}>
                  <form onSubmit={infoForm.handleSubmit(onInfoSubmit)} className="space-y-4">
                    <FormField
                      control={infoForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={infoForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pt-2">
                      <Button type="submit" disabled={infoPending}>
                        {infoPending ? "Saving changes..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Ensure your account is using a long, random password to stay secure.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pt-2">
                      <Button type="submit" disabled={passwordPending}>
                        {passwordPending ? "Updating password..." : "Update Password"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Account Info Meta Sidebar */}
      <Card className="border-muted bg-muted/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
            Account Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium uppercase mb-1">
              <IconShield className="size-3.5" />
              Role
            </div>
            <p className="font-semibold text-foreground text-sm">
              {ROLE_LABELS[user.role]}
            </p>
          </div>

          {user.role === "VENDOR" && user.vendor && (
            <div>
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium uppercase mb-1">
                <IconBuilding className="size-3.5" />
                Linked Vendor
              </div>
              <p className="font-semibold text-foreground text-sm">
                {user.vendor.name}
              </p>
            </div>
          )}

          <div>
            <div className="text-muted-foreground text-xs font-medium uppercase mb-1">
              Joined Since
            </div>
            <p className="font-medium text-foreground text-sm">
              {format(new Date(user.createdAt), "PP")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
