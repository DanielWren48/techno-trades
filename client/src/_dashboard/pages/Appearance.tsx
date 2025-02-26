import { Shell } from "@/components/dashboard/shell";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/dashboard/header";
import { AppearanceForm } from "../components";

export default function DashboardAppearance() {
  return (
    <Shell>
      <Header
        title="Appearance"
        description="Customize the appearance of the app. Automatically switch between day
        and night themes."
        size="default"
      />
      <div className="grid gap-10">
        <Separator />
        <AppearanceForm />
      </div>
    </Shell>
  );
}
