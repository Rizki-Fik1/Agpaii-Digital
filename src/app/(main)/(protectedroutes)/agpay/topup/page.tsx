"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/utils/context/auth_context";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import Link from "next/link";

const QUICK_AMOUNTS = [20000, 50000, 100000, 200000, 500000];

export default function TopupPage() {
  const { auth } = useAuth();
  const router = useRouter();

  const [amount, setAmount] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [showIframe, setShowIframe] = useState(false);

  // redirect jika belum login
  useEffect(() => {
    if (!auth?.id) {
      router.replace("/login");
    }
  }, [auth, router]);

  // fetch payment channels Tripay
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await fetch(
          "https://admin.agpaiidigital.org/api/tripay/payment-channels",
        );
        const data = await res.json();

        if (data.success && data.channels) {
          const active = data.channels.filter((c: any) => c.active);
          setChannels(active);
          setPaymentMethod(active?.[0]?.code ?? "");
        }
      } catch {
        setError("Gagal memuat metode pembayaran");
      }
    };

    fetchChannels();
  }, []);

  const handleSubmit = async () => {
    if (!amount || amount < 20000) {
      setError("Minimal top up Rp 20.000");
      return;
    }

    if (!paymentMethod) {
      setError("Pilih metode pembayaran");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        "https://admin.agpaiidigital.org/api/agpay/topup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            user_id: auth.id,
            amount,
            method: paymentMethod,
          }),
        },
      );

      const result = await res.json();

      if (!res.ok || !result.success || !result.checkout_url) {
        throw new Error(result.message || "Gagal membuat top up");
      }

      setCheckoutUrl(result.checkout_url);
      setShowIframe(true);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 min-h-screen bg-gray-50">
      <Link href="/saldo-saya">
        <button className="mb-6 px-4 py-2 bg-gray-600 text-white rounded-lg">
          ← Kembali
        </button>
      </Link>

      <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-[#009788] to-[#00796b] text-white shadow">
        <p className="text-sm opacity-90">Top Up Saldo AGPAY</p>
        <p className="text-xs opacity-80 mt-1">Minimal top up Rp 20.000</p>
      </div>

      {/* PILIH NOMINAL CEPAT */}
      <div className="mb-5">
        <p className="font-semibold text-sm mb-3">Pilih Nominal</p>
        <div className="grid grid-cols-2 gap-3">
          {QUICK_AMOUNTS.map((val) => (
            <button
              key={val}
              onClick={() => setAmount(val)}
              className={clsx(
                "py-3 rounded-xl border text-sm font-semibold transition",
                amount === val
                  ? "bg-[#009788] text-white border-[#009788]"
                  : "bg-white text-gray-700 hover:border-[#009788]",
              )}
            >
              Rp {val.toLocaleString("id-ID")}
            </button>
          ))}
        </div>
      </div>

      {/* INPUT MANUAL */}
      <div className="mb-5">
        <p className="font-semibold text-sm mb-2">Nominal Lainnya</p>
        <input
          type="number"
          min={20000}
          placeholder="Contoh: 75000"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#009788]"
        />
      </div>

      {/* METODE PEMBAYARAN */}
      <div className="mb-5">
        <p className="font-semibold text-sm mb-2">Metode Pembayaran</p>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full px-4 py-3 border rounded-xl"
        >
          {channels.map((ch) => (
            <option key={ch.code} value={ch.code}>
              {ch.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className={clsx(
          "w-full py-3 rounded-xl font-semibold shadow transition",
          loading
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "bg-[#009788] hover:bg-[#008577] text-white",
        )}
      >
        {loading ? "Memproses..." : "Top Up Sekarang"}
      </button>

      {/* IFRAME PAYMENT MODAL */}
      {showIframe && checkoutUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold">Pembayaran</h3>
              <button
                onClick={() => setShowIframe(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <iframe
              src={checkoutUrl}
              className="w-full h-[80vh]"
              title="Payment Gateway"
              allow="payment"
            />
          </div>
        </div>
      )}
    </div>
  );
}
