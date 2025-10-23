"use client";

export type EditableStream = {
  id: string;
  title: string;
  hls_url: string;
  is_live: boolean;
  order_index: number;
};

export default function StreamsAdmin({
  eventId,
  streams,
}: {
  eventId: string;
  streams: EditableStream[];
}) {
  return (
    <div className="space-y-6">
      {/* Existing streams */}
      <div className="rounded-2xl border p-4">
        <h3 className="font-semibold mb-3">Streams</h3>
        {streams.length === 0 ? (
          <p className="text-sm text-gray-600">No streams yet.</p>
        ) : (
          <div className="space-y-3">
            {streams.map((s) => (
              <div key={s.id} className="rounded-xl border p-3">
                <form
                  action={`/api/events/${eventId}/streams/upsert`}
                  method="post"
                  className="grid md:grid-cols-12 gap-3 items-end"
                >
                  <input type="hidden" name="stream_id" value={s.id} />
                  <label className="flex flex-col gap-1 md:col-span-3">
                    <span className="text-xs text-gray-600">Title</span>
                    <input
                      name="title"
                      defaultValue={s.title}
                      className="border rounded-xl px-3 py-2"
                      placeholder="Table 1"
                    />
                  </label>
                  <label className="flex flex-col gap-1 md:col-span-6">
                    <span className="text-xs text-gray-600">HLS URL (.m3u8)</span>
                    <input
                      name="hls_url"
                      defaultValue={s.hls_url}
                      className="border rounded-xl px-3 py-2"
                      placeholder="https://...m3u8"
                    />
                  </label>
                  <label className="flex items-center gap-2 md:col-span-1">
                    <input type="checkbox" name="is_live" defaultChecked={s.is_live} />
                    <span className="text-sm">Live</span>
                  </label>
                  <label className="flex flex-col gap-1 md:col-span-1">
                    <span className="text-xs text-gray-600">Order</span>
                    <input
                      type="number"
                      name="order_index"
                      defaultValue={s.order_index ?? 0}
                      className="border rounded-xl px-3 py-2 w-24"
                    />
                  </label>
                  <div className="flex gap-2 md:col-span-1">
                    <button
                      type="submit"
                      className="px-3 py-2 rounded-xl bg-black text-white text-sm"
                      title="Save changes"
                    >
                      Save
                    </button>
                    <form
                      action={`/api/streams/${s.id}/delete`}
                      method="post"
                      onSubmit={(e) => {
                        if (!confirm("Delete this stream?")) e.preventDefault();
                      }}
                    >
                      <button
                        type="submit"
                        className="px-3 py-2 rounded-xl border text-sm"
                        title="Delete stream"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add new stream */}
      <div className="rounded-2xl border p-4">
        <h3 className="font-semibold mb-3">Add stream</h3>
        <form
          action={`/api/events/${eventId}/streams/upsert`}
          method="post"
          className="grid md:grid-cols-12 gap-3 items-end"
        >
          <label className="flex flex-col gap-1 md:col-span-3">
            <span className="text-xs text-gray-600">Title</span>
            <input name="title" className="border rounded-xl px-3 py-2" placeholder="Table 1" />
          </label>
          <label className="flex flex-col gap-1 md:col-span-6">
            <span className="text-xs text-gray-600">HLS URL (.m3u8)</span>
            <input
              name="hls_url"
              className="border rounded-xl px-3 py-2"
              placeholder="https://...m3u8"
              required
            />
          </label>
          <label className="flex items-center gap-2 md:col-span-1">
            <input type="checkbox" name="is_live" />
            <span className="text-sm">Live</span>
          </label>
          <label className="flex flex-col gap-1 md:col-span-1">
            <span className="text-xs text-gray-600">Order</span>
            <input
              type="number"
              name="order_index"
              defaultValue={0}
              className="border rounded-xl px-3 py-2 w-24"
            />
          </label>
          <div className="md:col-span-1">
            <button type="submit" className="px-3 py-2 rounded-xl bg-black text-white text-sm">
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
