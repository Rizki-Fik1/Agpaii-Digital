"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/utils/context/auth_context";
import clsx from "clsx";
import Link from "next/link";
import Swal from "sweetalert2";

export default function PulsaForm() {
  const { auth } = useAuth();

  const [phone, setPhone] = useState("");
  const [provider, setProvider] = useState<string | null>(null);
  const [operatorId, setOperatorId] = useState<string | null>(null);
  const [pulsaOptions, setPulsaOptions] = useState<
    { id: string; value: number; name: string; label: string }[]
  >([]);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [selectedNominal, setSelectedNominal] = useState<number | null>(null);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [originalPrice, setOriginalPrice] = useState<number | null>(null);
  const [finalPrice, setFinalPrice] = useState<number | null>(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [saldo, setSaldo] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ================== PROVIDER CONFIG ================== */
  const providerPrefixes: Record<string, string[]> = {
    Telkomsel: ["0811", "0812", "0813", "0821", "0822", "0823", "0851", "0852", "0853"],
    XL: ["0817", "0818", "0819", "0859", "0877", "0878"],
    Indosat: ["0814", "0815", "0816", "0855", "0856", "0857", "0858"],
    Tri: ["0896", "0897", "0898", "0899"],
    Smartfren: ["0881", "0882", "0883", "0884", "0885", "0886", "0887", "0888", "0889"],
    Axis: ["0831", "0832", "0833", "0838"],
    ByU: ["0851"],
  };

  const providerToOperatorId: Record<string, string> = {
    Telkomsel: "29",
    XL: "44",
    Indosat: "13",
    Tri: "36",
    Smartfren: "26",
    Axis: "1",
    ByU: "159",
  };

  const detectProvider = (number: string) => {
    const clean = number.replace(/\D/g, "").slice(0, 4);
    for (const [name, prefixes] of Object.entries(providerPrefixes)) {
      if (prefixes.includes(clean)) return name;
    }
    return null;
  };

  /* ================== FORMAT RUPIAH (KONSISTEN DENGAN TOKEN LISTRIK) ================== */
  const formatRupiah = (value: number | null | undefined) => {
    if (!value || isNaN(value)) return "Rp 0";
    return `Rp ${value.toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;
  };

  /* ================== SALDO ================== */
  useEffect(() => {
    if (!auth?.id) return;

    const fetchSaldo = async () => {
      try {
        const res = await fetch(
          `https://admin.agpaiidigital.org/api/agpay/wallet?user_id=${auth.id}`
        );
        const data = await res.json();
        setSaldo(Number(data?.balance ?? data?.data?.balance ?? 0));
      } catch {
        setSaldo(0);
      }
    };

    fetchSaldo();
  }, [auth?.id]);

  /* ================== FETCH PULSA ================== */
  const fetchPulsaOptions = async (operatorId: string) => {
    setLoading(true);
    setPulsaOptions([]);
    try {
      const res = await fetch(
        `https://admin.agpaiidigital.org/api/filter-products?category_id=1&operator_id=${operatorId}`
      );
      const data = await res.json();
      if (!res.ok || !data.results) throw new Error();
      setPulsaOptions(
        data.results.map((item: any) => ({
          id: item.code,
          value: item.price,
          name: item.name,
          label: `Rp ${item.price.toLocaleString("id-ID", { maximumFractionDigits: 0 })}`,
        }))
      );
    } catch {
      setError("Gagal memuat nominal pulsa");
    } finally {
      setLoading(false);
    }
  };

  /* ================== HANDLERS ================== */
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);
    setProvider(null);
    setOperatorId(null);
    setPulsaOptions([]);
    setSelectedCode(null);
    setSelectedNominal(null);
    resetVoucher();

    const detected = detectProvider(value);
    if (detected) {
      setProvider(detected);
      const opId = providerToOperatorId[detected];
      setOperatorId(opId);
      fetchPulsaOptions(opId);
    }
  };

  const resetVoucher = () => {
    setVoucherCode("");
    setVoucherError(null);
    setOriginalPrice(null);
    setFinalPrice(null);
  };

  const handleSelectNominal = (item: any) => {
    setSelectedCode(item.id);
    setSelectedNominal(item.value);
  };

  const validateVoucher = async () => {
    const code = voucherCode.trim();
    if (!code) {
      setVoucherError("Masukkan kode voucher terlebih dahulu");
      return;
    }

    setVoucherLoading(true);
    setVoucherError(null);

    try {
      const payload: any = { voucher_code: code };
      if (selectedCode) payload.code = selectedCode;

      const res = await fetch(
        "https://admin.agpaiidigital.org/api/tripay/ppob/validate-voucher",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth?.token || ""}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Kode voucher tidak valid atau kadaluarsa");
      }

      setOriginalPrice(data.original_price);
      setFinalPrice(data.final_price);

      Swal.fire({
        icon: "success",
        title: "Voucher Berhasil!",
        text: `Hemat ${formatRupiah(data.original_price - data.final_price)}`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (e: any) {
      setVoucherError(e.message || "Voucher tidak valid");
      setOriginalPrice(null);
      setFinalPrice(null);
    } finally {
      setVoucherLoading(false);
    }
  };

  /* ================== PRICE ================== */
  const subtotal = selectedNominal ?? 0;
  const total = finalPrice !== null ? finalPrice : subtotal;

  /* ================== SUBMIT ================== */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone.trim()) {
      await Swal.fire({
        icon: "warning",
        title: "Nomor HP Kosong",
        text: "Masukkan nomor HP terlebih dahulu",
        confirmButtonColor: "#009788",
      });
      return;
    }

    if (!selectedCode) {
      await Swal.fire({
        icon: "warning",
        title: "Nominal Belum Dipilih",
        text: "Pilih nominal pulsa terlebih dahulu",
        confirmButtonColor: "#009788",
      });
      return;
    }

    if (total > saldo) {
      const result = await Swal.fire({
        icon: "error",
        title: "Saldo Tidak Cukup",
        html: "Saldo kamu tidak cukup untuk transaksi ini.<br/>Yuk top up dulu!",
        showCancelButton: true,
        confirmButtonText: "Top Up Sekarang",
        cancelButtonText: "Nanti Dulu",
        confirmButtonColor: "#009788",
        cancelButtonColor: "#6b7280",
        width: "350px",
        padding: "1.5rem",
      });

      if (result.isConfirmed) {
        window.location.href = "/agpay/topup";
      }
      return;
    }

    setLoading(true);
    setError(null);

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
            inquiry: "I",
            code: selectedCode,
            phone,
            voucher_code: voucherCode.trim() || "",
          }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        const errorMsg = (data.message || "").toLowerCase();
        if (errorMsg.includes("saldo") || errorMsg.includes("balance")) {
          await Swal.fire({
            icon: "error",
            title: "Transaksi Gagal",
            text: "Ada Kendala di Provider, hubungi admin (404 SAL)",
            confirmButtonColor: "#d33",
          });
        } else {
          await Swal.fire({
            icon: "error",
            title: "Transaksi Gagal",
            text: "Ada Kendala di Provider, hubungi admin (500 PRVDR)",
            confirmButtonColor: "#d33",
          });
        }
        setLoading(false);
        return;
      }

      await Swal.fire({
        icon: "success",
        title: "Transaksi Berhasil!",
        text: "Pulsa sedang diproses dan akan masuk dalam beberapa saat.",
        confirmButtonColor: "#009788",
        width: "350px",
        padding: "1.5rem",
      });

      window.location.href = "/history";
    } catch (e: any) {
      await Swal.fire({
        icon: "error",
        title: "Transaksi Gagal",
        text: "Ada Kendala di Provider, hubungi admin (500 PRVDR)",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================== UI ================== */
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-[480px] mx-auto px-6 sm:px-8 py-6">
        {/* Header dengan Back Button */}
        <div className="mb-6">
          <Link href="/ecommerce">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-[#009788]/30 transition-all shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Kembali
            </button>
          </Link>
        </div>

        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Beli Pulsa</h1>
          <p className="text-sm text-slate-500 mt-2">Isi pulsa dengan mudah dan cepat</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nomor HP */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <label className="text-sm font-semibold text-slate-700 block mb-3">Nomor HP</label>
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#009788]/50 focus:border-[#009788] transition"
              placeholder="Contoh: 081234567890"
            />
            {provider && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-[#009788] rounded-full animate-pulse"></div>
                <span className="text-[#009788] font-medium">Provider terdeteksi: {provider}</span>
              </div>
            )}
          </div>

          {/* Nominal Pulsa */}
          {provider && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <label className="text-sm font-semibold text-slate-700 block mb-4">Pilih Nominal</label>
              {loading && pulsaOptions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-block w-8 h-8 border-4 border-[#009788]/30 border-t-[#009788] rounded-full animate-spin"></div>
                  <p className="text-sm text-slate-500 mt-3">Memuat nominal...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {pulsaOptions.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectNominal(item)}
                      className={clsx(
                        "cursor-pointer p-4 border-2 rounded-xl text-center transition-all duration-200",
                        selectedCode === item.id
                          ? "border-[#009788] bg-[#009788]/5 shadow-md scale-105"
                          : "border-slate-200 hover:border-[#009788]/30 hover:shadow-sm"
                      )}
                    >
                      <p className="font-semibold text-slate-800">{item.name}</p>
                      <p className="text-sm text-slate-500 mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Voucher */}
          {phone.trim() && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <label className="text-sm font-semibold text-slate-700 block mb-3">Kode Voucher</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => {
                    setVoucherCode(e.target.value.toUpperCase());
                    if (finalPrice !== null) resetVoucher();
                  }}
                  placeholder={
                    !selectedCode
                      ? "Pilih nominal pulsa terlebih dahulu"
                      : "Ketik kode voucher di sini"
                  }
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#009788]/50 focus:border-[#009788] disabled:bg-gray-100 disabled:text-gray-400"
                  disabled={voucherLoading || !selectedCode}
                />
                <button
                  type="button"
                  onClick={validateVoucher}
                  disabled={voucherLoading || !voucherCode.trim()}
                  className={clsx(
                    "px-6 py-3 rounded-xl font-medium text-sm min-w-[110px]",
                    voucherLoading || !voucherCode.trim()
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-[#009788] text-white hover:bg-[#008577] active:scale-95"
                  )}
                >
                  {voucherLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Memeriksa
                    </span>
                  ) : (
                    "Terapkan"
                  )}
                </button>
              </div>

              {finalPrice !== null && (
                <div className="mt-4 p-4 bg-[#009788]/5 border border-[#009788]/20 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#009788]/10 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#009788]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Voucher aktif</p>
                        <p className="font-semibold text-[#009788]">{voucherCode}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={resetVoucher}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Hapus
                    </button>
                  </div>
                  <p className="mt-2 text-sm font-medium text-green-700">
                    Hemat {formatRupiah(originalPrice! - finalPrice!)}
                  </p>
                </div>
              )}

              {voucherError && (
                <p className="mt-3 text-sm text-red-600 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {voucherError}
                </p>
              )}
            </div>
          )}

          {/* Saldo Info */}
          <div className="bg-gradient-to-br from-[#009788] to-[#00796b] rounded-2xl p-5 shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Saldo AGPAY Anda</p>
                <p className="text-2xl font-bold mt-1">{formatRupiah(saldo)}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
            </div>

            {total > saldo && (
              <div className="mt-3 flex items-center gap-2 bg-red-500/20 backdrop-blur-sm px-3 py-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-sm">Saldo tidak mencukupi</span>
              </div>
            )}
          </div>

          {/* Total */}
          {selectedCode && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Total Pembayaran</span>
                <span className="text-2xl font-bold text-[#009788]">{formatRupiah(total)}</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-red-800">Transaksi Gagal</p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || total > saldo || !selectedCode}
            className={clsx(
              "w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg",
              loading || total > saldo || !selectedCode
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-[#009788] hover:bg-[#008577] active:scale-95"
            )}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                Memproses...
              </span>
            ) : (
              "Beli Pulsa Sekarang"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}