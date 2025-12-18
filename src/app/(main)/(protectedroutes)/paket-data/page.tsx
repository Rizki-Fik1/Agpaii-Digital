"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/utils/context/auth_context";
import clsx from "clsx";
import Link from "next/link";

export default function DataForm() {
  const [phone, setPhone] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [operatorId, setOperatorId] = useState<string | null>(null);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [originalPrice, setOriginalPrice] = useState<number | null>(null);
  const [finalPrice, setFinalPrice] = useState<number | null>(null);
  const [pin, setPin] = useState("3456");
  const { auth } = useAuth();

  const [dataOptions, setDataOptions] = useState<
    { id: string; value: number; name: string; label: string }[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [paymentChannels, setPaymentChannels] = useState<
    { code: string; name: string; group: string; total_fee: { flat: number; percent: string } }[]
  >([]);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mapping provider ke operator_id
  const providerToOperatorId: Record<string, string> = {
    Telkomsel: "29",
    XL: "44",
    Indosat: "13",
    Tri: "36",
    Smartfren: "26",
    Axis: "1",
    ByU: "159",
  };

  // Prefix deteksi provider
  const providerPrefixes: Record<string, string[]> = {
    Telkomsel: ["0811", "0812", "0813", "0821", "0822", "0823", "0852", "0853", "0851"],
    XL: ["0817", "0818", "0819", "0859", "0877", "0878"],
    Indosat: ["0814", "0815", "0816", "0855", "0856", "0857", "0858"],
    Tri: ["0896", "0897", "0898", "0899"],
    Smartfren: ["0881", "0882", "0883", "0884", "0885", "0886", "0887", "0888", "0889"],
    Axis: ["0838", "0831", "0832", "0833"],
    ByU: ["0851"],
  };

  // Mapping kode channel pembayaran dari API ke kode yang diharapkan backend
  const paymentMethodMapping: Record<string, string> = {
    BRI: "BRIVA",
    MANDIRI: "MANDIRIVA",
    BNI: "BNIVA",
    QRIS: "QRIS",
  };

  const detectProviderByPrefix = (phoneNumber: string) => {
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    const prefix = cleanPhone.slice(0, 4);
    for (const [providerName, prefixes] of Object.entries(providerPrefixes)) {
      if (prefixes.includes(prefix)) return providerName;
    }
    return null;
  };

  // Fetch paket data (category_id = 2)
  const fetchDataOptions = async (phoneNumber: string, operatorId: string) => {
    setLoading(true);
    setError(null);
    setDataOptions([]);
    setCurrentPage(1);
    try {
      const response = await fetch(
        `https://mitra.agpaiidigital.org/api/filter-products?category_id=2`,
        { headers: { Accept: "application/json" } }
      );
      const data = await response.json();

      if (!response.ok || !data.results) {
        throw new Error(data.message || "Gagal mengambil data paket");
      }

      const detectedProvider = detectProviderByPrefix(phoneNumber);
      const filteredResults = data.results.filter((item: any) =>
        detectedProvider
          ? item.name.toLowerCase().includes(detectedProvider.toLowerCase())
          : true
      );

      if (filteredResults.length === 0) {
        throw new Error(`Tidak ada paket data tersedia untuk provider ${detectedProvider}`);
      }

      const options = filteredResults.map((item: any) => ({
        id: item.code,
        value: item.price,
        name: item.name,
        label: `Rp ${item.price.toLocaleString("id-ID")}`,
      }));
      setDataOptions(options);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat ambil data");
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
          if (channels.length > 0) setPaymentMethod(channels[0].code);
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
      setVoucherError("Masukkan kode voucher dan pilih paket data terlebih dahulu");
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhone = e.target.value;
    setPhone(newPhone);
    setSelectedPackage(null);
    setSelectedCode(null);
    setProvider(null);
    setOperatorId(null);
    setDataOptions([]);
    setCurrentPage(1);
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
        fetchDataOptions(newPhone, detectedOperatorId);
      } else {
        setError("Nomor tidak dikenali!");
      }
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
    if (!phone || !selectedCode || !provider || !paymentMethod) {
      alert("Isi nomor, pilih paket, pastikan provider valid, dan pilih metode pembayaran!");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("https://mitra.agpaiidigital.org/api/tripay/ppob/transaksi/pembelian", {
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
          pin: pin,
          no_meter_pln: "",
          method: paymentMethod,
          customer_phone: phone,
    		customer_name: auth.name || undefined,
            customer_email: auth.email || undefined,
          voucher_code: voucherCode || undefined,
        }),
      });

      const result = await response.json();
      if (result.success && result.checkout_url) {
        setOriginalPrice(result.original_price);
        setFinalPrice(result.final_price);
        window.location.href = result.checkout_url;
      } else {
        throw new Error(result.message || "Gagal transaksi paket data");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
      alert(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  // Calculate subtotal
  const subtotal = selectedCode
    ? dataOptions.find((option) => option.id === selectedCode)?.value || 0
    : 0;

  // Calculate voucher discount
  const voucherDiscount =
    finalPrice && originalPrice && finalPrice !== originalPrice
      ? originalPrice - finalPrice
      : 0;

  // Calculate total
  const total = finalPrice !== null && voucherDiscount > 0 ? finalPrice : subtotal;

  const totalPages = Math.ceil(dataOptions.length / itemsPerPage);
  const paginatedData = dataOptions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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

      <form onSubmit={handleSubmit} className="space-y-6 px-6 sm:px-8">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nomor HP</label>
          <input
            type="tel"
            placeholder="Contoh: 081234567890"
            value={phone}
            onChange={handlePhoneChange}
            className="mt-2 w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          {loading && <p className="mt-2 text-sm text-gray-500">Memuat data...</p>}
          {phone && provider && (
            <p className="mt-2 text-sm text-green-600">Provider: {provider}</p>
          )}
          {phone && !provider && !loading && phone.replace(/\D/g, "").length >= 4 && (
            <p className="mt-2 text-sm text-red-600">
              Nomor tidak dikenali sebagai provider yang valid!
            </p>
          )}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Pilih Metode Pembayaran</label>
          {paymentChannels.length > 0 ? (
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600"
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Pilih Paket Data</label>
          {paginatedData.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {paginatedData.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedPackage(item.name);
                    setSelectedCode(item.id);
                    setVoucherError(null);
                    setOriginalPrice(null);
                    setFinalPrice(null);
                    if (voucherCode) {
                      validateVoucher();
                    }
                  }}
                  className={clsx(
                    "cursor-pointer rounded-xl border p-4 text-center shadow-md transition hover:shadow-lg",
                    selectedCode === item.id
                      ? "border-green-600 bg-green-50 text-green-700 font-semibold"
                      : "border-gray-200 bg-white text-gray-700"
                  )}
                >
                  <p className="text-lg font-bold">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.label}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              {loading ? "Memuat paket..." : "Masukkan nomor telepon untuk melihat paket data"}
            </p>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-4">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={clsx(
                  "px-3 py-1 rounded-lg",
                  currentPage === 1
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                )}
              >
                Previous
              </button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={clsx(
                  "px-3 py-1 rounded-lg",
                  currentPage === totalPages
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                )}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {selectedCode && (
          <div className="border-t pt-4">
            <div className="flex justify-between text-sm text-gray-700">
              <span>Subtotal:</span>
              <span>Rp {subtotal.toLocaleString("id-ID")}</span>
            </div>
            {voucherDiscount > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>Potongan Voucher:</span>
                <span>- Rp {voucherDiscount.toLocaleString("id-ID")}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-gray-700 mt-2">
              <span>Total:</span>
              <span>Rp {total.toLocaleString("id-ID")}</span>
            </div>
          </div>
        )}
        <div className="voucher-input">
          <label className="block text-sm font-medium text-gray-700">Kode Voucher</label>
          <div className="flex space-x-2 mt-2">
            <input
              type="text"
              placeholder="Masukkan kode voucher"
              value={voucherCode}
              onChange={handleVoucherChange}
              onBlur={validateVoucher}
              className="w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            <button
              type="button"
              onClick={validateVoucher}
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Cek
            </button>
          </div>
          {voucherError && <p className="mt-2 text-sm text-red-600">{voucherError}</p>}
          {finalPrice && originalPrice && finalPrice !== originalPrice && (
            <p className="mt-2 text-sm text-green-600">
              Harga setelah diskon: Rp {finalPrice.toLocaleString("id-ID")} (Harga asli: Rp {originalPrice.toLocaleString("id-ID")})
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !provider || !selectedCode || dataOptions.length === 0 || !paymentMethod}
          className={clsx(
            "w-full py-3 rounded-lg shadow-md transition",
            loading || !provider || !selectedCode || dataOptions.length === 0 || !paymentMethod
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
          )}
        >
          {loading ? "Memproses..." : "Beli Paket Data"}
        </button>
      </form>
    </div>
  );
}