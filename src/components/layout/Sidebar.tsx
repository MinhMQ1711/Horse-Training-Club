"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";
import { initials } from "@/lib/format";
import { isNavItemActive, navFor, ROLE_LABEL } from "@/lib/permissions";
import type { AuthUser } from "@/types/auth";
import type { SidebarNote } from "./useSidebarInfo";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  user: AuthUser;
  pathname: string;
  note: SidebarNote | null;
  open: boolean; // chỉ có ý nghĩa ở màn hình hẹp (menu trượt ra)
  onNavigate: () => void;
}

// Sidebar xây từ DANH SÁCH QUYỀN của tài khoản (navFor), không chỉ từ tên vai trò:
// thu hồi quyền => mục tương ứng biến mất ở lần tải trang kế tiếp.
export function Sidebar({ user, pathname, note, open, onNavigate }: SidebarProps) {
  const groups = navFor(user.role, user.permissions);

  return (
    <nav aria-label="Main navigation" className={cx(styles.nav, open && styles.open)}>
      <div className={styles.brand}>
        <span className={styles.logo}>
          <Image src="/images/logo-fivegates.svg" alt="" width={26} height={26} />
        </span>
        <div>
          <strong>EquiFlow</strong>
          <span>THIEN MA</span>
        </div>
      </div>

      <div className={styles.user}>
        <span className={styles.userAvatar}>{initials(user.fullName)}</span>
        <div className={styles.userText}>
          <strong>{user.fullName}</strong>
          <span>{ROLE_LABEL[user.role]}</span>
        </div>
      </div>

      <div className={styles.groups}>
        {groups.map((g) => (
          <div key={g.label} className={styles.group}>
            <p className={styles.groupLabel}>{g.label}</p>
            {g.items.map((it) => {
              const active = isNavItemActive(it, pathname);
              return (
                <Link
                  key={it.id}
                  href={it.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cx(styles.item, active && styles.active)}
                >
                  <Icon name={it.icon} size={18} />
                  <span className={styles.itemLabel}>{it.label}</span>
                  {active && <span className={styles.dot} />}
                  {!active && it.alert && <span className={cx(styles.dot, styles.alertDot)} aria-label="Work waiting" />}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {note && (
        <div className={styles.note}>
          <div>
            <strong>{note.title}</strong>
            <span>{note.body}</span>
          </div>
          <Icon name="horse" size={16} />
        </div>
      )}

      <div className={styles.foot}>
        <span className={styles.footDot} />
        Thiên Mã Equestrian Club
      </div>
    </nav>
  );
}
