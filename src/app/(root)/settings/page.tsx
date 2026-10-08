import { getUser } from "@/lib/dal";
import {
  ProfileSettingsForm,
  AppearanceSettings,
} from "@/components/settings/settings-forms";

export default async function SettingsPage() {
  const user = await getUser();

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile preferences and appearance theme.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <ProfileSettingsForm
          initialUser={{
            name: user?.name ?? "",
            email: user?.email ?? "",
          }}
        />

        <AppearanceSettings />
      </div>
    </div>
  );
}