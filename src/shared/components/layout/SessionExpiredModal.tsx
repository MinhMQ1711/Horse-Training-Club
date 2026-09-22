import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Field } from "@/shared/components/form/Field";
import { Input } from "@/shared/components/form/Input";
import { useAuth } from "./AuthProvider";
import { Button } from "@/shared/components/ui/Button";
import { Modal } from "@/shared/components/ui/Modal";
import { loginFailure, messageFor } from "@/shared/lib/messages";

// Design 1.14: hộp thoại KHÔNG có nút đóng — bắt buộc chọn "đăng nhập lại" hoặc "rời đi".
export function SessionExpiredModal() {
  const { user, signIn, signOut } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onContinue(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!password) {
      setError("Password is required.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await signIn(user.email, password, true); // thành công => AuthProvider tự đóng hộp thoại
    } catch (err) {
      setError(loginFailure(err).alert.body || messageFor(err));
    } finally {
      setBusy(false);
    }
  }

  async function onLeave() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <Modal title="The session has expired" subtitle="Signed out after 30 minutes without activity." tone="warn" width={430}>
      <form onSubmit={onContinue} noValidate style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <p style={{ margin: 0 }}>
          Work typed into this form is kept in the browser and restored after signing in again. Nothing was sent to the server.
        </p>
        <Field label={`Password for ${user?.email ?? "your account"}`} required error={error}>
          <Input
            type="password"
            icon="key"
            placeholder="Enter password to continue"
            autoComplete="current-password"
            value={password}
            disabled={busy}
            data-autofocus
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
          />
        </Field>
        <div style={{ display: "flex", gap: 9 }}>
          <Button type="submit" iconAfter="arrowRight" disabled={busy}>
            {busy ? "Signing in…" : "Sign in and continue"}
          </Button>
          <Button tone="secondary" onClick={onLeave} disabled={busy}>
            Leave and discard
          </Button>
        </div>
      </form>
    </Modal>
  );
}
