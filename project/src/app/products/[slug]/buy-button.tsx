"use client";
import { useRouter } from "next/navigation";
import { formatIDR } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";

export function BuyButton({
  productId,
  price,
  stock,
  productName,
}: {
  productId: number;
  price: number;
  stock: number;
  productName: string;
}) {
  const router = useRouter();
  if (stock <= 0) {
    return (
      <button
        disabled
        className="w-full px-6 py-4 rounded-xl bg-gray-500/30 text-gray-400 font-bold cursor-not-allowed"
      >
        Stok Habis
      </button>
    );
  }
  return (
    <button
      onClick={() =>
        router.push(`/checkout?productId=${productId}&name=${encodeURIComponent(productName)}`)
      }
      className="w-full px-6 py-4 rounded-xl btn-primary font-bold text-lg flex items-center justify-center gap-2"
    >
      <ShoppingBag size={20} /> Beli Sekarang · {formatIDR(price)}
    </button>
  );
}
