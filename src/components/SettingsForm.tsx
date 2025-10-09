'use client';

import { useEffect, useState } from 'react';

type FormState = {
  handle: string;
  apa: string;
  fargo: string;
  napa: string;
  cue: string;
  location: string;
  poolroomAlias: string;
  cashapp: string;
  venmo: string;
  bio: string;
};

const EMPTY: FormState = {
  handle: '',
  apa: '',
  fargo: '',
  napa: '',
  cue: '',
  location: '',
  poolroomAlias: '',
  cashapp: '',
  venmo: '',
  bio: '',
};

export default function SettingsForm() {
  const [state, setState] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Load from server
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/profile', { method: 'GET' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const p = data?.profile ?? {};
        const u = data?.user ?? {};
        const next: FormState = {
          handle: (u?.handle as string | null) ?? '',
          apa: p?.apa != null ? String(p.apa) : '',
          fargo: p?.fargo != null ? String(p.fargo) : '',
          napa: p?.napa != null ? String(p.napa) : '',
          cue: p?.cue ?? '',
          location: p?.location ?? '',
          poolroomAlias: p?.poolroomAlias ?? '',
          cashapp: p?.cashapp ?? '',
          venmo: p?.venmo ?? '',
          bio: p?.bio ?? '',
        };
        if (mounted) setState(next);
      } catch {
        if (mounted) setError('Could not load your profile. Please refresh.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  function onChange<K extends keyof FormState>(key: K, val: string) {
    setState((s) => ({ ...s, [key]: val }));
    setSaved('');
    setError('');
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved('');
    setError('');
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      setSaved('Saved ✔');
    } catch (e: any) {
      setError(e?.message || 'Save failed. Please try again.');
    }
  }

  if (loading) return <p className="text-gray-600">Loading…</p>;

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
      {error ? <div className="text-red-600 text-sm">{error}</div> : null}
      {saved ? <div className="text-green-700 text-sm">{saved}</div> : null}

      {/* Handle */}
      <label className="block">
        <div className="text-sm font-medium mb-1">Handle</div>
        <input
          value={state.handle}
          onChange={(e) => onChange('handle', e.target.value.toLowerCase())}
          className="w-full rounded border px-3 py-2"
          placeholder="e.g., dean"
        />
        <div className="text-xs text-gray-500 mt-1">
          3–20 chars: a–z, 0–9, dot (.), underscore (_), hyphen (-). Your profile URL becomes /profile/yourhandle
        </div>
      </label>

      {/* Ratings row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="block">
          <div className="text-sm font-medium mb-1">APA</div>
          <input
            inputMode="numeric"
            value={state.apa}
            onChange={(e) => onChange('apa', e.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="e.g., 5"
          />
        </label>
        <label className="block">
          <div className="text-sm font-medium mb-1">Fargo</div>
          <input
            inputMode="numeric"
            value={state.fargo}
            onChange={(e) => onChange('fargo', e.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="e.g., 520"
          />
        </label>
        <label className="block">
          <div className="text-sm font-medium mb-1">NAPA</div>
          <input
            inputMode="numeric"
            value={state.napa}
            onChange={(e) => onChange('napa', e.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="e.g., 80"
          />
        </label>
      </div>

      <label className="block">
        <div className="text-sm font-medium mb-1">Cue</div>
        <input
          value={state.cue}
          onChange={(e) => onChange('cue', e.target.value)}
          className="w-full rounded border px-3 py-2"
          placeholder="e.g., Predator, Mezz"
        />
      </label>

      <label className="block">
        <div className="text-sm font-medium mb-1">Location</div>
        <input
          value={state.location}
          onChange={(e) => onChange('location', e.target.value)}
          className="w-full rounded border px-3 py-2"
          placeholder="City, State"
        />
      </label>

      <label className="block">
        <div className="text-sm font-medium mb-1">Poolroom Alias</div>
        <input
          value={state.poolroomAlias}
          onChange={(e) => onChange('poolroomAlias', e.target.value)}
          className="w-full rounded border px-3 py-2"
          placeholder="e.g., The Hub, Side Pocket"
        />
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <div className="text-sm font-medium mb-1">Cash App (handle)</div>
          <input
            value={state.cashapp}
            onChange={(e) => onChange('cashapp', e.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="$yourname"
          />
        </label>
        <label className="block">
          <div className="text-sm font-medium mb-1">Venmo (handle)</div>
          <input
            value={state.venmo}
            onChange={(e) => onChange('venmo', e.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="@yourname"
          />
        </label>
      </div>

      <label className="block">
        <div className="text-sm font-medium mb-1">Bio</div>
        <textarea
          value={state.bio}
          onChange={(e) => onChange('bio', e.target.value)}
          className="w-full rounded border px-3 py-2"
          rows={4}
          placeholder="Tell people about your game, favorite rooms, achievements…"
        />
      </label>

      <div className="flex items-center gap-3">
        <button type="submit" className="px-4 py-2 rounded border">Save</button>
      </div>
    </form>
  );
}
