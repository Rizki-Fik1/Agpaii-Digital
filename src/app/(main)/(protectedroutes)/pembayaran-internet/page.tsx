"use client";

import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { useAuth } from "@/utils/context/auth_context";
import Link from "next/link";

export default function InternetBillCheckForm() {
  const [phone, setPhone] = useState("");
  const [noPelanggan, setNoPelanggan] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [displayValue, setDisplayValue] = useState(""); // State for input display
  const { auth } = useAuth();
  const [products, setProducts] = useState<
    { id: string; name: string; label: string; admin_fee: number }[]
  >([]);
  const [billDetails, setBillDetails] = useState<{
    tagihan_id: string;
    jumlah_tagihan: number;
    nama: string;
    periode: string;
    api_trxid: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const user_id = auth.id; // Asumsi auth context menyediakan user_id

  // Fetch Internet products
  const fetchInternetProducts = async () => {
    setLoading(true);
    setError(null);
    setProducts([]);

    try {
      const response = await fetch(
        "https://mitra.agpaiidigital.org/api/tripay/postpaid/products?operator_id=101",
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();
      if (!response.ok || !data.products) {
        throw new Error(data.message || "Gagal mengambil data produk Internet");
      }

      const options = data.products
        .filter((item) => item.status === 1)
        .map((item) => ({
          id: item.code,
          name: item.product_name || "Unknown Product",
          label: `${item.product_name} (Biaya Admin: Rp ${item.biaya_admin?.toLocaleString("id-ID") || 0})`,
          admin_fee: item.biaya_admin || 0,
        }));
      setProducts(options);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat mengambil data produk");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Load products on mount
  useEffect(() => {
    fetchInternetProducts();
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter products based on search term
  const filteredProducts = products.filter((item) =>
    item.name?.trim().toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setDisplayValue(value); // Update display value
    setIsDropdownOpen(true);
    setHighlightedIndex(-1);
    setSelectedProduct(null); // Reset selected product when typing
  };

  // Handle product selection
  const selectProduct = (productId: string | null) => {
    const selected = products.find((p) => p.id === productId);
    setSelectedProduct(productId);
    setDisplayValue(selected ? selected.name : ""); // Set display value to product name
    setSearchTerm(""); // Reset search term to show all products next time
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
  };

  // Handle input focus
  const handleInputFocus = () => {
    setIsDropdownOpen(true);
    setSearchTerm(""); // Clear search term to show all products
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen || filteredProducts.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredProducts.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      selectProduct(filteredProducts[highlightedIndex].id);
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false);
      setHighlightedIndex(-1);
    }
  };

  // Handle bill check submission
  const handleCheckBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !noPelanggan || !selectedProduct) {
      setError("Harap isi nomor telepon, nomor pelanggan, dan pilih produk Internet!");
      return;
    }

    setLoading(true);
    setError(null);
    setBillDetails(null);

    try {
      const response = await fetch(
        "https://mitra.agpaiidigital.org/api/ppob-transaction/check-bill",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            product: selectedProduct,
            phone,
            no_pelanggan: noPelanggan,
            pin: "3456",
          }),
        }
      );

      const result = await response.json();
      if (result.success && result.data) {
        setBillDetails({
          id: result.data.id,
          tagihan_id: result.data.tagihan_id,
          jumlah_tagihan: parseInt(result.data.jumlah_tagihan, 10),
          nama: result.data.nama,
          periode: result.data.periode,
          api_trxid: result.data.api_trxid,
        });
      } else {
        throw new Error(result.message || "Gagal memeriksa tagihan");
      }
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat memeriksa tagihan");
    } finally {
      setLoading(false);
    }
  };

  // Handle proceed to payment
  const handleProceedToPayment = async () => {
    if (!billDetails || !selectedProduct) {
      setError("Tidak ada tagihan atau produk untuk diproses");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "https://mitra.agpaiidigital.org/api/ppob-transaction/store-postpaid",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            user_id,
            order_id: billDetails.id,
            code: selectedProduct,
            api_trxid: billDetails.api_trxid,
            pin: "3456",
            method: "QRIS",
            customer_phone: phone,
    		customer_name: auth.name || undefined,
            customer_email: auth.email || undefined,
            amount: billDetails.jumlah_tagihan,
            phone,
            no_pelanggan: noPelanggan,
          }),
        }
      );

      const result = await response.json();
      if (result.success && result.checkout_url) {
        window.location.href = result.checkout_url;
      } else {
        throw new Error(result.message || "Gagal memproses pembayaran");
      }
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat memproses pembayaran");
      alert(err.message || "Terjadi kesalahan saat memproses pembayaran");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-6">
      <Link href="/ecommerce">
        <button className="mb-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">
          Kembali ke AGPAY
        </button>
      </Link>
      <form onSubmit={handleCheckBill} className="px-6 sm:px-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700">Nomor HP</label>
          <input
            type="tel"
            placeholder="Contoh: 081234567890"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-2 w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#009788]"
          />
        </div>

        <div ref={dropdownRef}>
          <label className="block text-sm font-medium text-slate-700 mb-3">Pilih Produk Internet</label>
          <input
            ref={inputRef}
            type="text"
            placeholder={selectedProduct ? products.find((p) => p.id === selectedProduct)?.name || "Pilih produk Internet" : "Pilih produk Internet"}
            value={displayValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            className="mt-2 w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#009788]"
            disabled={loading || products.length === 0}
          />
          {isDropdownOpen && (
            <div className="relative">
              <ul className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((item, index) => (
                    <li
                      key={item.id}
                      onClick={() => selectProduct(item.id)}
                      className={clsx(
                        "px-4 py-2 text-sm cursor-pointer transition",
                        highlightedIndex === index
                          ? "bg-[#009788] text-white"
                          : "text-slate-700 hover:bg-[#009788]/10"
                      )}
                    >
                      {item.label}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-sm text-gray-500">
                    {loading ? "Memuat produk Internet..." : "Tidak ada produk ditemukan"}
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Nomor Pelanggan</label>
          <input
            type="text"
            placeholder="Masukkan nomor pelanggan Internet"
            value={noPelanggan}
            onChange={(e) => setNoPelanggan(e.target.value)}
            className="mt-2 w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#009788]"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading || !phone || !noPelanggan || !selectedProduct}
          className={clsx(
            "w-full py-3 rounded-lg shadow-md transition",
            loading || !phone || !noPelanggan || !selectedProduct
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-[#009788] text-white hover:bg-[#007f6d]"
          )}
        >
          {loading ? "Memeriksa Tagihan..." : "Cek Tagihan"}
        </button>
      </form>

      {billDetails && (
        <div className="mt-6 px-6 sm:px-8 border-t pt-4">
          <h3 className="text-lg font-semibold text-slate-700">Detail Tagihan</h3>
          <div className="mt-2 space-y-2 text-sm text-slate-700">
            <div className="flex justify-between">
              <span>Tagihan ID:</span>
              <span>{billDetails.tagihan_id}</span>
            </div>
            <div className="flex justify-between">
              <span>Nama Pelanggan:</span>
              <span>{billDetails.nama}</span>
            </div>
            <div className="flex justify-between">
              <span>Periode:</span>
              <span>{billDetails.periode}</span>
            </div>
            <div className="flex justify-between">
              <span>Jumlah Tagihan:</span>
              <span>Rp {billDetails.jumlah_tagihan.toLocaleString("id-ID")}</span>
            </div>
            {selectedProduct && (
              <div className="flex justify-between">
                <span>Biaya Admin:</span>
                <span>
                  Rp{" "}
                  {products
                    .find((p) => p.id === selectedProduct)
                    ?.admin_fee.toLocaleString("id-ID")}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span>API Transaksi ID:</span>
              <span>{billDetails.api_trxid}</span>
            </div>
          </div>
          <button
            onClick={handleProceedToPayment}
            disabled={loading}
            className={clsx(
              "w-full mt-4 py-3 rounded-lg shadow-md transition",
              loading
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-[#009788] text-white hover:bg-[#007f6d]"
            )}
          >
            {loading ? "Memproses..." : "Lanjut ke Pembayaran"}
          </button>
        </div>
      )}
    </div>
  );
}