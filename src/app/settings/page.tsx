import RequireAuth from "@/components/RequireAuth";
import SettingsForm from "@/components/SettingsForm";

export default function SettingsPage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <RequireAuth>
        <SettingsForm />
      </RequireAuth>
    </main>
  );
}
