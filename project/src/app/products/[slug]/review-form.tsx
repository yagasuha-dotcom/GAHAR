"use client";
import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { toast } from "@/components/toaster";
import { useRouter } from "next/navigation";

export function ReviewForm({ productId }: { productId: number }) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function submit() {
    setLoading(true);
    try {
      const r = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment }),
      });
      const d = await r.json();
      if (d.ok) {
        toast("Ulasan berhasil dikirim, terima kasih!", "success");
        setComment("");
        setOpen(false);
        router.refresh();
      } else {
        toast(d.error || "Gagal mengirim ulasan", "error");
      }
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mb-4 text-sm font-bold text-violet-400 hover:underline"
      >
        + Tulis ulasan
      </button>
    );
  }

  return (
    <div className="glass rounded-2xl p-4 mb-4">
      <div className="flex gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => {
          const idx = i + 1;
          return (
            <button key={idx} onMouseEnter={() => setHover(idx)} onMouseLeave={() => setHover(0)} onClick={() => setRating(idx)}>
              <Star
                size={22}
                className={idx <= (hover || rating) ? "text-amber-400 fill-amber-400" : "text-[var(--border)]"}
              />
            </button>
          );
        })}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Bagaimana pengalamanmu dengan produk ini?"
        rows={3}
        className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm"
      />
      <div className="flex gap-2 mt-3">
        <button onClick={submit} disabled={loading} className="btn-primary px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 disabled:opacity-50">
          {loading && <Loader2 size={14} className="animate-spin" />} Kirim Ulasan
        </button>
        <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg text-sm text-[var(--muted)] hover:bg-[var(--border)]">
          Batal
        </button>
      </div>
    </div>
  );
}
