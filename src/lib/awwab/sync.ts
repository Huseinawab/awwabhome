// Account sync: mirrors the local AppState to the signed-in user's row. Browser-only.
import { useEffect, useSyncExternalStore } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getState, onCommit, replaceState } from "./store";

let user: User | null = null;
let ready = false;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

let timer: ReturnType<typeof setTimeout> | null = null;
async function push() {
  if (!user) return;
  const { error } = await supabase.from("user_state").upsert({ user_id: user.id, data: getState() as never, updated_at: new Date().toISOString() });
  if (error) console.error("Saving progress failed", error);
}
const schedule = () => {
  if (!user) return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(push, 800);
};

async function pullOrSeed(u: User) {
  const { data, error } = await supabase.from("user_state").select("data").eq("user_id", u.id).maybeSingle();
  if (error) { console.error("Loading progress failed", error); return; }
  const remote = data?.data as Record<string, unknown> | undefined;
  if (remote && Object.keys(remote).length) replaceState(remote);
  else await push(); // first sign-in: keep what this device already has
}

let started = false;
export function startSync() {
  if (started || typeof window === "undefined") return;
  started = true;
  onCommit(schedule);
  supabase.auth.onAuthStateChange((event, session) => {
    const next = session?.user ?? null;
    const changed = next?.id !== user?.id;
    user = next;
    ready = true;
    if (next && changed) void pullOrSeed(next);
    if (event === "SIGNED_OUT") replaceState({});
    emit();
  });
}

export function useAuthUser() {
  useEffect(startSync, []);
  return useSyncExternalStore(
    (f) => { subs.add(f); return () => subs.delete(f); },
    () => (ready ? user : undefined),
    () => undefined,
  );
}
