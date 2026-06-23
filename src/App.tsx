import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { episodeByNumber, firstItem, itemById, nextItem } from "./watchOrder";
import { watchText } from "./display";

type Progress = {
  current_item_id: string | null;
  previous_item_id: string | null;
};

type ConfirmAction = "reset" | "set" | null;

const table = "one_piece_progress";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [progress, setProgress] = useState<Progress | null | undefined>(undefined);
  const [setupEpisode, setSetupEpisode] = useState("");
  const [manualEpisode, setManualEpisode] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const [invalidSetup, setInvalidSetup] = useState(false);
  const [invalidManual, setInvalidManual] = useState(false);

  const currentItem = useMemo(
    () => itemById(progress?.current_item_id ?? null),
    [progress?.current_item_id],
  );

  useEffect(() => {
    if (!supabase) {
      console.error("Missing Supabase environment variables");
      return;
    }

    supabase.auth.getSession().then(({ data, error: authError }) => {
      if (authError) {
        console.error(authError);
        setError(true);
        return;
      }
      setSession(data.session);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setProgress(undefined);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setProgress(undefined);
      return;
    }
    loadProgress(session.user.id);
  }, [session]);

  async function loadProgress(userId: string) {
    if (!supabase) return;
    const { data, error: loadError } = await supabase
      .from(table)
      .select("current_item_id, previous_item_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (loadError) {
      console.error(loadError);
      setError(true);
      return;
    }

    setProgress(data ?? null);
  }

  async function saveProgress(nextProgress: Progress) {
    if (!supabase || !session) return false;
    setSaving(true);
    const { error: saveError } = await supabase.from(table).upsert({
      user_id: session.user.id,
      ...nextProgress,
    });
    setSaving(false);

    if (saveError) {
      console.error(saveError);
      setError(true);
      return false;
    }

    setProgress(nextProgress);
    return true;
  }

  async function signIn() {
    if (!supabase) {
      console.error("Missing Supabase environment variables");
      setError(true);
      return;
    }
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}${window.location.pathname}` },
    });
    if (signInError) {
      console.error(signInError);
      setError(true);
    }
  }

  async function signOut() {
    if (!supabase) return;
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error(signOutError);
      setError(true);
    }
  }

  async function markWatched() {
    if (!currentItem || saving) return;
    const next = nextItem(currentItem.id);
    await saveProgress({
      current_item_id: next?.id ?? null,
      previous_item_id: currentItem.id,
    });
  }

  async function undo() {
    if (!progress?.previous_item_id || saving) return;
    await saveProgress({
      current_item_id: progress.previous_item_id,
      previous_item_id: null,
    });
  }

  async function setup(event: React.FormEvent) {
    event.preventDefault();
    const item = parseEpisode(setupEpisode);
    if (!item) {
      setInvalidSetup(true);
      return;
    }
    setInvalidSetup(false);
    await saveProgress({ current_item_id: item.id, previous_item_id: null });
  }

  async function confirm() {
    if (confirmAction === "reset") {
      const first = firstItem();
      await saveProgress({ current_item_id: first?.id ?? null, previous_item_id: null });
      setSettingsOpen(false);
    }

    if (confirmAction === "set") {
      const item = parseEpisode(manualEpisode);
      if (!item) {
        setInvalidManual(true);
        setConfirmAction(null);
        return;
      }
      setInvalidManual(false);
      await saveProgress({ current_item_id: item.id, previous_item_id: null });
      setSettingsOpen(false);
    }

    setConfirmAction(null);
  }

  function parseEpisode(value: string) {
    if (!/^[1-9]\d*$/.test(value.trim())) return null;
    return episodeByNumber(Number(value));
  }

  if (error) return <Shell>Something went wrong</Shell>;

  if (!session) {
    return (
      <Shell>
        <button className="rounded border border-zinc-700 px-4 py-2" onClick={signIn}>
          Sign in with Google
        </button>
      </Shell>
    );
  }

  if (progress === undefined) return <Shell>Loading...</Shell>;

  if (progress === null) {
    return (
      <Shell>
        <form className="flex w-full max-w-xs flex-col gap-3" onSubmit={setup}>
          <label className="text-sm text-zinc-300" htmlFor="setup-episode">
            What episode do you want to watch next?
          </label>
          <input
            id="setup-episode"
            className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2"
            inputMode="numeric"
            value={setupEpisode}
            onChange={(event) => {
              setSetupEpisode(event.target.value);
              setInvalidSetup(false);
            }}
          />
          {invalidSetup ? <div className="text-sm text-zinc-400">Invalid episode</div> : null}
          <button className="rounded bg-zinc-100 px-4 py-2 text-zinc-950" disabled={saving}>
            Set
          </button>
        </form>
      </Shell>
    );
  }

  return (
    <Shell>
      <button
        className="absolute right-4 top-4 rounded px-2 py-1 text-sm text-zinc-500"
        aria-label="Settings"
        onClick={() => setSettingsOpen(true)}
      >
        ...
      </button>

      {currentItem ? (
        <div className="flex items-center gap-3 text-xl">
          <span>{watchText(currentItem)}</span>
          <input
            className="h-5 w-5 cursor-pointer accent-zinc-100 disabled:cursor-not-allowed"
            type="checkbox"
            checked={false}
            disabled={saving}
            onChange={markWatched}
            aria-label="Watched"
          />
        </div>
      ) : (
        <div className="text-xl">Complete</div>
      )}

      {progress.previous_item_id ? (
        <button className="mt-5 text-sm text-zinc-400" disabled={saving} onClick={undo}>
          Undo
        </button>
      ) : null}

      {settingsOpen ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4">
          <div className="flex w-full max-w-sm flex-col gap-3 rounded border border-zinc-800 bg-zinc-950 p-4">
            <button className="self-end text-sm text-zinc-500" onClick={() => setSettingsOpen(false)}>
              Close
            </button>
            <input
              className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2"
              inputMode="numeric"
              value={manualEpisode}
              onChange={(event) => {
                setManualEpisode(event.target.value);
                setInvalidManual(false);
              }}
              aria-label="Current episode"
            />
            {invalidManual ? <div className="text-sm text-zinc-400">Invalid episode</div> : null}
            <button
              className="rounded border border-zinc-700 px-4 py-2"
              onClick={() => setConfirmAction("set")}
            >
              Set current item
            </button>
            <button
              className="rounded border border-zinc-700 px-4 py-2"
              onClick={() => setConfirmAction("reset")}
            >
              Reset
            </button>
            <button className="rounded border border-zinc-700 px-4 py-2" onClick={signOut}>
              Sign out
            </button>
          </div>
        </div>
      ) : null}

      {confirmAction ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4">
          <div className="flex w-full max-w-xs flex-col gap-4 rounded border border-zinc-800 bg-zinc-950 p-4">
            <div>{confirmAction === "reset" ? "Reset progress?" : "Set current item?"}</div>
            <div className="flex justify-end gap-2">
              <button className="rounded border border-zinc-700 px-3 py-2" onClick={() => setConfirmAction(null)}>
                Cancel
              </button>
              <button className="rounded bg-zinc-100 px-3 py-2 text-zinc-950" disabled={saving} onClick={confirm}>
                {confirmAction === "reset" ? "Reset" : "Set"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <header className="absolute left-4 top-4 text-sm text-zinc-500">NextForOnePiece</header>
      {children}
    </main>
  );
}
