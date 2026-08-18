import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InviteTeammateModal } from "@/users/components/InviteTeammateModal";
import { cn } from "@/lib/utils";
import type { OrgUser, UserRole } from "@/users/types/user";

const ROLE_CONFIG: Record<
  UserRole,
  { label: string; text: string; bg: string }
> = {
  HR: { label: "HR", text: "text-primary", bg: "bg-primary/10" },
  INTERVIEWER: {
    label: "Interviewer",
    text: "text-violet-700 dark:text-violet-400",
    bg: "bg-violet-500/10",
  },
};

interface TeamMembersListProps {
  users: OrgUser[];
  /** Called with the newly created account so the page can add it to the list. */
  onInvited: (user: OrgUser) => void;
}

export function TeamMembersList({ users, onInvited }: TeamMembersListProps) {
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card ring-1 ring-foreground/5">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Team members
          </h2>
          <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[11px] font-medium text-muted-foreground">
            {users.length}
          </span>
        </div>

        <Button
          size="sm"
          className="h-8 gap-1.5"
          onClick={() => setInviteOpen(true)}
        >
          <UserPlus className="size-3.5" />
          Invite teammate
        </Button>
      </div>

      <InviteTeammateModal
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvited={onInvited}
      />

      {users.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-muted-foreground">
          No teammates yet — invite your HR and interviewer accounts to get
          started.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-2.5 font-mono text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Name
                </th>
                <th className="px-5 py-2.5 font-mono text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Email
                </th>
                <th className="px-5 py-2.5 font-mono text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Role
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => {
                const role = ROLE_CONFIG[user.role];
                return (
                  <tr
                    key={user.id}
                    className="transition-colors hover:bg-muted/40"
                  >
                    <td className="px-5 py-3 font-medium whitespace-nowrap text-foreground">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-muted-foreground">
                      {user.email}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 font-mono text-[11px] font-medium",
                          role.bg,
                          role.text,
                        )}
                      >
                        {role.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
