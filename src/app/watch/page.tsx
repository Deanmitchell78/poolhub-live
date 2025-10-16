import HlsPlayer from "../../components/HlsPlayer";

export default function WatchPage({ searchParams }: { searchParams: { url?: string; src?: string } }) {
  const src = searchParams?.url ?? searchParams?.src ?? "";
  return (
    <main className="min-h-dvh p-6 flex flex-col items-center gap-6">
      <h1 className="text-2xl font-bold">PoolHub Live — Watch</h1>
      {src ? (
        <HlsPlayer src={src} />
      ) : (
        <div className="max-w-xl text-center text-sm text-gray-600">
          <p className="mb-2">Add your HLS URL as <code>?url=</code> (or <code>?src=</code>).</p>
          <code className="break-all text-xs bg-gray-100 px-2 py-1 rounded">
            /watch?url=https%3A%2F%2Fvideodelivery.net%2FYOUR_PLAYBACK_ID%2Fmanifest%2Fvideo.m3u8
          </code>
        </div>
      )}
    </main>
  );
}
