'use client';

import { useEffect, useState } from 'react';

type Settings = {
  apa?: string;
  fargo?: string;
  napa?: string;
  cue?: string;
  location?: string;
  poolroomAlias?: string;
  cashapp?: string;
  venmo?: string;
  bio?: string;
};

export default function ProfilePreview() {
  const [data, setData] = useState<Settings | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('ph.settings');
      if (raw) setData(JSON.parse(raw));
    } catch {}
  }, []);

  if (!data) {
    return (
      <div className="border rounded-lg p-4 text-sm text-gray-600">
        Preview (this device): No saved settings yet.
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="text-sm text-gray-500 mb-1">Preview (this device only)</div>
      <div className="grid grid-cols-2 gap-3">
        {data.apa ? <div><strong>APA:</strong> {data.apa}</div> : null}
        {data.fargo ? <div><strong>Fargo:</strong> {data.fargo}</div> : null}
        {data.napa ? <div><strong>NAPA:</strong> {data.napa}</div> : null}
        {data.cue ? <div><strong>Cue:</strong> {data.cue}</div> : null}
        {data.location ? <div><strong>Location:</strong> {data.location}</div> : null}
        {data.poolroomAlias ? <div><strong>Poolroom Alias:</strong> {data.poolroomAlias}</div> : null}
        {data.cashapp ? <div><strong>Cash App:</strong> {data.cashapp}</div> : null}
        {data.venmo ? <div><strong>Venmo:</strong> {data.venmo}</div> : null}
      </div>
      {data.bio ? (
        <div className="pt-2">
          <strong>Bio:</strong>
          <p className="text-gray-700">{data.bio}</p>
        </div>
      ) : null}
    </div>
  );
}
