import { Shell } from "@/components/dashboard/shell";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/dashboard/header";
import { NotificationsForm } from "../components";

export default function DashboardNotifications() {
  return (
    <Shell>
      <Header
        title="Notifications"
        description="Configure how you receive notifications."
      />
      <div className="grid gap-10">
        <Separator />
        <NotificationsForm />
      </div>
    </Shell>
  );
}
