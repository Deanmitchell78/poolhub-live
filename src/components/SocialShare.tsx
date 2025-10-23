"use client";

import { useState } from "react";

export default function SocialShare({
  url,
  title = "Watch live on PoolHub",
  text = "Iâ€™m live now â€” come watch!",
}: {
  url: string;
  title?: string;
  text?: string;
}) {
  const [copied, setCopied] = useState(false);

  const openPopup = (shareUrl: string, w = 640, h = 640) => {
    const left = window.screenX + (window.outerWidth - w) / 2;
    const top = window.screenY + (window.outerHeight - h) / 2;
    window.open(
      shareUrl,
      "_blank",
      `width=${w},height=${h},left=${left},top=${top},noopener,noreferrer`
    );
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const onNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {}
    } else {
      onCopy();
    }
  };

  const enc = encodeURIComponent;
  const fb = `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`;
  const tw = `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`;
  const rd = `https://www.reddit.com/submit?url=${enc(url)}&title=${enc(title)}`;

  return (
    <div className="rounded-2xl border p-4">
      <h3 className="font-semibold mb-3">Share</h3>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="px-3 py-2 rounded-xl border text-sm"
          onClick={() => openPopup(fb)}
          title="Share to Facebook"
        >
          Facebook
        </button>
        <button
          type="button"
          className="px-3 py-2 rounded-xl border text-sm"
          onClick={() => openPopup(tw)}
          title="Share to X/Twitter"
        >
          X / Twitter
        </button>
        <button
          type="button"
          className="px-3 py-2 rounded-xl border text-sm"
          onClick={() => openPopup(rd)}
          title="Share to Reddit"
        >
          Reddit
        </button>
        <button
          type="button"
          className="px-3 py-2 rounded-xl border text-sm"
          onClick={onNativeShare}
          title="Share with apps"
        >
          Shareâ€¦
        </button>
        <button
          type="button"
          className="px-3 py-2 rounded-xl border text-sm"
          onClick={onCopy}
          title="Copy link"
        >
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-2 break-all">{url}</p>
    </div>
  );
}
