import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { SettingsClient } from "@/modules/settings/ui/components/settings-client";

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/sign-in");

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });
  if (!user) redirect("/auth/sign-in");

  return <SettingsClient user={user} />;
}