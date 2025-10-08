type Props = { params: { handle: string } };

export default function ProfilePage({ params }: Props) {
  const { handle } = params;
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-2">@{handle}</h1>
      <p className="text-gray-600">
        This is the public profile page for <strong>@{handle}</strong>.
      </p>
    </main>
  );
}
