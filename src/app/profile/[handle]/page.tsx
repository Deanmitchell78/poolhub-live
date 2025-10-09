import ProfilePreview from "@/components/ProfilePreview";

type Props = { params: { handle: string } };

export default function ProfilePage({ params }: Props) {
  const { handle } = params;
  return (
    <main className="min-h-screen p-8 space-y-6">
      <h1 className="text-3xl font-bold">@{handle}</h1>
      <p className="text-gray-600">
        This is the public profile page for <strong>@{handle}</strong>.
      </p>

      {/* Local-only preview of your saved settings on this device */}
      <ProfilePreview />
    </main>
  );
}
