/**
 * Get user-friendly error message based on error response
 */
export const getErrorMessage = (error: any, context?: string): string => {
  // Check if error has response from API
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message;

    switch (status) {
      case 400:
        return message || "Data yang Anda masukkan tidak valid";
      case 401:
        return context === "login" 
          ? "Email/NIK atau password salah" 
          : "Sesi Anda telah berakhir. Silakan login kembali";
      case 403:
        return "Anda tidak memiliki akses untuk melakukan ini";
      case 404:
        return context === "user" 
          ? "Pengguna tidak ditemukan" 
          : "Data tidak ditemukan";
      case 422:
        return message || "Data yang Anda masukkan tidak valid";
      case 429:
        return "Terlalu banyak percobaan. Silakan coba lagi nanti";
      case 500:
        return "Terjadi kesalahan pada server. Silakan coba lagi";
      case 503:
        return "Layanan sedang dalam pemeliharaan. Silakan coba lagi nanti";
      default:
        return message || "Terjadi kesalahan. Silakan coba lagi";
    }
  }

  // Network error
  if (error.message === "Network Error") {
    return "Tidak dapat terhubung ke server. Periksa koneksi internet Anda";
  }

  // Default error
  return error.message || "Terjadi kesalahan. Silakan coba lagi";
};

/**
 * Get validation error message for specific field
 */
export const getValidationError = (field: string, value: any): string | null => {
  switch (field) {
    case "nik":
      if (!value) return "Nomor NIK wajib diisi";
      if (value.length < 16) return "Nomor NIK Anda harus berisi setidaknya 16 angka";
      if (value.length > 16) return "Nomor NIK tidak boleh lebih dari 16 angka";
      return null;
    
    case "email":
      if (!value) return "Email wajib diisi";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Format email tidak valid";
      return null;
    
    case "password":
      if (!value) return "Password wajib diisi";
      if (value.length < 8) return "Password minimal 8 karakter";
      return null;
    
    case "password_confirmation":
      if (!value) return "Konfirmasi password wajib diisi";
      return null;
    
    case "name":
      if (!value) return "Nama wajib diisi";
      if (value.length < 3) return "Nama minimal 3 karakter";
      return null;
    
    case "no_hp":
      if (!value) return "Nomor HP wajib diisi";
      if (value.length < 10) return "Nomor HP minimal 10 digit";
      return null;
    
    default:
      return null;
  }
};
