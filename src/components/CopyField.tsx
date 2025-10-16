"use client";

export default function CopyField({
  label,
  value,
  name,
}: {
  label: string;
  value?: string | null;
  name: string;
}) {
  const text = value ?? "";
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  };

  return (
    <label className="block">
      <div className="text-sm opacity-80 mb-1">{label}</div>
      <div className="flex gap-2">
        <input
          name={name}
          defaultValue={text}
          readOnly
          onFocus={(e) => e.currentTarget.select()}
          className="w-full bg-black/30 p-2 rounded"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="px-3 rounded bg-white/10 text-sm"
          title="Copy to clipboard"
        >
          Copy
        </button>
      </div>
    </label>
  );
}
