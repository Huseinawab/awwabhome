import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthForm } from "@/components/awwab/Account";
import { PageHeader } from "@/components/awwab/ui";
import { useT } from "@/lib/awwab/i18n";
import { useAuthUser } from "@/lib/awwab/sync";
import { meta } from "@/lib/awwab/useToday";

export const Route = createFileRoute("/auth")({
  head: () => meta("Log in — AWWAB", "Sign in or create an account to save your progress."),
  component: AuthPage,
});

function AuthPage() {
  const t = useT();
  const user = useAuthUser();
  const navigate = useNavigate();
  useEffect(() => { if (user) navigate({ to: "/settings", replace: true }); }, [user, navigate]);
  return (
    <div className="mx-auto max-w-md">
      <PageHeader eyebrow={t("auth.title")} title={t("auth.login")} subtitle={t("auth.sub")} />
      <div className="surface p-6"><AuthForm /></div>
    </div>
  );
}
