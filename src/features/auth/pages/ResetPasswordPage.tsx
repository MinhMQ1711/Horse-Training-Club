"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Field } from "@/components/form/Field";
import { Input } from "@/components/form/Input";
import { PasswordStrength } from "@/components/form/PasswordStrength";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { messageFor } from "@/lib/messages";
import { passwordError } from "@/lib/password";
import { resetPassword } from "../api";
import { resetFlow } from "../flow";
import type { ResetFlow } from "../flow";
import styles from "./AuthPages.module.css";

// Bước 3 quên mật khẩu (design 1.6): đặt mật khẩu mới sau khi OTP đã đúng.
export default function ResetPasswordPage() {
  const router = useRouter();
  const [flow, setFlow] = useState<ResetFlow | null | undefined>(undefined);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [alert, setAlert] = useState<{ title: string; body: string } | null>(null);
  const [expired, setExpired] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const stored = resetFlow.get();
    setFlow(stored);
    // Chưa qua bước nhập OTP thì không vào được màn này.
    if (!stored) router.replace("/forgot-password");
  }, [router]);

  if (!flow) return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy || !flow) return;

    const next: typeof errors = {};
    const weak = passwordError(password);
    if (weak) next.password = weak;
    if (confirm !== password) next.confirm = "The two passwords do not match.";
    if (next.password || next.confirm) {
      setErrors(next);
      setAlert({ title: "Password not saved", body: "Check the marked fields below." });
      return;
    }

    setBusy(true);
    setErrors({});
    setAlert(null);
    try {
      await resetPassword(flow.token, password);
      resetFlow.clear();
      router.push("/login?reset=1");
    } catch (err) {
      if (err instanceof ApiError && err.code === "RESET_EXPIRED") setExpired(true);
      else setAlert({ title: "Password not saved", body: messageFor(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Choose the new password."
      description={`Resetting for ${flow.email}. The code was accepted; this step expires at ${formatDateTime(flow.expiresAt).split(" · ")[1]}.`}
    >
      <form onSubmit={onSubmit} noValidate style={{ display: "contents" }}>
        {expired && (
          <Alert tone="warn" icon="clock" title="This reset has expired">
            Request a new code to set the password.
          </Alert>
        )}
        {alert && (
          <Alert tone="danger" icon="alert" title={alert.title}>
            {alert.body}
          </Alert>
        )}

        <Field label="New password" required error={errors.password}>
          <Input
            type="password"
            icon="key"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            value={password}
            disabled={busy}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((x) => ({ ...x, password: undefined }));
            }}
          />
        </Field>

        <PasswordStrength password={password} />

        <Field label="Confirm new password" required error={errors.confirm}>
          <Input
            type="password"
            icon="key"
            placeholder="Repeat the new password"
            autoComplete="new-password"
            value={confirm}
            disabled={busy}
            onChange={(e) => {
              setConfirm(e.target.value);
              setErrors((x) => ({ ...x, confirm: undefined }));
            }}
          />
        </Field>

        <Button type="submit" size="lg" block iconAfter="arrowRight" disabled={busy || expired}>
          {busy ? "Saving…" : "Save password and sign in"}
        </Button>
        <p className={styles.foot}>
          Code expired? <Link href="/forgot-password">Request a new one</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
