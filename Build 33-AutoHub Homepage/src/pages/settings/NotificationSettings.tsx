import { useState } from "react";
import { SettingsCard, useDirtyGuard } from "@/components/settings/SettingsShell";
import { isSellerRole } from "@/components/dashboard/DashboardLayout";
import { SwitchRow } from "@/components/ui/switch";
import { useGlobalToast } from "@/components/ui/toast";
import { useAuth } from "@/context/AuthContext";
import { readNotifications, writeNotifications, type NotificationPrefs } from "@/lib/userPrefs";

export function NotificationSettings() {
  const { user } = useAuth();
  const { show } = useGlobalToast();
  const [saved, setSaved] = useState<NotificationPrefs>(() => readNotifications(user?.id ?? ""));
  const [prefs, setPrefs] = useState(saved);
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(prefs) !== JSON.stringify(saved);
  useDirtyGuard("notifications", dirty);
  if (!user) return null;
  const seller = isSellerRole(user.role);
  const set = (key: keyof NotificationPrefs) => (value: boolean) =>
    setPrefs((current) => ({ ...current, [key]: value }));

  return (
    <form
      id="notifications-form"
      onSubmit={(event) => {
        event.preventDefault();
        setSaving(true);
        window.setTimeout(() => {
          writeNotifications(user.id, prefs);
          setSaved(prefs);
          setSaving(false);
          show({ message: "Notification preferences updated" });
        }, 800);
      }}
    >
      <SettingsCard
        title="Email notifications"
        description="Choose which emails you'd like to receive."
        formId="notifications-form"
        dirty={dirty}
        saving={saving}
        onCancel={() => setPrefs(saved)}
      >
        <div className="-my-4 divide-y">
          <SwitchRow
            title="New messages"
            description="Email me when I receive a new message"
            checked={prefs.messages}
            onChange={set("messages")}
          />
          <SwitchRow
            title="Verification updates"
            description="Email me when my verification status changes"
            checked={seller ? true : prefs.verification}
            onChange={set("verification")}
            disabled={seller}
            lockedReason={seller ? "Required for sellers" : undefined}
          />
          {seller && (
            <SwitchRow
              title="Listing activity"
              description="Weekly summary of views and inquiries"
              checked={prefs.activity}
              onChange={set("activity")}
            />
          )}
          <SwitchRow
            title="Saved search matches"
            description="Email me when new cars match my saved searches"
            checked={prefs.savedSearches}
            onChange={set("savedSearches")}
          />
          <SwitchRow
            title="Product news"
            description="Occasional updates from 33-AutoHub"
            checked={prefs.news}
            onChange={set("news")}
          />
        </div>
      </SettingsCard>
    </form>
  );
}
