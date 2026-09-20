"use client";
import { useRef, useState } from "react";
import { Upload, Loader2, X } from "lucide-react";
import { toast } from "@/components/toaster";

export function ImageUploader({
  value,
  onChange,
  label = "Gambar",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  function pickFile() {
    inputRef.current?.click();
  }

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast("File harus berupa gambar", "error");
      return;
    }
    setLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = reader.result as string;
        const r = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl }),
        });
        const d = await r.json();
        if (d.ok) {
          onChange(d.url);
          toast("Gambar berhasil diunggah", "success");
        } else {
          toast(d.error || "Gagal upload", "error");
        }
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => {
      setLoading(false);
      toast("Gagal membaca file", "error");
    };
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      <div
        onClick={pickFile}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
        className="relative cursor-pointer rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg)] hover:border-violet-500/60 transition overflow-hidden"
      >
        {value ? (
          <div className="relative">
            <img src={value} alt="preview" className="w-full h-40 object-cover" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-lg text-white hover:bg-red-500/80"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="h-32 flex flex-col items-center justify-center gap-1 text-[var(--muted)] text-xs">
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <Upload size={20} />
                <span>Ketuk atau seret gambar ke sini</span>
              </>
            )}
          </div>
        )}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="atau tempel URL gambar"
        className="w-full mt-2 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs"
      />
    </div>
  );
}
