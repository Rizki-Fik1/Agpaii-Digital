"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import clsx from "clsx";
import { useAuth } from "@/utils/context/auth_context";
import Link from "next/link";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function PBBBillCheckForm() {
  const [phone, setPhone] = useState("");
  const [noPelanggan, setNoPelanggan] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
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

  const user_id = auth.id;

  // Debounce function for search
  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // Fetch PBB products
  const fetchPBBProducts = async () => {
    setLoading(true);
    setError(null);
    setProducts([]);

    try {
      console.log("Fetching PBB products from API...");
      const response = await fetch(
        "https://mitra.agpaiidigital.org/api/tripay/postpaid/products?operator_id=99",
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      console.log("API Response Status:", response.status);
      const data = await response.json();
      console.log("API Response Data:", data);

      if (!response.ok || !data.products) {
        throw new Error(data.message || "Gagal mengambil data produk PBB");
      }

      const options = data.products
        .filter((item: any) => item.status === 1)
        .map((item: any) => {
          const productName = item.product_name || "Unknown Product";
          return {
            id: item.code,
            name: productName,
            label: `${productName} (Biaya Admin: Rp ${item.biaya_admin?.toLocaleString("id-ID") || 0})`,
            admin_fee: item.biaya_admin || 0,
          };
        });
      setProducts(options);
      console.log("PBB Products Loaded:", options);
    } catch (err: any) {
      console.error("Error fetching PBB products:", err);
      setError(err.message || "Terjadi kesalahan saat mengambil data produk");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Load products on mount
  useEffect(() => {
    console.log("useEffect triggered for product fetch");
    fetchPBBProducts();
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current !== event.target
      ) {
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search handler
  const filterProducts = useCallback(
    debounce((term: string) => setSearchTerm(term), 300),
    []
  );

  // Filter products based on name
  const filteredProducts = products.filter((item) => {
    const search = searchTerm.trim().toLowerCase();
    const name = item.name?.trim().toLowerCase() || "";
    const match = name.includes(search);
    console.log("Filtering:", { item: item.name, search, match });
    return match;
  });

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log("Search term:", value);
    filterProducts(value);
    setIsDropdownOpen(true);
    setHighlightedIndex(-1);
    if (!value) {
      setSelectedProduct(null); // Clear selection only if input is empty
    }
  };

  // Handle product selection
  const selectProduct = (productId: string | null) => {
    const selected = products.find((p) => p.id === productId);
    setSelectedProduct(productId);
    setSearchTerm(selected ? selected.name : "");
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedProduct(null);
    setSearchTerm("");
    setIsDropdownOpen(true);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  // Handle input focus
  const handleInputFocus = () => {
    setIsDropdownOpen(true);
    if (!selectedProduct) {
      setSearchTerm("");
    }
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
      setError("Harap isi nomor telepon, nomor pelanggan, dan pilih produk PBB!");
      return;
    }

    setLoading(true);
    setError(null);
    setBillDetails(null);

    try {
      console.log("Checking bill with:", { product: selectedProduct, phone, no_pelanggan: noPelanggan });
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
      console.log("Bill Check Response:", result);

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
    } catch (err: any) {
      console.error("Error checking bill:", err);
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
      console.log("Proceeding to payment with:", {
        user_id,
        order_id: billDetails.id,
        code: selectedProduct,
        api_trxid: billDetails.api_trxid,
        method: "QRIS",
        customer_phone: phone,
        customer_name: auth.name || undefined,
        customer_email: auth.email || undefined,
        amount: billDetails.jumlah_tagihan,
      });
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
            order_id: billDetails.tagihan_id,
            code: selectedProduct,
            api_trxid: billDetails.api_trxid,
            pin: "3456",
            method: "QRIS",
            customer_phone: phone,
            customer_name: auth.name || undefined,
            customer_email: auth.email || undefined,
            amount: billDetails.jumlah_tagihan,
          }),
        }
      );

      const result = await response.json();
      console.log("Payment Response:", result);

      if (result.success && result.checkout_url) {
        window.location.href = result.checkout_url;
      } else {
        throw new Error(result.message || "Gagal memproses pembayaran");
      }
    } catch (err: any) {
      console.error("Error proceeding to payment:", err);
      setError(err.message || "Terjadi kesalahan saat memproses pembayaran");
      alert(err.message || "Terjadi kesalahan saat memproses pembayaran");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-6 px-4 sm:px-0">
      <Link href="/ecommerce">
        <button className="mb-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">
          Kembali ke AGPAY
        </button>
      </Link>
      <form onSubmit={handleCheckBill} className="space-y-6 bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nomor HP</label>
          <input
            type="tel"
            placeholder="Contoh: 081234567890"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-grey-500"
            disabled={loading}
          />
        </div>

        <div ref={dropdownRef}>
          <label className="block text-sm font-medium text-gray-700">Pilih Produk PBB</label>
          <div className="relative mt-2">
            <input
              ref={inputRef}
              type="text"
              placeholder={selectedProduct ? products.find((p) => p.id === selectedProduct)?.name || "Pilih produk PBB" : "Cari produk PBB..."}
              value={searchTerm}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-grey-500 pr-10"
              disabled={loading || products.length === 0}
              aria-autocomplete="list"
              aria-controls="product-list"
              aria-expanded={isDropdownOpen}
            />
            {selectedProduct && (
              <button
                type="button"
                onClick={clearSelection}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label="Hapus pilihan produk"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
            {isDropdownOpen && (
              <ul
                id="product-list"
                className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                role="listbox"
              >
                {loading ? (
                  <li className="px-4 py-2 text-sm text-gray-500 flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-grey-500" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z" />
                    </svg>
                    Memuat produk...
                  </li>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((item, index) => (
                    <li
                      key={item.id}
                      onClick={() => selectProduct(item.id)}
                      className={clsx(
                        "px-4 py-2 text-sm cursor-pointer transition",
                        highlightedIndex === index
                          ? "bg-grey-500 text-white"
                          : "text-gray-700 hover:bg-grey-50"
                      )}
                      role="option"
                      aria-selected={highlightedIndex === index}
                    >
                      {item.label}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-sm text-gray-500">
                    Tidak ada produk PBB yang cocok dengan pencarian
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Nomor Objek Pajak (NOP)</label>
          <input
            type="text"
            placeholder="Masukkan Nomor Objek Pajak (NOP)"
            value={noPelanggan}
            onChange={(e) => setNoPelanggan(e.target.value)}
            className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-grey-500"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !phone || !noPelanggan || !selectedProduct}
          className={clsx(
            "w-full py-3 rounded-lg shadow-md transition font-medium",
            loading || !phone || !noPelanggan || !selectedProduct
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-grey-600 text-white hover:bg-grey-700"
          )}
        >
          {loading ? "Memeriksa Tagihan..." : "Cek Tagihan"}
        </button>
      </form>

      {billDetails && (
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6 sm:p-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Detail Tagihan</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex justify-between">
              <span className="font-medium">Tagihan ID:</span>
              <span>{billDetails.tagihan_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Nama Wajib Pajak:</span>
              <span>{billDetails.nama}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Periode:</span>
              <span>{billDetails.periode}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Jumlah Tagihan:</span>
              <span>Rp {billDetails.jumlah_tagihan.toLocaleString("id-ID")}</span>
            </div>
            {selectedProduct && (
              <div className="flex justify-between">
                <span className="font-medium">Biaya Admin:</span>
                <span>
                  Rp{" "}
                  {products
                    .find((p) => p.id === selectedProduct)
                    ?.admin_fee.toLocaleString("id-ID")}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-medium">API Transaksi ID:</span>
              <span>{billDetails.api_trxid}</span>
            </div>
          </div>
          <button
            onClick={handleProceedToPayment}
            disabled={loading}
            className={clsx(
              "w-full mt-6 py-3 rounded-lg shadow-md transition font-medium",
              loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-grey-600 text-white hover:bg-grey-700"
            )}
          >
            {loading ? "Memproses..." : "Lanjut ke Pembayaran"}
          </button>
        </div>
      )}
    </div>
  );
}