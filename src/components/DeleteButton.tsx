"use client";

type Props = {
  action: string;            // POST URL to hit
  label?: string;            // Button text (optional)
  confirmText?: string;      // Confirm dialog text (optional)
  className?: string;        // Extra classes (optional)
};

export default function DeleteButton({
  action,
  label = "Delete",
  confirmText = "Are you sure you want to delete this?",
  className = "",
}: Props) {
  return (
    <form
      action={action}
      method="post"
      onSubmit={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
      className="inline"
    >
      <button
        type="submit"
        className={
          "px-3 py-2 rounded-xl border text-sm hover:bg-gray-50 " + className
        }
        title={label}
      >
        {label}
      </button>
    </form>
  );
}
