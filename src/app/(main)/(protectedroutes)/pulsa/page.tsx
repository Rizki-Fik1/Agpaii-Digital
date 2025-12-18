"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/utils/context/auth_context";
import clsx from "clsx";
import Link from "next/link";

export default function PulsaForm() {
  const [phone, setPhone] = useState("");
  const [selectedNominal, setSelectedNominal] = useState<string | null>(null);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [operatorId, setOperatorId] = useState<string | null>(null);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [originalPrice, setOriginalPrice] = useState<number | null>(null);
  const [finalPrice, setFinalPrice] = useState<number | null>(null);
  const { auth } = useAuth();

  const [pulsaOptions, setPulsaOptions] = useState<
    { id: string; value: number; name: string; label: string }[]
  >([]);
  const [paymentChannels, setPaymentChannels] = useState<
    { code: string; name: string; group: string; total_fee: { flat: number; percent: string } }[]
  >([]);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Daftar prefiks provider
  const providerPrefixes = {
    Telkomsel: ["0811", "0812", "0813", "0821", "0822", "0823", "0852", "0853", "0851"],
    XL: ["0817", "0818", "0819", "0859", "0877", "0878"],
    Indosat: ["0814", "0815", "0816", "0855", "0856", "0857", "0858"],
    Tri: ["0896", "0897", "0898", "0899"],
    Smartfren: ["0881", "0882", "0883", "0884", "0885", "0886", "0887", "0888", "0889"],
    Axis: ["0838", "0831", "0832", "0833"],
    ByU: ["0851"],
  };

  // Mapping provider ke operator_id
  const providerToOperatorId = {
    Telkomsel: "29",
    XL: "44",
    Indosat: "13",
    Tri: "36",
    Smartfren: "26",
    Axis: "1",
    ByU: "159",
  };

  // Fungsi deteksi provider
  const detectProviderByPrefix = (phoneNumber: string) => {
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    const prefix = cleanPhone.slice(0, 4);
    for (const [providerName, prefixes] of Object.entries(providerPrefixes)) {
      if (prefixes.includes(prefix)) {
        return providerName;
      }
    }
    return null;
  };

  // Fetch produk pulsa
  const fetchPulsaOptions = async (phoneNumber: string, operatorId: string) => {
    setLoading(true);
    setError(null);
    setPulsaOptions([]);
    try {
      const response = await fetch(
        `https://mitra.agpaiidigital.org/api/filter-products?category_id=1&operator_id=${operatorId}`,
        { headers: { Accept: "application/json" } }
      );
      const data = await response.json();

      if (!response.ok || !data.results) {
        throw new Error(data.message || "Gagal mengambil data pulsa");
      }

      const options = data.results.map((item: any) => ({
        id: item.code,
        value: item.price,
        name: item.name,
        label: `Rp ${item.price.toLocaleString("id-ID")}`,
      }));
      setPulsaOptions(options);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mengambil data");
      setPulsaOptions([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch channel pembayaran
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await fetch("https://mitra.agpaiidigital.org/api/tripay/payment-channels", {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${auth?.token || ""}`,
          },
        });
        const data = await response.json();

        if (response.ok && data.success && data.channels) {
          const channels = data.channels
            .filter((ch: any) => ch.active)
            .map((ch: any) => ({
              code: ch.code,
              name: ch.name,
              group: ch.group,
              total_fee: {
                flat: ch.total_fee.flat,
                percent: ch.total_fee.percent,
              },
            }));
          setPaymentChannels(channels);
          if (channels.length > 0) {
            setPaymentMethod(channels[0].code);
          }
        } else {
          setError("Gagal mengambil metode pembayaran");
        }
      } catch (err) {
        console.error("Error fetch payment channels:", err);
        setError("Terjadi kesalahan saat mengambil metode pembayaran");
      }
    };

    fetchChannels();
  }, [auth?.token]);

  // Validate voucher
  const validateVoucher = async () => {
    if (!voucherCode || !selectedCode) {
      setVoucherError("Masukkan kode voucher dan pilih nominal pulsa terlebih dahulu");
      setOriginalPrice(null);
      setFinalPrice(null);
      return;
    }

    setLoading(true);
    setVoucherError(null);
    try {
      const response = await fetch(
        "https://mitra.agpaiidigital.org/api/tripay/ppob/validate-voucher",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${auth?.token || ""}`,
          },
          body: JSON.stringify({
            voucher_code: voucherCode,
            code: selectedCode,
          }),
        }
      );

      const data = await response.json();
      if (response.ok && data.success) {
        setOriginalPrice(data.original_price);
        setFinalPrice(data.final_price);
      } else {
        throw new Error(data.message || "Kode voucher tidak valid");
      }
    } catch (err: any) {
      setVoucherError(err.message || "Terjadi kesalahan saat memvalidasi voucher");
      setOriginalPrice(null);
      setFinalPrice(null);
    } finally {
      setLoading(false);
    }
  };

  // Handler perubahan nomor
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhone = e.target.value;
    setPhone(newPhone);
    setSelectedNominal(null);
    setSelectedCode(null);
    setProvider(null);
    setOperatorId(null);
    setPulsaOptions([]);
    setVoucherCode("");
    setVoucherError(null);
    setOriginalPrice(null);
    setFinalPrice(null);

    const cleanPhone = newPhone.replace(/\D/g, "");
    if (cleanPhone.length >= 4) {
      const detectedProvider = detectProviderByPrefix(newPhone);
      if (detectedProvider) {
        const detectedOperatorId = providerToOperatorId[detectedProvider];
        setProvider(detectedProvider);
        setOperatorId(detectedOperatorId);
        fetchPulsaOptions(newPhone, detectedOperatorId);
      } else {
        setError("Nomor tidak dikenali sebagai provider yang valid!");
      }
    }
  };

  const handleNominalSelect = (item: { id: string; value: number; label: string }) => {
    setSelectedNominal(item.value.toString());
    setSelectedCode(item.id);
    setVoucherError(null);
    setOriginalPrice(null);
    setFinalPrice(null);
    if (voucherCode) {
      validateVoucher();
    }
  };

  const handleVoucherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVoucherCode(e.target.value);
    setVoucherError(null);
    setOriginalPrice(null);
    setFinalPrice(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !selectedNominal || !selectedCode || !provider || !paymentMethod) {
      alert("Harap isi nomor telepon, pilih nominal pulsa, pastikan provider valid, dan pilih metode pembayaran!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "https://mitra.agpaiidigital.org/api/tripay/ppob/transaksi/pembelian",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${auth?.token || ""}`,
          },
          body: JSON.stringify({
            user_id: auth.id,
            inquiry: "I",
            code: selectedCode,
            phone,
            no_meter_pln: "",
            pin: "3456",
            method: paymentMethod,
    		customer_name: auth.name || undefined,
            customer_email: auth.email || undefined,
            customer_phone: phone,
            voucher_code: voucherCode || undefined,
          }),
        }
      );

      const result = await response.json();
      if (result.success && result.checkout_url) {
        setOriginalPrice(result.original_price);
        setFinalPrice(result.final_price);
        window.location.href = result.checkout_url;
      } else {
        throw new Error(result.message || "Gagal transaksi pulsa");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memproses transaksi");
      alert(err.message || "Terjadi kesalahan saat memproses transaksi");
    } finally {
      setLoading(false);
    }
  };

  // Calculate subtotal
  const subtotal = selectedCode
    ? pulsaOptions.find((option) => option.id === selectedCode)?.value || 0
    : 0;

  // Calculate voucher discount
  const voucherDiscount =
    finalPrice && originalPrice && finalPrice !== originalPrice
      ? originalPrice - finalPrice
      : 0;

  // Calculate total
  const total = finalPrice !== null && voucherDiscount > 0 ? finalPrice : subtotal;

  // Group payment channels by their group
  const groupedChannels = paymentChannels.reduce((acc, channel) => {
    if (!acc[channel.group]) {
      acc[channel.group] = [];
    }
    acc[channel.group].push(channel);
    return acc;
  }, {} as Record<string, typeof paymentChannels>);

  return (
    <div className="max-w-md mx-auto mt-6">
      <Link href="/ecommerce">
        <button className="mb-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">
          Kembali ke AGPAY
        </button>
      </Link>
      <form onSubmit={handleSubmit} className="px-6 sm:px-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700">Nomor HP</label>
          <input
            type="tel"
            placeholder="Contoh: 081234567890"
            value={phone}
            onChange={handlePhoneChange}
            className="mt-2 w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#009788]"
          />
          {loading && <p className="mt-2 text-sm text-gray-500">Memuat data...</p>}
          {phone && provider && (
            <p className="mt-2 text-sm text-[#009788]">Provider: {provider}</p>
          )}
          {phone && !provider && !loading && phone.replace(/\D/g, "").length >= 4 && (
            <p className="mt-2 text-sm text-red-600">
              Nomor tidak dikenali sebagai provider yang valid!
            </p>
          )}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">Pilih Nominal Pulsa</label>
          {pulsaOptions.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {pulsaOptions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNominalSelect(item)}
                  className={clsx(
                    "cursor-pointer rounded-xl border p-4 text-center shadow-md transition hover:shadow-lg",
                    selectedNominal === item.value.toString()
                      ? "border-[#009788] bg-[#009788]/10 text-[#009788] font-semibold"
                      : "border-slate-200 bg-white text-slate-700"
                  )}
                >
                  <p className="text-lg font-bold">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.label}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              {loading ? "Memuat nominal..." : "Masukkan nomor telepon untuk melihat nominal pulsa"}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">Metode Pembayaran</label>
          {paymentChannels.length > 0 ? (
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#009788]"
            >
              {Object.entries(groupedChannels).map(([group, channels]) => (
                <optgroup key={group} label={group}>
                  {channels.map((channel) => (
                    <option key={channel.code} value={channel.code}>
                      {channel.name} (Biaya: Rp {channel.total_fee.flat.toLocaleString("id-ID")} {channel.total_fee.percent !== "0.00" ? `+ ${channel.total_fee.percent}%` : ""})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          ) : (
            <p className="text-sm text-gray-500">Memuat metode pembayaran...</p>
          )}
        </div>

        {selectedCode && (
          <div className="border-t pt-4">
            <div className="flex justify-between text-sm text-slate-700">
              <span>Subtotal:</span>
              <span>Rp {subtotal.toLocaleString("id-ID")}</span>
            </div>
            {voucherDiscount > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>Potongan Voucher:</span>
                <span>- Rp {voucherDiscount.toLocaleString("id-ID")}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-slate-700 mt-2">
              <span>Total:</span>
              <span>Rp {total.toLocaleString("id-ID")}</span>
            </div>
          </div>
        )}
        
        <div className="voucher-input">
          <label className="block text-sm font-medium text-slate-700">Kode Voucher</label>
          <div className="flex space-x-2 mt-2">
            <input
              type="text"
              placeholder="Masukkan kode voucher"
              value={voucherCode}
              onChange={handleVoucherChange}
              onBlur={validateVoucher}
              className="w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#009788]"
            />
            <button
              type="button"
              onClick={validateVoucher}
              className="px-4 py-3 bg-[#009788] text-white rounded-lg hover:bg-[#007f6d] transition"
            >
              Cek
            </button>
          </div>
          {voucherError && <p className="mt-2 text-sm text-red-600">{voucherError}</p>}
          {finalPrice && originalPrice && finalPrice !== originalPrice && (
            <p className="mt-2 text-sm text-[#009788]">
              Harga setelah diskon: Rp {finalPrice.toLocaleString("id-ID")} (Harga asli: Rp {originalPrice.toLocaleString("id-ID")})
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !provider || !selectedNominal || pulsaOptions.length === 0 || !paymentMethod}
          className={clsx(
            "w-full py-3 rounded-lg shadow-md transition",
            loading || !provider || !selectedNominal || pulsaOptions.length === 0 || !paymentMethod
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-[#009788] text-white hover:bg-[#007f6d]"
          )}
        >
          {loading ? "Memproses..." : "Beli Pulsa"}
        </button>
      </form>
    </div>
  );
}