import { Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useT } from "@/lib/awwab/i18n";
import { useAuthUser } from "@/lib/awwab/sync";

export function AuthForm({ onDone }: { onDone?: () => void }) {
  const t = useT();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (password.length < 6) return setMsg(t("auth.pwShort"));
    setBusy(true);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/settings" } });
      setBusy(false);
      if (error) return setMsg(error.message);
      if (!data.session) { setMode("login"); return setMsg(t("auth.checkEmail")); }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return setMsg(error.message);
    }
    onDone?.();
  };

  const google = async () => {
    setMsg(null);
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/settings" });
    if (r.error) return setMsg(r.error.message);
    if (!r.redirected) onDone?.();
  };

  return (
    <div className="space-y-4">
      <button type="button" className="btn btn-soft w-full justify-center" onClick={google}>{t("auth.google")}</button>
      <p className="text-center text-xs text-muted-foreground">{t("auth.or")}</p>
      <form onSubmit={submit} className="space-y-3">
        <label className="block"><span className="mb-1 block text-sm font-bold">{t("auth.email")}</span>
          <input className="field" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label className="block"><span className="mb-1 block text-sm font-bold">{t("auth.password")}</span>
          <input className="field" type="password" required autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        {msg && <p className="text-sm text-muted-foreground" role="status">{msg}</p>}
        <button className="btn btn-primary w-full justify-center" disabled={busy}>{busy ? t("auth.busy") : mode === "login" ? t("auth.login") : t("auth.signup")}</button>
      </form>
      <button type="button" className="btn btn-ghost w-full justify-center text-sm" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMsg(null); }}>
        {mode === "login" ? t("auth.toSignup") : t("auth.toLogin")}
      </button>
    </div>
  );
}

export function AccountCard() {
  const t = useT();
  const user = useAuthUser();
  if (user === undefined) return null;
  return (
    <section className="surface p-5">
      <h2 className="text-h3">{t("auth.title")}</h2>
      {user ? (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">{t("auth.signedInAs", { e: user.email ?? "" })}</p>
            <p className="text-sm text-muted-foreground">{t("auth.synced")}</p>
          </div>
          <button className="btn btn-soft" onClick={() => supabase.auth.signOut()}>{t("auth.logout")}</button>
        </div>
      ) : (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{t("auth.guest")}</p>
          <Link to="/auth" className="btn btn-primary">{t("auth.login")} / {t("auth.signup")}</Link>
        </div>
      )}
    </section>
  );
}
