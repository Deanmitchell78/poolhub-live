import CopyField from "@/components/CopyField"; // keep for Larix helper
import { upsertStream, getStreamByEvent } from "../../streams";

const CF_ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID!;
const CF_TOKEN = process.env.CLOUDFLARE_API_TOKEN!;
const CF_API = CF_ACCOUNT
  ? `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/stream/live_inputs`
  : null;

// ---- Types (to avoid `any`) ----
const STATUSES = ["idle", "live", "ended", "error"] as const;
type Status = (typeof STATUSES)[number];

type StreamRecord = {
  title: string | null;
  playback_url: string | null;
  rtmp_url: string | null;
  stream_key: string | null;
  status: Status | null;
};

type UpsertInput = {
  eventId: string;
  title?: string;
  playbackUrl?: string;
  rtmpUrl?: string;
  streamKey?: string;
  status?: Status;
};

type CFResp = {
  result?: {
    playback?: { hls?: string | null } | null;
    webRtc?: { playback?: { hls?: string | null } | null } | null;
    rtmp?: { url?: string | null; streamKey?: string | null } | null;
  };
  errors?: Array<{ message?: string }>;
};

export const dynamic = "force-dynamic";

export default async function ManageStream(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params; // Next 15: await params
  const stream = (await getStreamByEvent(id)) as (StreamRecord & { title: string | null }) | null;

  async function save(formData: FormData): Promise<void> {
    "use server";
    const statusRaw = String(formData.get("status") ?? "idle");
    const status: Status = (STATUSES as readonly string[]).includes(statusRaw)
      ? (statusRaw as Status)
      : "idle";

    const payload: UpsertInput = {
      eventId: id,
      title: stream?.title ?? "PoolHub Stream",
      playbackUrl: String(formData.get("playbackUrl") ?? "").trim() || undefined,
      rtmpUrl: String(formData.get("rtmpUrl") ?? "").trim() || undefined,
      streamKey: String(formData.get("streamKey") ?? "").trim() || undefined,
      status,
    };

    await upsertStream(payload);
  }

  async function createIngestAction(): Promise<void> {
    "use server";
    if (!CF_API || !CF_TOKEN) {
      throw new Error(
        "Cloudflare env vars missing. Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in .env / Vercel, then redeploy."
      );
    }

    const resp = await fetch(CF_API, {
      method: "POST",
      headers: { Authorization: `Bearer ${CF_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        meta: { name: `poolhub-${id}` },
        recording: { mode: "automatic" },
      }),
      cache: "no-store",
    });

    const json = (await resp.json()) as unknown as CFResp;
    if (!resp.ok) {
      const msg = json?.errors?.[0]?.message || "Unknown Cloudflare error";
      throw new Error("Cloudflare error: " + msg);
    }

    const liveInput = json.result;
    await upsertStream({
      eventId: id,
      title: "PoolHub Stream",
      playbackUrl:
        liveInput?.playback?.hls ??
        liveInput?.webRtc?.playback?.hls ??
        undefined,
      rtmpUrl: liveInput?.rtmp?.url ?? undefined,
      streamKey: liveInput?.rtmp?.streamKey ?? undefined,
      status: "idle",
    });
  }

  const larixSingleField =
    stream?.rtmp_url && stream?.stream_key
      ? `${stream.rtmp_url.replace(/\/$/, "")}/${stream.stream_key}`
      : "";

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Manage Stream</h1>

      {/* Status banner */}
      {!stream?.rtmp_url || !stream?.stream_key ? (
        <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 p-3 rounded">
          No ingest yet — click <span className="font-semibold">Create Ingest</span> to get RTMP + Key,
          or paste yours below and Save.
        </div>
      ) : !stream?.playback_url ? (
        <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 p-3 rounded">
          Ingest ready — start streaming, then paste the <span className="font-semibold">Playback HLS</span> URL
          and set status to <span className="font-semibold">live</span>.
        </div>
      ) : (
        <div className="bg-green-500/10 border border-green-500/30 text-green-300 p-3 rounded">
          All set — playback URL present. Set status to <span className="font-semibold">live</span> when ready.
        </div>
      )}

      {/* Editable credentials form */}
      <form action={save} className="space-y-3 bg-white/5 p-4 rounded">
        <label className="block">
          <div className="text-sm opacity-80 mb-1">RTMP Ingest (server)</div>
          <input
            name="rtmpUrl"
            defaultValue={stream?.rtmp_url ?? ""}
            placeholder="rtmp://live.cloudflare.com/live"
            className="w-full bg-black/30 p-2 rounded"
          />
        </label>

        <label className="block">
          <div className="text-sm opacity-80 mb-1">Stream Key</div>
          <input
            name="streamKey"
            defaultValue={stream?.stream_key ?? ""}
            placeholder="paste your stream key here"
            className="w-full bg-black/30 p-2 rounded"
          />
        </label>

        <label className="block">
          <div className="text-sm opacity-80 mb-1">Playback HLS URL (.m3u8)</div>
          <input
            name="playbackUrl"
            defaultValue={stream?.playback_url ?? ""}
            placeholder="https://.../manifest/video.m3u8"
            className="w-full bg-black/30 p-2 rounded"
          />
        </label>

        <label className="block mb-2">
          <div className="text-sm opacity-80">Status</div>
          <select name="status" defaultValue={stream?.status ?? "idle"} className="w-full bg-black/30 p-2 rounded">
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>

        <button className="bg-white/10 px-4 py-2 rounded">Save</button>
      </form>

      {/* Helper: Larix one-field (read-only copy) */}
      <div className="bg-white/5 p-4 rounded">
        <CopyField
          label="Larix one-field URL (use this if Larix wants only one box)"
          name="larix"
          value={larixSingleField}
        />
        <p className="text-xs opacity-70 mt-2">
          In Larix: if it shows only one field, use this. If it shows two, put the server and key separately from the fields above.
        </p>
      </div>

      {/* Create ingest */}
      <form action={createIngestAction} className="bg-white/5 p-4 rounded">
        <div className="text-sm opacity-80 mb-2">Don’t have credentials yet?</div>
        <button className="bg-white/10 px-4 py-2 rounded">Create Ingest (Cloudflare)</button>
        <p className="opacity-70 text-sm mt-2">
          Click to generate an RTMP URL + Stream Key and (usually) an HLS playback URL.
        </p>
      </form>
    </main>
  );
}
