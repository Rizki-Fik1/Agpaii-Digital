"use client";
import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import TopBar from "@/components/nav/topbar";
import API from "@/utils/api/config";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Product data model
interface Product {
  id: string | number;
  nama?: string;
  foto?: string;
  harga?: number;
  deskripsi?: string;
  user?: {
    name: string;
  };
}

// Minimal deleteProduct function – adjust to your own API authentication logic
async function deleteProduct(id: string | number) {
  // Example: your backend might require a token from cookies or localStorage
  // In Next.js, you might store it differently than AsyncStorage in React Native
  // For now, we call the same endpoint shown in your snippet:
  return API.delete(`/product/${id}`, {
    // If you need auth headers, attach them here
    // headers: { Authorization: 'Bearer ' + tokenFromSomewhere }
  });
}

const MyProductPage: NextPage = () => {
  const router = useRouter();
  const [data, setData] = useState<Product[]>([]);
  const [filteredData, setFilteredData] = useState<Product[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isPosting, setIsPosting] = useState<boolean>(false);
  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || "";

  // Fetch data produk dari API
  const loadData = async () => {
    try {
      setLoading(true);
      const productRes = await API.get<Product[]>("/my-products");
      setData(productRes.data);
      adjustData(productRes.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Menyesuaikan data agar jumlah item produk selalu genap
  const adjustData = (products: Product[]) => {
    const adjustedData = [...products];
    if (adjustedData.length % 2 !== 0) {
      adjustedData.push({ id: "dummy" });
    }
    setFilteredData(adjustedData);
  };

  // Fungsi pencarian produk berdasarkan nama
  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.trim() === "") {
      adjustData(data);
    } else {
      const filtered = data.filter((item) =>
        item.nama?.toLowerCase().includes(text.toLowerCase()),
      );
      adjustData(filtered);
    }
  };

  // Format harga ke format rupiah
  const formatRupiah = (price: number) => {
    const number = Number(price);
    if (isNaN(number)) return "";
    return `Rp${number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
  };

  // Fungsi untuk posting produk
  const handlePost = async (item: Product) => {
    const comment = `Saya telah memposting produk ${item.nama}, silahkan klik postingan ini untuk melihat produk terbaru saya`;
    const formData = new FormData();
    formData.append("body", comment);
  	formData.append("product_id", String(item.id));
    try {
      setIsPosting(true);
      const response = await API.post("post", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status === 200) {
        setIsPosting(false);
        router.push(`/marketplace/${item.id}`);
      }
    } catch (error: any) {
      setIsPosting(false);
      alert(
        "Terjadi Kesalahan" +
          (error.response ? error.response.data.message : error.message),
      );
    }
  };

  // Fungsi untuk menghapus produk
  const handleDelete = async (productId: string | number) => {
    // Mirroring the React Native approach with a confirm
    const confirmDelete = window.confirm(
      "Apakah Anda yakin ingin menghapus produk ini?",
    );
    if (!confirmDelete) return;
    try {
      await deleteProduct(productId);
      alert("Produk berhasil dihapus");
      // Refresh data
      loadData();
    } catch (error: any) {
      console.error("Error deleting product:", error?.response);
      alert("Gagal menghapus produk");
    }
  };



  return (
    <div className="pt-[4.2rem]">
      <TopBar withBackButton>Produk Saya</TopBar>
      <div className="container mx-auto p-4">
        {/* Search Bar */}
        <div className="flex mb-4">
          <input
            type="text"
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Cari produk"
            className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none"
          />
          <button
            className="bg-green-600 text-white px-4 rounded-r-lg"
            onClick={() => router.push("/marketplace/tambah-produk")}
          >
            + Tambah Produk
          </button>
        </div>
        {/* Grid Produk */}
        <div className="grid grid-cols-2 gap-4">
          {filteredData.map((item) => {
            if (item.id === "dummy") {
              return (
                <div key="dummy" className="invisible"></div>
              );
            }
            return (
              <div key={item.id}>
                <div className="bg-white rounded-lg shadow p-2 cursor-pointer hover:shadow-lg">
                  {/* Foto Produk */}
                  {item.foto && (
                    <img
                      src={`${STORAGE_URL}/${item.foto}`}
                      alt={item.nama}
                      className="w-full h-40 object-cover rounded-t-lg"
                    />
                  )}
                  <div className="p-2">
                    {/* Nama & Harga */}
                    <h3 className="text-sm font-bold text-gray-800 truncate">
                      {item.nama}
                    </h3>
                    <p className="text-sm font-semibold text-orange-500 my-1">
                      {formatRupiah(item.harga ?? 0)}
                    </p>
                    {/* Deskripsi */}
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {item.deskripsi}
                    </p>
                    {/* Nama User */}
                    <div className="mt-2">
                      <p className="text-xs text-gray-600 truncate">
                        {item.user?.name || "Nama User Tidak Tersedia"}
                      </p>
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex items-center justify-start mb-2 ml-2">
                    {/* Post Button */}
                    <button
                      onClick={() => handlePost(item)}
                      disabled={isPosting}
                      className="bg-blue-500 text-white px-2 py-1 text-sm rounded disabled:bg-gray-300"
                    >
                      {isPosting ? "Posting..." : "Post"}
                    </button>
                    {/* Edit Button */}
                    <Link
                      href={`/marketplace/produk-saya/${item.id}`}
                      className="bg-orange-900 text-white px-2 py-1 ml-1 text-sm rounded disabled:bg-gray-300"
                    >
                      Edit
                    </Link>
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="bg-red-600 text-white px-2 py-1 ml-1 text-sm rounded"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyProductPage;