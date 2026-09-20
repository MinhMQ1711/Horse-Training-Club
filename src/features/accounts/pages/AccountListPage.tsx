"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCurrentUser } from "@/components/layout/AuthProvider";
import { PageHeader } from "@/components/layout/PageHeader";
import { Alert } from "@/components/ui/Alert";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { CellPrimary, DataTable } from "@/components/ui/DataTable";
import type { Column } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import { formatDate, formatDateTime, formatTime } from "@/lib/format";
import { messageFor } from "@/lib/messages";
import { ROLE_LABEL } from "@/lib/permissions";
import { ACCOUNT_STATUS, tabOf } from "@/lib/status";
import type { AccountTab } from "@/lib/status";
import type { PublicAccount, Role } from "@/types/auth";
import { listAccounts, runAccountAction } from "../api";
import type { AccountAction } from "../api";
import { CreateAccountModal } from "../components/CreateAccountModal";
import { RoleFilter } from "../components/RoleFilter";
import styles from "./AccountListPage.module.css";

const PAGE_SIZE = 10;

const EMPTY_COPY: Record<AccountTab, { title: string; description: string }> = {
  ALL: {
    title: "No accounts match this filter.",
    description: "Change the filter above, or create an account for a new member of the club.",
  },
  PENDING: { title: "No requests are waiting.", description: "New sign-up requests and invitations appear here until they are settled." },
  ACTIVE: { title: "No active accounts match this filter.", description: "Approve a pending request or unlock an account to see it here." },
  LOCKED: {
    title: "No locked accounts.",
    description: "Locked accounts appear here with the reason and the time they were locked. Nothing is locked at the moment.",
  },
};

// Design 1.9: danh sách tài khoản — duyệt yêu cầu, khóa/mở khóa, mở màn Permissions của từng tài khoản.
// Trang này KHÔNG tự kiểm vai trò: RoleGuard đã chặn ở cấp route (Club Manager mới vào được).
export default function AccountListPage() {
  const me = useCurrentUser();
  const toast = useToast();

  const [accounts, setAccounts] = useState<PublicAccount[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null); // giờ lỗi để hiện trong Alert
  const [tab, setTab] = useState<AccountTab>("ALL");
  const [roleFilter, setRoleFilter] = useState<Role | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [lockTarget, setLockTarget] = useState<PublicAccount | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setAccounts(null);
    setLoadError(null);
    try {
      const res = await listAccounts();
      setAccounts(res.accounts);
    } catch {
      // 401/403 đã được xử lý chung; các lỗi còn lại hiện Alert kèm nút thử lại.
      setLoadError(formatTime(Date.now()));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const replace = (updated: PublicAccount) =>
    setAccounts((list) => (list ? list.map((a) => (a.id === updated.id ? updated : a)) : list));

  async function run(target: PublicAccount, action: AccountAction) {
    setBusy(true);
    try {
      const res = await runAccountAction(target.id, action);
      replace(res.account);
      const name = target.fullName;
      if (action === "approve") toast.show(`Account approved. ${name} can sign in as ${ROLE_LABEL[target.role]}.`, "ok");
      if (action === "decline") toast.show(`Request declined. ${name} was notified by email.`, "warn");
      if (action === "lock") toast.show(`Account locked. ${name} can no longer sign in.`, "warn");
      if (action === "unlock") toast.show(`Account unlocked. ${name} can sign in again.`, "ok");
    } catch (err) {
      toast.show(messageFor(err), "danger");
    } finally {
      setBusy(false);
      setLockTarget(null);
    }
  }

  const activeManagers = (accounts ?? []).filter((a) => a.role === "CLUB_MANAGER" && a.status === "ACTIVE").length;

  const scoped = useMemo(() => (accounts ?? []).filter((a) => roleFilter === "ALL" || a.role === roleFilter), [accounts, roleFilter]);
  const counts = useMemo(
    () => ({
      ALL: scoped.length,
      PENDING: scoped.filter((a) => tabOf(a.status) === "PENDING").length,
      ACTIVE: scoped.filter((a) => a.status === "ACTIVE").length,
      LOCKED: scoped.filter((a) => a.status === "LOCKED").length,
    }),
    [scoped],
  );
  const rows = useMemo(() => scoped.filter((a) => tab === "ALL" || tabOf(a.status) === tab), [scoped, tab]);
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const visible = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const columns: Column<PublicAccount>[] = [
    {
      key: "account",
      header: "Account",
      width: 290,
      render: (r) => (
        <CellPrimary
          title={r.id === me.id ? `${r.fullName} (you)` : r.fullName}
          meta={r.email}
          avatar={<Avatar name={r.fullName} size={32} tone={r.id === me.id ? "brand" : "neutral"} />}
        />
      ),
    },
    { key: "role", header: "Role", width: 200, render: (r) => ROLE_LABEL[r.role] },
    {
      key: "status",
      header: "Status",
      width: 160,
      render: (r) => {
        const s = ACCOUNT_STATUS[r.status];
        return <Badge tone={s.tone}>{s.label}</Badge>;
      },
    },
    {
      key: "last",
      header: "Last active",
      width: 190,
      hideOnNarrow: true,
      render: (r) => (r.lastActive ? formatDateTime(r.lastActive) : r.requestedAt ? `requested ${formatDate(r.requestedAt)}` : "—"),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (r) => (
        <div className={styles.actions}>
          {r.status === "PENDING_APPROVAL" && (
            <>
              <Button size="sm" icon="check" disabled={busy} onClick={() => run(r, "approve")}>
                Approve
              </Button>
              <Button tone="ghost" size="sm" disabled={busy} onClick={() => run(r, "decline")}>
                Decline
              </Button>
            </>
          )}
          {r.status === "LOCKED" && (
            <Button tone="secondary" size="sm" icon="unlock" disabled={busy} onClick={() => run(r, "unlock")}>
              Unlock
            </Button>
          )}
          {r.status === "ACTIVE" && (
            <Button
              tone="secondary"
              size="sm"
              icon="lock"
              disabled={busy}
              blockedReason={
                r.id === me.id
                  ? "You cannot lock your own account. Ask another Club Manager."
                  : r.role === "CLUB_MANAGER" && activeManagers <= 1
                    ? "The club must keep at least one active Club Manager."
                    : undefined
              }
              onClick={() => setLockTarget(r)}
            >
              Lock
            </Button>
          )}
          <Link href={`/accounts/${r.id}/permissions`} className={styles.link}>
            Permissions
          </Link>
        </div>
      ),
    },
  ];

  const empty = (
    <EmptyState
      icon="users"
      title={EMPTY_COPY[tab].title}
      description={EMPTY_COPY[tab].description}
      action={
        tab === "ALL" ? (
          <Button size="sm" icon="plus" onClick={() => setCreateOpen(true)}>
            Create account
          </Button>
        ) : undefined
      }
    />
  );

  return (
    <>
      <PageHeader
        eyebrow="MANAGEMENT WORKSPACE"
        title="Every account and what it may reach."
        description="Approve requests, lock an account that must not sign in, and open the permission list of any account."
        showDate
      />

      {/* Trạng thái LỖI (design 1.9f): nêu giờ, khẳng định chưa đổi gì, có nút thử lại. Tab vẫn hiện. */}
      {loadError && (
        <Alert
          tone="danger"
          icon="xCircle"
          title="The account list could not be loaded"
          action={
            <Button tone="secondary" size="sm" icon="refresh" onClick={load}>
              Try again
            </Button>
          }
        >
          The account service did not answer at {loadError} · {formatDate(new Date())}. Nothing was changed. Try again, and report it to the club
          administrator if it keeps failing.
        </Alert>
      )}

      <Card pad={0}>
        <div className={styles.toolbar}>
          <Tabs
            label="Account status"
            active={tab}
            onChange={(id) => {
              setTab(id);
              setPage(1);
            }}
            items={[
              { id: "ALL", label: "All", count: counts.ALL },
              { id: "PENDING", label: "Pending", count: counts.PENDING },
              { id: "ACTIVE", label: "Active", count: counts.ACTIVE },
              { id: "LOCKED", label: "Locked", count: counts.LOCKED },
            ]}
          />
          <div className={styles.tools}>
            <RoleFilter
              value={roleFilter}
              onChange={(v) => {
                setRoleFilter(v);
                setPage(1);
              }}
            />
            <Button size="sm" icon="plus" onClick={() => setCreateOpen(true)}>
              Create account
            </Button>
          </div>
        </div>

        <div className={styles.table}>
          {loadError ? (
            <EmptyState icon="refresh" title="Nothing to show yet." description="The list appears as soon as the account service answers." />
          ) : (
            <DataTable
              caption="Accounts"
              columns={columns}
              rows={visible}
              rowKey={(r) => r.id}
              loading={accounts === null}
              empty={empty}
            />
          )}
        </div>

        {!loadError && accounts !== null && (
          <Pagination page={current} pageSize={PAGE_SIZE} total={rows.length} noun="accounts" onPage={setPage} />
        )}
      </Card>

      {lockTarget && (
        <ConfirmModal
          title={`Lock the account of ${lockTarget.fullName}?`}
          subtitle={`${ROLE_LABEL[lockTarget.role]} · ${lockTarget.email}`}
          tone="danger"
          confirmLabel="Lock account"
          cancelLabel="Keep active"
          busy={busy}
          onCancel={() => setLockTarget(null)}
          onConfirm={() => run(lockTarget, "lock")}
        >
          Sign-in is refused from the next attempt and any open session ends within a minute. Records already entered by this account stay in
          place. Unlocking is possible at any time from this list.
        </ConfirmModal>
      )}

      {createOpen && (
        <CreateAccountModal
          onClose={() => setCreateOpen(false)}
          onCreated={(account) => {
            setAccounts((list) => (list ? [...list, account] : [account]));
            setCreateOpen(false);
            setTab("PENDING");
            setPage(1);
            toast.show(`Invitation sent to ${account.email}.`, "ok");
          }}
        />
      )}
    </>
  );
}
