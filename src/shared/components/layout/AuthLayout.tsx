import Image from "next/image";
import type { ReactNode } from "react";
import { cx } from "@/shared/lib/cx";
import styles from "./AuthLayout.module.css";

export interface Hero {
  eyebrow: string;
  lines: [string, string];
  body: string;
}

export const HERO_DEFAULT: Hero = {
  eyebrow: "EQUIFLOW · ONE WORKSPACE, FIVE ROLES",
  lines: ["Every horse.", "One journey forward."],
  body: "Track form, schedule training and stay beside every horse in the club.",
};

export const HERO_TEAM: Hero = {
  eyebrow: "EQUIFLOW · ONE WORKSPACE, FIVE ROLES",
  lines: ["One team.", "One shared goal."],
  body: "Every account is tied to one role, and every role sees only the work it is granted.",
};

interface AuthLayoutProps {
  title: string; // câu hoàn chỉnh, kết bằng dấu chấm
  description?: string;
  hero?: Hero;
  compact?: boolean; // form dài (Sign Up): giảm padding dọc
  children: ReactNode;
}

// Khung 2 cột chuẩn của mọi màn public (design Phase 0 · 1a): cột form 660px + ảnh editorial.
// Dưới 980px xếp dọc: dải ảnh 186px ở trên, form ở dưới.
export function AuthLayout({ title, description, hero = HERO_DEFAULT, compact, children }: AuthLayoutProps) {
  return (
    <div className={styles.page}>
      <section className={cx(styles.formPane, compact && styles.compact)}>
        <div className={styles.brand}>
          <Image src="/images/logo-fivegates.svg" alt="EquiFlow" width={32} height={32} />
          <div>
            <strong>TMEC</strong>
            <span>THIEN MA EQUESTRIAN CLUB</span>
          </div>
        </div>

        <main className={styles.column}>
          <p className={styles.eyebrow}>CLUB WORKSPACE</p>
          <h1 className={styles.title}>{title}</h1>
          {description && <p className={styles.description}>{description}</p>}
          <div className={styles.body}>{children}</div>
        </main>

        <p className={styles.support}>Club support: support@equiflow.vn · 024 3771 2088</p>
      </section>

      <aside className={styles.hero} aria-hidden="true">
        <Image
          src="/images/equine-editorial.webp"
          alt=""
          fill
          priority
          sizes="(max-width: 980px) 100vw, 60vw"
          className={styles.photo}
        />
        <div className={styles.scrim} />
        <div className={styles.heroDesktop}>
          <p>{hero.eyebrow}</p>
          <strong>
            {hero.lines[0]}
            <br />
            {hero.lines[1]}
          </strong>
          <span>{hero.body}</span>
        </div>
        <div className={styles.heroMobile}>
          <div className={styles.mobileBrand}>
            <Image src="/images/logo-fivegates.svg" alt="" width={26} height={26} />
            <strong>EquiFlow</strong>
          </div>
          <p>THIEN MA EQUESTRIAN CLUB</p>
          <strong>Every horse. One journey forward.</strong>
        </div>
      </aside>
    </div>
  );
}
