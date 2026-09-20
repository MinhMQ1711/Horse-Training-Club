"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/components/layout/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { capitalize } from "@/lib/format";
import { messageFor } from "@/lib/messages";
import { ROLE_LABEL } from "@/lib/permissions";
import type { ScreenAccess } from "@/lib/permissions";
import { logForbidden, requestPermission } from "../api";
import type { ForbiddenInfo } from "../types";
import styles from "./Forbidden403Page.module.css";

interface Forbidden403PageProps {
  // Có `access` khi RoleGuard chặn một route; không có khi vào thẳng /forbidden (API trả 403).
  access?: ScreenAccess;
}

// Design 1.13: khung app vẫn hiện để người dùng không bị "bỏ rơi".
export default function Forbidden403Page({ access }: Forbidden403PageProps) {
  const user = useCurrentUser();
  const router = useRouter();
  const toast = useToast();
  const [info, setInfo] = useState<ForbiddenInfo | null>(null);
  const [requested, setRequested] = useState(false);

  const screen = access?.label ? `${capitalize(access.group ?? "")} / ${access.label}` : "Unknown screen";

  // Ghi nhật ký lần bị chặn + lấy mã tham chiếu để truy vết nếu quyền bị thu hồi nhầm.
  useEffect(() => {
    let cancelled = false;
    logForbidden(screen)
      .then((res) => {
        if (!cancelled) setInfo(res);
      })
      .catch(() => {
        // Không lấy được mã tham chiếu cũng không sao: trang vẫn giải thích được.
      });
    return () => {
      cancelled = true;
    };
  }, [screen]);

  const manager = info?.managerName ?? "the Club Manager";

  let reason = "An action was refused because it is not part of your permissions.";
  if (access?.label) {
    reason = access.inOwnRole
      ? `${access.label} needs a permission that is not granted to this account.`
      : `${access.label} belongs to the ${access.ownerRoles.map((r) => ROLE_LABEL[r]).join(" and ")}.`;
  }

  async function onRequest() {
    if (!info) return;
    try {
      await requestPermission(screen, info.reference);
      setRequested(true);
      toast.show(`Permission request sent to ${manager}.`, "ok");
    } catch (err) {
      toast.show(messageFor(err), "danger");
    }
  }

  return (
    <Card>
      <div className={styles.wrap}>
        <span className={styles.icon}>
          <Icon name="ban" size={24} />
        </span>
        <div>
          <p className={styles.eyebrow}>403 · ACCESS DENIED</p>
          <h1 className={styles.title}>This screen is not part of your permissions.</h1>
          <p className={styles.text}>
            {reason} Ask {manager} to grant the permission if the work requires it.
          </p>
        </div>
        <div className={styles.actions}>
          <Button icon="home" onClick={() => router.push("/dashboard")}>
            Back to my workspace
          </Button>
          <Button
            tone="secondary"
            icon="mail"
            onClick={onRequest}
            blockedReason={requested ? "The request was already sent to the Club Manager." : !info ? "Preparing the request…" : undefined}
          >
            Request the permission
          </Button>
        </div>
        <dl className={styles.facts}>
          <div>
            <dt>Screen</dt>
            <dd>{screen}</dd>
          </div>
          <div>
            <dt>Signed in as</dt>
            <dd>
              {user.fullName}, {ROLE_LABEL[user.role]}
            </dd>
          </div>
          <div>
            <dt>Reference</dt>
            <dd>{info?.reference ?? "…"}</dd>
          </div>
        </dl>
      </div>
    </Card>
  );
}
