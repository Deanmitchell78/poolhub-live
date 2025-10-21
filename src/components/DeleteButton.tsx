"use client";

export default function DeleteButton({ actionUrl }: { actionUrl: string }) {
  return (
    <form
      action={actionUrl}
      method="post"
      onSubmit={(e) => {
        if (!confirm("Delete this tournament?")) e.preventDefault();
      }}
    >
      <button className="px-3 py-2 rounded-xl border text-sm">Delete</button>
    </form>
  );
}
