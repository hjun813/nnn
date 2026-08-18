import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard-shell";
import { loadDashboard } from "@/db/queries";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const dashboard = await loadDashboard(session.user.id);
  return <DashboardShell dashboard={dashboard} email={session.user.email ?? undefined} />;
}
