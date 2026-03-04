import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCheckCircle,
  FiExternalLink,
  FiClipboard,
  FiInfo,
  FiLock,
  FiUsers,
  FiSearch,
} from "react-icons/fi";

interface MitraDetailContentProps {
  subtitle: string;
  description: string;
  images: string[];
  isConfirmed: boolean;
  onConfirm: () => void;
  onExternalUrlClick: () => void;
  canRegister?: boolean;
  isOwner?: boolean;
  applicants?: any[];
  loadingApplicants?: boolean;
}

const MitraDetailContent: React.FC<MitraDetailContentProps> = ({
  subtitle,
  description,
  images,
  isConfirmed,
  onConfirm,
  onExternalUrlClick,
  canRegister = true,
  isOwner = false,
  applicants = [],
  loadingApplicants = false,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 -mt-4">
      {/* Header Image / Carousel */}
      <div className="relative h-72 sm:h-96 w-full bg-gray-100 z-0 group">
        {images && images.length > 0 ? (
          <div className="w-full h-full overflow-x-auto flex snap-x snap-mandatory scrollbar-hide">
            {images.map((img, index) => (
              <div
                key={index}
                className="min-w-full h-full snap-center relative"
              >
                <img
                  src={img}
                  alt={`${subtitle} - ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                    {index + 1} / {images.length}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-full bg-slate-200 flex items-center justify-center">
            <span className="text-slate-400 font-medium">
              No Image Available
            </span>
          </div>
        )}

        {/* Navigation Hint (only if multiple) */}
        {images && images.length > 1 && (
          <div className="absolute top-1/2 left-0 w-full flex justify-between px-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-black/30 p-2 rounded-full text-white backdrop-blur-sm">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </div>
            <div className="bg-black/30 p-2 rounded-full text-white backdrop-blur-sm">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        )}

        {/* Gradient Overlay removed */}
      </div>

      {/* Content Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl p-6 sm:p-10 border border-gray-100"
        >
          {/* Header Strings (Moved from Banner) */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Mitra Resmi
              </span>
              {isConfirmed && (
                <span className="bg-blue-50 text-blue-600 border border-blue-100 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <FiCheckCircle className="text-blue-500" /> Terdaftar
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
              {subtitle}
            </h1>
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3 flex items-center gap-2">
            <div className="bg-gray-100 p-2 rounded-lg text-gray-600">
              <FiClipboard className="w-5 h-5" />
            </div>
            Deskripsi Program
          </h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">
            {description || "Tidak ada deskripsi tersedia."}
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid gap-4"
        >
          {/* CONFIRM / REGISTER BUTTON */}
          <button
            disabled={isConfirmed || !canRegister}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 ${
              isConfirmed
                ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none"
                : !canRegister
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-green-200"
            }`}
            onClick={canRegister && !isConfirmed ? onConfirm : undefined}
          >
            {isConfirmed ? (
              <>
                <FiCheckCircle /> Anda Sudah Terdaftar
              </>
            ) : !canRegister ? (
              <>
                <FiLock /> Pendaftaran Ditutup untuk Mitra
              </>
            ) : (
              "Konfirmasi Data Diri"
            )}
          </button>

          {/* EXTERNAL LINK */}
          <button
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 ${
              isConfirmed
                ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-blue-200"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
            onClick={onExternalUrlClick}
            disabled={!isConfirmed}
          >
            {isConfirmed ? (
              <>
                <FiExternalLink /> Buka Tautan Eksternal
              </>
            ) : (
              "Isi Form Dahulu"
            )}
          </button>
        </motion.div>

        {!isConfirmed && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
            <div className="bg-yellow-100 p-1.5 rounded-full text-yellow-600 mt-0.5">
              <FiInfo className="w-4 h-4" />
            </div>
            <p className="text-yellow-800 text-sm leading-relaxed">
              {canRegister ? (
                <strong>
                  Perhatian: Anda perlu mengonfirmasi data diri Anda terlebih
                  dahulu sebelum dapat mengakses layanan eksternal dari mitra
                  ini.
                </strong>
              ) : (
                <span>
                  Akun Mitra tidak dapat mendaftar pada program mitra lain.
                  Silakan login sebagai <strong>Guru</strong> untuk mendaftar.
                </span>
              )}
            </p>
          </div>
        )}

        {/* APPLICANT LIST (ONLY FOR OWNER) */}
        {isOwner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
          >
            <div className="p-6 sm:p-8 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <div className="bg-green-100 p-2.5 rounded-xl text-green-600">
                    <FiUsers className="w-6 h-6" />
                  </div>
                  Daftar Pendaftar ({applicants.length})
                </h2>
              </div>

              {loadingApplicants ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-12 h-12 border-4 border-green-100 border-t-green-600 rounded-full animate-spin"></div>
                  <p className="text-gray-500 font-medium">
                    Memuat data pendaftar...
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                        <th className="px-6 py-4 w-12 text-center">No</th>
                        <th className="px-6 py-4">Pendaftar</th>
                        <th className="px-6 py-4">KTA / Detail</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {applicants.length > 0 ? (
                        applicants.map((app: any, index: number) => (
                          <tr
                            key={app.id}
                            className="hover:bg-gray-50/50 transition-colors"
                          >
                            <td className="px-6 py-4 text-center font-medium text-gray-400">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold shrink-0">
                                  {app.user?.name?.charAt(0) || "U"}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-gray-900 truncate">
                                    {app.user?.name || "No Name"}
                                  </div>
                                  <div className="text-xs text-gray-500 truncate">
                                    {app.user?.email || "-"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-700">
                                {app.user?.kta_id || "No KTA"}
                              </div>
                              <div className="text-[10px] text-gray-400 uppercase font-bold mt-0.5">
                                {app.educationlevel?.nama || "Umum"}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center gap-3 opacity-40">
                              <FiSearch className="w-10 h-10" />
                              <p className="text-sm font-medium">
                                Tidak ada pendaftar ditemukan.
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MitraDetailContent;
