import { useState } from "react";
import { Info, UserX } from "lucide-react";
import { SettingsCard, useDirtyGuard } from "@/components/settings/SettingsShell";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { SwitchRow } from "@/components/ui/switch";
import { useGlobalToast } from "@/components/ui/toast";
import { useAuth } from "@/context/AuthContext";
import { useBlockedUsers, type BlockedUser } from "@/context/BlockedUsersContext";
import { readPrivacy, writePrivacy } from "@/lib/userPrefs";

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(iso),
  );

export function PrivacySettings() {
  const { user } = useAuth();
  const { blocked, unblock } = useBlockedUsers();
  const { show } = useGlobalToast();
  const [saved, setSaved] = useState(() => readPrivacy(user?.id ?? "").showWilaya);
  const [showWilaya, setShowWilaya] = useState(saved);
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState<BlockedUser | null>(null);
  useDirtyGuard("privacy", showWilaya !== saved);
  if (!user) return null;

  return (
    <>
      <form
        id="privacy-form"
        onSubmit={(event) => {
          event.preventDefault();
          setSaving(true);
          window.setTimeout(() => {
            writePrivacy(user.id, { showWilaya });
            setSaved(showWilaya);
            setSaving(false);
            show({ message: "Privacy settings updated" });
          }, 800);
        }}
      >
        <SettingsCard
          title="Privacy"
          description="Control what other people can see about you."
          formId="privacy-form"
          dirty={showWilaya !== saved}
          saving={saving}
          onCancel={() => setShowWilaya(saved)}
        >
          <div className="-my-4">
            <SwitchRow
              title="Show my wilaya on my public profile"
              description="Buyers see the wilaya you set in your profile."
              checked={showWilaya}
              onChange={setShowWilaya}
            />
          </div>
        </SettingsCard>
      </form>

      <SettingsCard title="Blocked users" description="People you've blocked from contacting you.">
        {blocked.length === 0 ? (
          <div className="py-8 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted-soft text-primary">
              <UserX className="size-6" />
            </span>
            <p className="mt-3 text-sm text-text-secondary">You haven't blocked anyone.</p>
          </div>
        ) : (
          <ul className="divide-y rounded-button border">
            {blocked.map((item) => (
              <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar src={item.avatar} name={item.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text-primary">{item.name}</p>
                  <p className="text-xs text-text-secondary">
                    Blocked {formatDate(item.blockedAt)}
                  </p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setPending(item)}>
                  Unblock
                </Button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex gap-2.5 rounded-button bg-muted-soft p-3.5 text-sm text-muted">
          <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
          Blocked users can't message you or see your contact details. They aren't notified.
        </div>
      </SettingsCard>

      {pending && (
        <ConfirmDialog
          title={`Unblock ${pending.name}?`}
          description="They'll be able to message you again."
          confirmLabel="Unblock"
          onClose={() => setPending(null)}
          onConfirm={() => {
            unblock(pending.id);
            show({ message: `${pending.name} unblocked` });
            setPending(null);
          }}
        />
      )}
    </>
  );
}
