import { createEvent } from "../actions";

export default function NewEventPage() {
  // Wrap createEvent so the form action returns void
  async function handleCreate(formData: FormData): Promise<void> {
    "use server";
    await createEvent(formData); // ignore returned object to satisfy Next's type
  }

  return (
    <main className="mx-auto max-w-2xl p-8 space-y-6">
      <h1 className="text-3xl font-bold">Create Event</h1>

      <form action={handleCreate} className="space-y-4">
        <div>
          <label className="block text-sm opacity-80 mb-1">Title *</label>
          <input
            name="title"
            className="w-full rounded-lg bg-white/5 border border-white/10 p-3"
            placeholder="Friday Night 9-Ball"
            required
          />
        </div>

        <div>
          <label className="block text-sm opacity-80 mb-1">Starts At (local) *</label>
          <input
            type="datetime-local"
            name="startsAt"
            className="w-full rounded-lg bg-white/5 border border-white/10 p-3"
            required
          />
        </div>

        <div>
          <label className="block text-sm opacity-80 mb-1">Location</label>
          <input
            name="location"
            className="w-full rounded-lg bg-white/5 border border-white/10 p-3"
            placeholder="Seagrove Billiards"
          />
        </div>

        <div>
          <label className="block text-sm opacity-80 mb-1">Description</label>
          <textarea
            name="description"
            className="w-full rounded-lg bg-white/5 border border-white/10 p-3"
            rows={4}
            placeholder="Live action stream. Race to 9."
          />
        </div>

        <button className="rounded-xl px-4 py-2 bg-white text-black font-semibold">
          Save Event
        </button>
      </form>
    </main>
  );
}
