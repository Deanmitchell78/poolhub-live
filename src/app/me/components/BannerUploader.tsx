"use client";

import React, { useState } from "react";
import { uploadBannerAction } from "../actions";

export default function BannerUploader() {
  const [preview, setPreview] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    try {
      setLoading(true);
      setMsg(null);
      const res = await uploadBannerAction(formData);
      if (res?.url) {
        setPreview(res.url);
        setMsg("Banner updated!");
      } else {
        setMsg("Uploaded, but no URL returned.");
      }
    } catch (e: any) {
      setMsg(e?.message ?? "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border p-4">
      <h3 className="text-lg font-semibold mb-2">Update banner</h3>
      <form action={submit}>
        <input
          type="file"
          name="banner"
          accept="image/png,image/jpeg,image/webp"
          className="mb-3"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setPreview(URL.createObjectURL(f));
          }}
          required
        />
        <button
          className="px-4 py-2 rounded-2xl shadow border disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Uploading..." : "Save banner"}
        </button>
      </form>
      {msg && <p className="mt-2 text-sm">{msg}</p>}
      {preview && (
        <img
          src={preview}
          alt="Banner preview"
          className="mt-3 w-full max-h-64 object-cover rounded-xl"
        />
      )}
    </div>
  );
}
