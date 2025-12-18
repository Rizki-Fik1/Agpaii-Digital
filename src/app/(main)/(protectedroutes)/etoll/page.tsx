"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/utils/context/auth_context";
import clsx from "clsx";
import Link from "next/link";

export default function ETollForm() {
  const [noKartu, setNoKartu] = useState("");
  const [phone, setPhone] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [selectedNominal, setSelectedNominal] = useState<string | null>(null);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [operatorId, setOperatorId] = useState<string | null>(null);
  const [originalPrice, setOriginalPrice] = useState<number | null>(null);
  const [finalPrice, setFinalPrice] = useState<number | null>(null);
  const { auth } = useAuth();

  const [eTollOptions, setETollOptions] = useState<
    { id: string; value: number; name: string; label: string }[]
  >([]);
  const [paymentChannels, setPaymentChannels] = useState<
    { code: string; name: string; group: string; total_fee: { flat: number; percent: string } }[]
  >([]);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Daftar provider e-toll dan provider_id berdasarkan respons JSON
  const eTollProviders = [
    { name: "Mandiri e-money", provider_id: "134" },
    { name: "BRI BRIZZI", provider_id: "169" },
  ];

  // Fetch produk e-toll
  const fetchETollOptions = async (providerId: string) => {
    setLoading(true);
    setError(null);
    setETollOptions([]);
    try {
      const response = await fetch(
        `https://mitra.agpaiidigital.org/api/filter-products?category_id=20&operator_id=${providerId}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${auth?.token || ""}`,
          },
        }
      );
      const data = await response.json();

      console.log("Fetch e-toll products response:", data); // Debugging

      if (!response.ok || !data.results) {
        throw new Error(data.message || "Gagal mengambil data produk e-toll");
      }

      const options = data.results
        .filter((item: any) => item.category === "ETOLL")
        .map((item: any) => ({
          id: item.code,
          value: item.price,
          name: item.name,
          label: `Rp ${item.price.toLocaleString("id-ID")}`,
        }));
      setETollOptions(options);
    } catch (err: any) {
      console.error("Fetch e-toll products error:", err); // Debugging
      setError(err.message || "Terjadi kesalahan saat mengambil data produk e-toll");
      setETollOptions([]);
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

        console.log("Fetch payment channels response:", data); // Debugging

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
      } catch (err: any) {
        console.error("Fetch payment channels error:", err); // Debugging
        setError("Terjadi kesalahan saat mengambil metode pembayaran");
      }
    };

    fetchChannels();
  }, [auth?.token]);

  // Fetch produk e-toll saat operatorId berubah
  useEffect(() => {
    if (operatorId) {
      fetchETollOptions(operatorId);
    }
  }, [operatorId]);

  // Validasi voucher
  const validateVoucher = async () => {
    if (!voucherCode || !selectedCode) {
      setVoucherError("Masukkan kode voucher dan pilih nominal e-toll terlebih dahulu");
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
      console.log("Voucher validation response:", data); // Debugging
      if (response.ok && data.success) {
        setOriginalPrice(data.original_price);
        setFinalPrice(data.final_price);
      } else {
        throw new Error(data.message || "Kode voucher tidak valid");
      }
    } catch (err: any) {
      console.error("Voucher validation error:", err); // Debugging
      setVoucherError(err.message || "Terjadi kesalahan saat memvalidasi voucher");
      setOriginalPrice(null);
      setFinalPrice(null);
    } finally {
      setLoading(false);
    }
  };

  // Handler perubahan nomor kartu
  const handleNoKartuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNoKartu = e.target.value;
    setNoKartu(newNoKartu);
    setSelectedNominal(null);
    setSelectedCode(null);
    setOriginalPrice(null);
    setFinalPrice(null);
    setVoucherCode("");
    setVoucherError(null);
    // Validasi nomor kartu (asumsi 16 digit)
    if (newNoKartu && !/^\d{16}$/.test(newNoKartu)) {
      setError("Nomor kartu e-toll harus 16 digit angka!");
    } else {
      setError(null);
    }
  };

  // Handler perubahan nomor telepon
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhone = e.target.value;
    setPhone(newPhone);
    // Validasi nomor telepon (asumsi format Indonesia: 10-13 digit, dimulai dengan 08)
    if (newPhone && !/^08\d{8,11}$/.test(newPhone)) {
      setError("Nomor telepon harus berformat Indonesia (contoh: 081234567890)!");
    } else {
      setError(null);
    }
  };

  // Handler perubahan kode voucher
  const handleVoucherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVoucherCode(e.target.value);
    setVoucherError(null);
    setOriginalPrice(null);
    setFinalPrice(null);
  };

  // Handler pemilihan provider
  const handleProviderSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedProviderId = e.target.value;
    setOperatorId(selectedProviderId);
    setSelectedNominal(null);
    setSelectedCode(null);
    setETollOptions([]);
    setOriginalPrice(null);
    setFinalPrice(null);
    setVoucherCode("");
    setVoucherError(null);
  };

  // Handler pemilihan nominal
  const handleNominalSelect = (item: { id: string; value: number; label: string }) => {
    setSelectedNominal(item.value.toString());
    setSelectedCode(item.id);
    setOriginalPrice(null);
    setFinalPrice(null);
    setVoucherError(null);
    if (voucherCode) {
      validateVoucher();
    }
  };

  // Handler submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noKartu || !phone || !selectedNominal || !selectedCode || !operatorId || !paymentMethod) {
      alert("Harap isi nomor kartu, nomor telepon, pilih nominal e-toll, pilih provider, dan pilih metode pembayaran!");
      return;
    }
    if (!/^\d{16}$/.test(noKartu)) {
      alert("Nomor kartu e-toll harus 16 digit angka!");
      return;
    }
    if (!/^08\d{8,11}$/.test(phone)) {
      alert("Nomor telepon harus berformat Indonesia (contoh: 081234567890)!");
      return;
    }
    if (voucherCode && voucherError) {
      alert("Kode voucher tidak valid!");
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
            no_kartu: noKartu,
            no_meter_pln: "",
            pin: "3456",
            method: paymentMethod,
            phone: phone,
    		customer_name: auth.name || undefined,
            customer_email: auth.email || undefined,
            voucher_code: voucherCode || undefined,
          }),
        }
      );

      const result = await response.json();
      console.log("Transaction response:", result); // Debugging
      if (result.success && result.checkout_url) {
        setOriginalPrice(result.original_price);
        setFinalPrice(result.final_price);
        window.location.href = result.checkout_url;
      } else {
        throw new Error(result.message || "Gagal transaksi e-toll");
      }
    } catch (err: any) {
      console.error("Transaction error:", err); // Debugging
      setError(err.message || "Terjadi kesalahan saat memproses transaksi");
      alert(err.message || "Terjadi kesalahan saat memproses transaksi");
    } finally {
      setLoading(false);
    }
  };

  // Calculate subtotal
  const subtotal = selectedCode
    ? eTollOptions.find((option) => option.id === selectedCode)?.value || 0
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
          <label className="block text-sm font-medium text-slate-700">Nomor Kartu E-toll</label>
          <input
            type="text"
            placeholder="Masukkan nomor kartu e-toll (contoh: 1234567890123456)"
            value={noKartu}
            onChange={handleNoKartuChange}
            className="mt-2 w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#009788]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Nomor Telepon</label>
          <input
            type="tel"
            placeholder="Contoh: 081234567890"
            value={phone}
            onChange={handlePhoneChange}
            className="mt-2 w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#009788]"
          />
          {loading && <p className="mt-2 text-sm text-gray-500">Memuat data...</p>}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">Pilih Provider E-toll</label>
          <select
            value={operatorId || ""}
            onChange={handleProviderSelect}
            className="w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#009788]"
          >
            <option value="" disabled>
              Pilih provider e-toll
            </option>
            {eTollProviders.map((provider) => (
              <option key={provider.provider_id} value={provider.provider_id}>
                {provider.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">Pilih Nominal E-toll</label>
          {eTollOptions.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {eTollOptions.map((item) => (
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
              {loading ? "Memuat nominal..." : "Pilih provider e-toll untuk melihat nominal"}
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
          disabled={loading || !operatorId || !selectedNominal || eTollOptions.length === 0 || !paymentMethod || !phone || (voucherCode && voucherError)}
          className={clsx(
            "w-full py-3 rounded-lg shadow-md transition",
            loading || !operatorId || !selectedNominal || eTollOptions.length === 0 || !paymentMethod || !phone || (voucherCode && voucherError)
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-[#009788] text-white hover:bg-[#007f6d]"
          )}
        >
          {loading ? "Memproses..." : "Beli E-toll"}
        </button>
      </form>
    </div>
  );
}