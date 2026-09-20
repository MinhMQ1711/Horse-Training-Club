"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Field } from "@/components/form/Field";
import { Input } from "@/components/form/Input";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api";
import { messageFor } from "@/lib/messages";
import { forgotPassword } from "../api";
import styles from "./AuthPages.module.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Bước 1 quên mật khẩu: nhập email để nhận mã OTP.
// Kết quả LUÔN giống nhau dù email có tồn tại hay không (thông báo trung tính).
export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [failure, setFailure] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const mail = email.trim().toLowerCase();
    if (!mail) return setError("Club email is required.");
    if (!EMAIL_RE.test(mail)) return setError("Email must look like name@equiflow.vn.");

    setBusy(true);
    setError("");
    setFailure("");
    try {
      await forgotPassword(mail);
      router.push(`/forgot-password/verify?email=${encodeURIComponent(mail)}`);
    } catch (err) {
      if (err instanceof ApiError && err.code === "INVALID_EMAIL") setError("Email must look like name@equiflow.vn.");
      else setFailure(messageFor(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Reset your password."
      description="Enter the club email of the account. A 6-digit code follows by email and stays valid for 15 minutes."
    >
      <form onSubmit={onSubmit} noValidate style={{ display: "contents" }}>
        {failure && (
          <Alert tone="danger" icon="xCircle" title="The code could not be sent">
            {failure}
          </Alert>
        )}
        <Field label="Club email" required error={error} hint="For security the answer is the same whether or not the email exists">
          <Input
            type="email"
            icon="mail"
            placeholder="name@equiflow.vn"
            autoComplete="username"
            value={email}
            disabled={busy}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
          />
        </Field>
        <Button type="submit" size="lg" block iconAfter="arrowRight" disabled={busy}>
          {busy ? "Sending…" : "Send OTP"}
        </Button>
        <p className={styles.foot}>
          <Link href="/login">Back to sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
