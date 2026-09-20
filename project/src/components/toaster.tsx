"use client";
import { useEffect, useState } from "react";

type Toast = { id: number; msg: string; type: "success" | "error" | "info" };

let listeners: ((t: Toast) => void)[] = [];
let seq = 1;

export function toast(msg: string, type: Toast["type"] = "info") {
  const t = { id: seq++, msg, type };
  listeners.forEach((l) => l(t));
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const l = (t: Toast) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(
        () => setToasts((prev) => prev.filter((x) => x.id !== t.id)),
        3500,
      );
    };
    listeners.push(l);
    return () => {
      listeners = listeners.filter((x) => x !== l);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast ${
            t.type === "success"
              ? "bg-emerald-600"
              : t.type === "error"
                ? "bg-red-600"
                : "bg-slate-800"
          }`}
        >
          {t.msg}
        </div>
      ))}
    </div>
  );
}
