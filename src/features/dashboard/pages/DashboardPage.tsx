"use client";

import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/components/layout/AuthProvider";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { givenName, padCount } from "@/lib/format";
import { navFor, PERMISSIONS, ROLE_LABEL, ROLE_WORKSPACE } from "@/lib/permissions";
import styles from "./DashboardPage.module.css";

// Trang chủ tạm sau đăng nhập. Dashboard thật của từng vai trò thuộc Priority 5 (làm ở giai đoạn sau).
export default function DashboardPage() {
  const user = useCurrentUser();
  const granted = PERMISSIONS.filter((p) => user.permissions[p.key]);
  const screens = navFor(user.role, user.permissions).reduce((n, g) => n + g.items.length, 0);
  const router = useRouter();

  return (
    <>
      <PageHeader
        eyebrow={ROLE_WORKSPACE[user.role].toUpperCase()}
        title={`Hello, ${givenName(user.fullName)}.`}
        description="Your role dashboard is built in Priority 5. Use the sidebar to reach the screens your permissions allow."
        showDate
      />

      <div className={styles.grid}>
        <Card title="Your access" subtitle={ROLE_LABEL[user.role]}>
          <div className={styles.rows}>
            <div>
              <span>Permissions granted</span>
              <b>{padCount(granted.length)}</b>
            </div>
            <div>
              <span>Screens in the sidebar</span>
              <b>{padCount(screens)}</b>
            </div>
          </div>
        </Card>

        <Card title="What is built so far" subtitle="Priority 1 · Authentication and access control">
          <p className={styles.text}>
            Sign in, sign up with an email code, password recovery, the role-based sidebar, your profile and password.
            {user.permissions.manageAccounts && " As Club Manager you can also approve, lock and unlock accounts and edit their permissions."}
          </p>
          {user.permissions.manageAccounts && (
            <Button tone="secondary" size="sm" icon="users" onClick={() => router.push("/accounts")}>
              Open the account list
            </Button>
          )}
        </Card>
      </div>
    </>
  );
}
