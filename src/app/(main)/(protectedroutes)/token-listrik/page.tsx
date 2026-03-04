"use client";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import { useAuth } from "@/utils/context/auth_context";
import clsx from "clsx";
import Link from "next/link";

export default function PlnTokenForm() {
  const { auth } = useAuth();

  const [meter, setMeter] = useState("");
  const [phone, setPhone] = useState("");
  const [options, setOptions] = useState<
    { id: string; name: string; price: number }[]
  >([]);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<number>(0);

  const [voucherCode, setVoucherCode] = useState("");
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [voucherSuccess, setVoucherSuccess] = useState<string | null>(null); // pesan sukses + potongan

  const [originalPrice, setOriginalPrice] = useState<number | null>(null);
  const [finalPrice, setFinalPrice] = useState<number | null>(null);

  const [saldo, setSaldo] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ================= SALDO ================= */
  useEffect(() => {
    if (!auth?.id) return;

    const fetchSaldo = async () => {
      try {
        const res = await fetch(
          `https://admin.agpaiidigital.org/api/agpay/wallet?user_id=${auth.id}`
        );
        const data = await res.json();
        const rawBalance = data?.balance ?? data?.data?.balance ?? 0;
        setSaldo(Number(rawBalance));
      } catch {
        setSaldo(0);
      }
    };
    fetchSaldo();
  }, [auth?.id]);

  const formatRupiah = (value: number) =>
    `Rp ${value.toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;

  /* ================= TOKEN OPTIONS ================= */
  const fetchTokenOptions = async () => {
    setLoading(true);
    setError(null);
    setOptions([]);
    try {
      const res = await fetch(
        `https://admin.agpaiidigital.org/api/filter-products?category_id=19`
      );
      const data = await res.json();
      if (!res.ok || !data.results) throw new Error("Gagal memuat token PLN");
      setOptions(
        data.results.map((item: any) => ({
          id: item.code,
          name: item.name,
          price: item.price,
        }))
      );
    } catch (e: any) {
      setError(e.message || "Gagal memuat token PLN");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokenOptions();
  }, []);

  /* ================= VOUCHER ================= */
  const validateVoucher = async () => {
    if (!voucherCode.trim() || !selectedCode) {
      setVoucherError("Masukkan kode voucher dan pilih nominal terlebih dahulu");
      return;
    }

    setLoading(true);
    setVoucherError(null);
    setVoucherSuccess(null);
    setOriginalPrice(null);
    setFinalPrice(null);

    try {
      const res = await fetch(
        "https://admin.agpaiidigital.org/api/tripay/ppob/validate-voucher",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth?.token || ""}`,
          },
          body: JSON.stringify({
            voucher_code: voucherCode.trim(),
            code: selectedCode,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Voucher tidak valid atau kadaluarsa");
      }

      // Sukses
      const potongan = data.original_price - data.final_price;
      setOriginalPrice(data.original_price);
      setFinalPrice(data.final_price);
      setVoucherSuccess(
        potongan > 0
          ? `Voucher berhasil! Potongan: ${formatRupiah(potongan)}`
          : `Voucher diterapkan (tanpa potongan)`
      );

    } catch (e: any) {
      setVoucherError(e.message || "Voucher tidak valid");
      setOriginalPrice(null);
      setFinalPrice(null);
    } finally {
      setLoading(false);
    }
  };

  /* ================= PRICE ================= */
  const subtotal = selectedPrice;
  const total = finalPrice !== null ? finalPrice : subtotal;

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meter || !phone || !selectedCode || total > saldo) return;

    setLoading(true);

    try {
      const res = await fetch(
        "https://admin.agpaiidigital.org/api/tripay/ppob/transaksi/pembelian",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth?.token || ""}`,
          },
          body: JSON.stringify({
            user_id: auth.id,
            inquiry: "PLN",
            code: selectedCode,
            phone,
            no_meter_pln: meter,
            voucher_code: voucherCode.trim() || undefined,
          }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Transaksi gagal");
      }

      // SUCCESS
      await Swal.fire({
        icon: "success",
        title: "Transaksi Berhasil",
        text: "Token PLN sedang diproses",
        confirmButtonColor: "#009788",
      });

      window.location.href = "/history";
    } catch (e: any) {
      const message = e?.message || "Terjadi kesalahan";
      const isSaldoError = message.toLowerCase().includes("saldo");

      await Swal.fire({
        icon: "error",
        title: "Transaksi Gagal",
        text: isSaldoError
          ? "Ada Kendala di Provider, hubungi admin (404 SAL)"
          : "Ada Kendala di Provider, hubungi admin (500 PRVDR)",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(options.length / itemsPerPage);
  const paginated = options.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* ================= UI ================= */
  return (
    <div className="max-w-md mx-auto mt-6">
      <Link href="/ecommerce">
        <button className="mb-4 px-4 py-2 bg-gray-500 text-white rounded-lg">
          ← Kembali ke AGPAY
        </button>
      </Link>

      <form onSubmit={handleSubmit} className="space-y-6 px-4">
        <div>
          <label className="text-sm font-medium">No Meter PLN</label>
          <input
            value={meter}
            onChange={(e) => setMeter(e.target.value)}
            className="w-full mt-2 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009788]"
            placeholder="Contoh: 123456789012"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Nomor Telepon</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full mt-2 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009788]"
            placeholder="Contoh: 081234567890"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Pilih Nominal Token</label>
          <div className="grid grid-cols-2 gap-4 mt-3">
            {paginated.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedCode(item.id);
                  setSelectedPrice(item.price);
                  // Reset voucher saat ganti nominal
                  setVoucherCode("");
                  setVoucherError(null);
                  setVoucherSuccess(null);
                  setOriginalPrice(null);
                  setFinalPrice(null);
                }}
                className={clsx(
                  "cursor-pointer p-4 border rounded-xl text-center transition-all",
                  selectedCode === item.id
                    ? "border-[#009788] bg-[#009788]/10 font-semibold shadow-sm"
                    : "border-slate-200 hover:border-[#009788]/50"
                )}
              >
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-600">
                  {formatRupiah(item.price)}
                </p>
              </div>
            ))}
          </div>

          {/* Pagination sederhana - bisa dipercantik */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span className="px-3 py-1 self-center">
                Hal {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Kode Voucher (opsional)</label>
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <input
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009788] disabled:bg-gray-100 disabled:text-gray-400"
              placeholder={
                !selectedCode
                  ? "Pilih nominal token dulu"
                  : "Masukkan kode voucher"
              }
              disabled={loading || !selectedCode}
            />
            <button
              type="button"
              onClick={validateVoucher}
              disabled={loading || !selectedCode || !voucherCode.trim()}
              className={clsx(
                "px-5 py-3 rounded-lg font-medium text-white",
                loading || !selectedCode || !voucherCode.trim()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#009788] hover:bg-[#008577]"
              )}
            >
              {loading ? "Memeriksa..." : "Terapkan"}
            </button>
          </div>

          {/* Keterangan voucher */}
          {voucherError && (
            <p className="text-sm text-red-600 mt-1">{voucherError}</p>
          )}
          {voucherSuccess && (
            <p className="text-sm text-green-600 mt-1 font-medium">
              {voucherSuccess}
            </p>
          )}
          {originalPrice !== null && finalPrice !== null && (
            <div className="mt-2 text-sm">
              <p>
                Harga asli: <s className="text-gray-500">{formatRupiah(originalPrice)}</s>
              </p>
              <p className="font-semibold text-[#009788]">
                Harga setelah voucher: {formatRupiah(finalPrice)}
              </p>
            </div>
          )}
        </div>

        <div className="border rounded-xl p-4 bg-[#009788]/10">
          <p className="text-sm">Saldo AGPAY</p>
          <p className="text-xl font-bold text-[#009788]">
            {formatRupiah(saldo)}
          </p>
          {total > saldo && selectedCode && (
            <p className="text-sm text-red-600 mt-2 font-medium">
              Saldo tidak mencukupi untuk transaksi ini
            </p>
          )}
        </div>

        <div className="flex justify-between font-semibold text-lg">
          <span>Total Bayar</span>
          <span className="text-[#009788]">{formatRupiah(total)}</span>
        </div>

        <button
          type="submit"
          disabled={loading || total > saldo || !selectedCode || !meter.trim() || !phone.trim()}
          className={clsx(
            "w-full py-3 rounded-lg font-semibold text-white transition",
            loading || total > saldo || !selectedCode || !meter.trim() || !phone.trim()
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#009788] hover:bg-[#008577]"
          )}
        >
          {loading ? "Memproses..." : "Beli Token PLN"}
        </button>
      </form>
    </div>
  );
}