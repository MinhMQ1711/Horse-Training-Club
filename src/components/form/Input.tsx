"use client";

import type { InputHTMLAttributes } from "react";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";
import { useFieldControl } from "./Field";
import styles from "./Control.module.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: string;
  invalid?: boolean;
  numeric?: boolean;
}

export function Input({ icon, invalid, numeric, className, id, ...rest }: InputProps) {
  const field = useFieldControl();
  const isInvalid = invalid ?? field?.invalid ?? false;

  const input = (
    <input
      id={id ?? field?.id}
      aria-invalid={isInvalid || undefined}
      aria-describedby={field?.describedBy}
      className={cx(styles.control, icon && styles.withIcon, numeric && styles.numeric, isInvalid && styles.invalid, className)}
      {...rest}
    />
  );

  if (!icon) return input;
  return (
    <div className={styles.wrap}>
      <span className={styles.icon}>
        <Icon name={icon} size={15} />
      </span>
      {input}
    </div>
  );
}
