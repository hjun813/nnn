import { DashboardShell } from "@/components/dashboard-shell";
import { getDashboardPreview } from "@/lib/demo-data";

export default function Home() {
  return <DashboardShell dashboard={getDashboardPreview()} />;
}
