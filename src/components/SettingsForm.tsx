'use client';

import { useEffect, useState } from 'react';

type FormState = {
  apa: string;
  fargo: string;
  napa: string;          // <-- new
  cue: string;
  location: string;
  poolroomAlias: string; // <-- new
  cashapp: string;
  venmo: string;
  bio: string;
};

const DEFAULTS: FormState = {
  apa: '',
  fargo: '',
  napa: '',              // <-- new
  cue: '',
  location: '',
  poolroomAlias: '',     // <-- new
  cashapp: '',
  venmo: '',
  bio: '',
};

const STORAGE_KEY = 'ph.settings';

export default function SettingsForm() {
  const [state, setState] = useState<FormState>(DEFAULTS);
  const [saved, setSaved] = useState<string>('');

  // Load from this device
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {}
  }, []);

  function onChange<K extends keyof FormState>(key: K, val: string) {
    setState((s) => ({ ...s, [key]: val }));
    setSaved('');
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setSaved('Saved on this device ✔');
  }

  function onReset() {
    setState(DEFAULTS);
    localStorage.removeItem(STORAGE_KEY);
    setSaved('Cleared ✔');
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
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
        <button type="button" onClick={onReset} className="px-4 py-2 rounded border">Reset</button>
        <span className="text-sm text-green-700">{saved}</span>
      </div>

      <p className="text-xs text-gray-500">
        Note: Saved to this device only for now (no server yet).
      </p>
    </form>
  );
}
