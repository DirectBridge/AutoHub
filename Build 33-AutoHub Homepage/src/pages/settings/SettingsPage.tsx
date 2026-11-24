import { SettingsShell, type SettingsTab } from "@/components/settings/SettingsShell";
import { AccountSettings } from "./AccountSettings";
import { NotificationSettings } from "./NotificationSettings";
import { PrivacySettings } from "./PrivacySettings";
import { ProfileSettings } from "./ProfileSettings";

export function SettingsPage({ tab }: { tab: SettingsTab }) {
  return (
    <SettingsShell tab={tab}>
      {tab === "profile" && <ProfileSettings />}
      {tab === "account" && <AccountSettings />}
      {tab === "notifications" && <NotificationSettings />}
      {tab === "privacy" && <PrivacySettings />}
    </SettingsShell>
  );
}
