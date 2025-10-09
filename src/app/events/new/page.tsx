import RequireAuth from "@/components/RequireAuth";
import EventForm from "@/components/EventForm";

export default function NewEventPage() {
  return (
    <main className="min-h-screen p-8 space-y-6">
      <h1 className="text-3xl font-bold">Create Event</h1>
      <RequireAuth>
        <EventForm />
      </RequireAuth>
    </main>
  );
}
