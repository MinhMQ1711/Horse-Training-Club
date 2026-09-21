import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Field } from "@/shared/components/form/Field";
import { Input } from "@/shared/components/form/Input";
import { Checkbox } from "@/shared/components/form/Checkbox";
import { useAuth } from "@/shared/components/layout/AuthProvider";
import { AuthLayout } from "@/shared/components/layout/AuthLayout";
import { Alert } from "@/shared/components/ui/Alert";
import type { AlertTone } from "@/shared/components/ui/Alert";
import { Button } from "@/shared/components/ui/Button";
import { useQueryParams } from "@/shared/lib/hooks";
import { loginFailure } from "@/shared/lib/messages";
import { safeNext } from "../flow";
import styles from "./AuthPages.module.css";

// Ở chế độ mock, điền sẵn email demo giống design (0.1). Backend thật thì để trống.
const DEMO_EMAIL = import.meta.env.VITE_USE_MOCK === "true" ? "nam.tran@equiflow.vn" : "";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RETRY_AFTER_MS = 10_000;

interface AlertState {
  tone: AlertTone;
  icon: string;
  title: string;
  body: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { status, signIn } = useAuth();
  const params = useQueryParams();

  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [checking, setChecking] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [blockedReason, setBlockedReason] = useState<string | undefined>();
  const [footNote, setFootNote] = useState<string | undefined>();
  const retryTimer = useRef<number | undefined>(undefined);

  const next = safeNext(params?.get("next"));
  const justReset = params?.get("reset") === "1";

  // Đã đăng nhập rồi mà vào /login thì đưa thẳng vào app.
  useEffect(() => {
    if (status === "authenticated" && params) navigate(next, { replace: true });
  }, [status, params, next, navigate]);

  useEffect(() => () => window.clearTimeout(retryTimer.current), []);

  // Sửa email/mật khẩu => thoát trạng thái bị chặn của lần thử trước.
  function clearOutcome() {
    setBlockedReason(undefined);
    setFootNote(undefined);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (checking) return;

    const mail = email.trim().toLowerCase();
    let eErr = "";
    let pErr = "";
    if (!mail) eErr = "Club email is required.";
    else if (!EMAIL_RE.test(mail)) eErr = "Email must look like name@equiflow.vn.";
    if (!password) pErr = "Password is required.";
    else if (password.length < 6) pErr = "Password must be at least 6 characters.";

    if (eErr || pErr) {
      setEmailError(eErr);
      setPasswordError(pErr);
      setAlert({ tone: "danger", icon: "alert", title: "Sign-in request not sent", body: "Check the marked fields below." });
      return;
    }

    setEmailError("");
    setPasswordError("");
    clearOutcome();
    setChecking(true);
    setAlert({ tone: "info", icon: "clock", title: "Signing in", body: "Checking the credentials and the permissions granted to this account." });
    // Sau 10 giây nút trả lại để có thể thử lại (design 0.2).
    retryTimer.current = window.setTimeout(() => setChecking(false), RETRY_AFTER_MS);

    try {
      await signIn(mail, password, remember);
      window.clearTimeout(retryTimer.current);
      setAlert({ tone: "ok", icon: "checkCircle", title: "Signed in", body: "Opening your workspace." });
      navigate(next, { replace: true });
    } catch (err) {
      window.clearTimeout(retryTimer.current);
      const failure = loginFailure(err);
      setAlert(failure.alert);
      setPasswordError(failure.passwordError ?? "");
      setBlockedReason(failure.blockedReason);
      setFootNote(failure.footNote);
      setChecking(false);
    }
  }

  const banner: AlertState | null = alert ?? (justReset
    ? { tone: "ok", icon: "checkCircle", title: "Password saved", body: "All other sessions were signed out. Sign in with the new password." }
    : null);

  return (
    <AuthLayout title="Sign in to start your shift." description="Use the club account you were issued. Each role sees only the work it is granted.">
      <form onSubmit={onSubmit} noValidate style={{ display: "contents" }}>
        {banner && (
          <Alert tone={banner.tone} icon={banner.icon} title={banner.title}>
            {banner.body}
          </Alert>
        )}

        <Field label="Club email" required error={emailError}>
          <Input
            type="email"
            icon="mail"
            placeholder="name@equiflow.vn"
            autoComplete="username"
            value={email}
            disabled={checking}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError("");
              clearOutcome();
            }}
          />
        </Field>

        <Field label="Password" required error={passwordError}>
          <Input
            type="password"
            icon="key"
            placeholder="Enter password"
            autoComplete="current-password"
            value={password}
            disabled={checking}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError("");
              clearOutcome();
            }}
          />
        </Field>

        <div className={styles.row}>
          <Checkbox label="Keep me signed in" checked={remember} onChange={setRemember} disabled={checking} />
          <Link to="/forgot-password">Forgot password?</Link>
        </div>

        <Button type="submit" size="lg" block iconAfter="arrowRight" disabled={checking} blockedReason={blockedReason}>
          {checking ? "Signing in…" : "Enter workspace"}
        </Button>

        <div className={styles.divider} aria-hidden="true">
          <span>OR</span>
        </div>
        <p className={styles.foot}>
          {footNote ?? (
            <>
              No account yet? <Link to="/sign-up">Sign up and wait for Club Manager approval</Link>
            </>
          )}
        </p>
      </form>
    </AuthLayout>
  );
}
