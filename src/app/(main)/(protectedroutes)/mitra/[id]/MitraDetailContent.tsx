import React from "react";
import { motion } from "framer-motion";
import { FiCheckCircle, FiExternalLink, FiClipboard, FiInfo, FiLock } from "react-icons/fi";

interface MitraDetailContentProps {
	subtitle: string;
	description: string;
	imageUrl: string;
	isConfirmed: boolean;
	onConfirm: () => void;
	onExternalUrlClick: () => void;
    canRegister?: boolean;
}

const MitraDetailContent: React.FC<MitraDetailContentProps> = ({
	subtitle,
	description,
	imageUrl,
	isConfirmed,
	onConfirm,
	onExternalUrlClick,
    canRegister = true,
}) => {
	return (
		<div className="min-h-screen bg-gray-50 pb-20 -mt-4">
            {/* Header Image */}
			<div className="relative h-72 sm:h-96 w-full overflow-hidden bg-gray-900 z-0">
                {imageUrl ? (
    				<img
    					src={imageUrl}
    					alt={subtitle}
    					className="w-full h-full object-cover"
    				/>
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-slate-800 to-gray-900"></div>
                )}
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 p-6 sm:p-10 text-white max-w-5xl w-full pb-24 sm:pb-28">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-wrap items-center gap-3 mb-4"
                    >
                         <span className="bg-green-500/90 backdrop-blur-sm shadow-sm text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                             <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                             Mitra Resmi
                         </span>
                         {isConfirmed && (
                            <span className="bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                <FiCheckCircle className="text-green-400" /> Terdaftar
                            </span>
                         )}
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl sm:text-4xl lg:text-5xl font-extrabold mb-2 shadow-sm leading-tight tracking-tight px-1"
                    >
                        {subtitle}
                    </motion.h1>
                </div>
			</div>

            {/* Content Container */}
			<div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-16 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-3xl shadow-2xl p-6 sm:p-10 border border-gray-100"
                >
    				<h2 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4 flex items-center gap-3">
                        <div className="bg-green-100 p-2.5 rounded-xl text-green-600">
                             <FiClipboard className="w-6 h-6" />
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
                    className="mt-8 grid gap-4 md:grid-cols-2"
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
                            {canRegister 
                                ? <strong>Perhatian: Anda perlu mengonfirmasi data diri Anda terlebih dahulu sebelum dapat mengakses layanan eksternal dari mitra ini.</strong>
                                : <span>Akun Mitra tidak dapat mendaftar pada program mitra lain. Silakan login sebagai <strong>Guru</strong> untuk mendaftar.</span>
                            }
                        </p>
                    </div>
                )}
			</div>
		</div>
	);
};

export default MitraDetailContent;
