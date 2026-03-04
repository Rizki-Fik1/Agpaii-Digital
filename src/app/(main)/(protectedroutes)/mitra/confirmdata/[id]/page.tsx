"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { useParams, useRouter } from "next/navigation";
import API from "@/utils/api/config";
import TopBar from "@/components/nav/topbar";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { 
    FiUser, 
    FiCreditCard, 
    FiCalendar, 
    FiPhone, 
    FiMapPin, 
    FiBookOpen, 
    FiSave, 
    FiAlertCircle, 
    FiCheckCircle, 
    FiUsers 
} from "react-icons/fi";

// --- Types ---
interface Credential {
	id: string;
	name: string;
	nik: string;
	nip: string;
	birthdate: string;
	gender: string;
	contact: string;
	educational_level_id: string;
	unit_kerja: string;
	headmaster_name: string;
	headmaster_nip: string;
	school_place: string;
	school_status: string;
}

const PartnerConfirmData: React.FC = () => {
    // --- Hooks ---
	const router = useRouter();
	const { id: mitraId } = useParams();

    // --- State ---
	const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
	const [isLoadingEdu, setIsLoadingEdu] = useState(true);
	const [eduLevel, setEduLevel] = useState<{ id: string; name: string }[]>([]);
	const [credential, setCredential] = useState<Credential>({
		id: "",
		name: "",
		nik: "",
		nip: "",
		birthdate: "",
		gender: "",
		contact: "",
		educational_level_id: "",
		unit_kerja: "",
		headmaster_name: "",
		headmaster_nip: "",
		school_place: "",
		school_status: "",
	});
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isRegistered, setIsRegistered] = useState(false);

    // --- Effects ---
	useEffect(() => {
		const fetchUserDataAndCheck = async () => {
			try {
                // 1. Get User Profile
				const response = await API.get("/me"); 
				const userData = response.data.profile;
                const userId = response.data.id;

				setCredential({
					id: userId,
					name: response.data.name,
					nik: userData.nik || "",
					nip: userData.nip || "",
					birthdate: userData.birthdate || "",
					gender: userData.gender || "",
					contact: userData.contact || "",
                    // Check if the key name is slightly different in API response
					educational_level_id: userData.educational_level_id || userData.education_level_id || "",
					unit_kerja: userData.unit_kerja || "",
					headmaster_name: userData.headmaster_name || "",
					headmaster_nip: userData.headmaster_nip || "",
					school_place: userData.school_place || "",
					school_status: userData.school_status || "",
				});
                
                // 2. Check Registration Status (checklistdata)
                // Use url from .env NEXT_PUBLIC_MITRA_URL or fallback to 2024.agpaiidigital.org
                const BASE_URL = "https://2024.agpaiidigital.org";
                // Route: /api/v2/member/mitra/checklistdata?user_id=...&mitra_id=...
                // Warning: Controller says Route::get('/mitra/checklistdata', ...);
                // If prefix is /api/v2/member, then: /api/v2/member/mitra/checklistdata
                try {
                    const checkUrl = `${BASE_URL}/api/v2/member/mitra/checklistdata?user_id=${userId}&mitra_id=${mitraId}`;
                    console.log("DEBUG: Checking status at", checkUrl);
                    const checkRes = await axios.get(checkUrl);
                    console.log("DEBUG: Check Status Response", checkRes.data);
                    
                    if (checkRes.data > 0) {
                        setIsRegistered(true);
                    }
                } catch (checkErr) {
                    console.error("Error checking status:", checkErr);
                    // If 404, assumes not registered yet.
                }

				setIsLoading(false);
			} catch (error) {
				console.error("Error fetching user data:", error);
				setIsLoading(false);
			}
		};

		const fetchEducationLevels = async () => {
			try {
				const response = await API.get("/educational-level");
                console.log("DEBUG: Education Levels", response.data);
				setEduLevel(response.data);
				setIsLoadingEdu(false);
			} catch (error) {
				console.error("Error fetching education levels:", error);
				setIsLoadingEdu(false);
			}
		};

		fetchUserDataAndCheck();
		fetchEducationLevels();
	}, [mitraId]);

    // --- Handlers ---
	const handleSave = async () => {
        if (isRegistered) return; // Prevent if already registered

        // Validation
        if (!credential.educational_level_id) {
             setErrorMessage("Jenjang Ajar wajib diisi. Silakan pilih Jenjang Ajar.");
             return;
        }

        setIsSaving(true);
		try {
            // Ensure IDs are integers
            const userId = parseInt(credential.id);
            const mitraIdInt = typeof mitraId === 'string' ? parseInt(mitraId) : mitraId;

			const postData = {
				user_id: userId,
				mitra_id: mitraIdInt,
				nama: credential.name,
				nik: credential.nik,
				tanggal_lahir: credential.birthdate,
				jenis_kelamin: credential.gender,
				no_hp: credential.contact,
				education_level_id: credential.educational_level_id,
                tempat_tugas: credential.school_place,
            };

            // Use correct API endpoint
            const apiUrl = "https://2024.agpaiidigital.org/api/v2/member/savemitra";
            
			await axios.post(apiUrl, postData);
			
            // Update local state
            setIsRegistered(true);

            // Success
            Swal.fire({
                icon: "success",
                title: "Berhasil!",
                text: "Data Anda berhasil dikonfirmasi.",
                confirmButtonColor: "#10B981",
            }).then(() => {
                // Stay on page or redirect? User asked to change button text, implies staying on page or viewing updated state.
                // But usually better to redirect back to detail.
                // Let's redirect back to detail as previous behavior, but maybe user wants to see the button change FIRST?
                // The snippet `router.push` was there. I will keep it but maybe delay or just change button text before redirecting?
                // Previous behavior was redirecting.
                // Request: "buat tulisan pada button konfirmasinya menjadi anda sudah terdaftar"
                // This implies if they revisit the page, it.should say that.
                // I will keep the redirect for now as it makes sense for "Save" action.
                // The button text change is primarily for when they revisit the page.
                router.push(`/mitra/${mitraId}`);
            });

		} catch (error: any) {
            console.error("Submit Error:", error);
			setErrorMessage(
				error.response ? error.response.data.message : error.message,
			);
            setIsSaving(false);
		}
	};

	const closeModal = () => {
		setErrorMessage(null);
	};

    // --- Render Helpers ---
    const InputField = ({ 
        label, 
        icon: Icon, 
        value, 
        onChange, 
        type = "text", 
        placeholder = "",
        disabled = false
    }: any) => (
        <div className="group">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-green-600 transition-colors">
                {label}
            </label>
            <div className={`relative flex items-center transition-all duration-300 ${disabled ? 'opacity-70 grayscale' : ''}`}>
                <div className="absolute left-4 text-gray-400 group-focus-within:text-green-500 transition-colors">
                    <Icon className="w-5 h-5" />
                </div>
                <input
                    disabled={disabled}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full bg-gray-50 text-gray-800 font-medium pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 outline-none transition-all duration-300
                        ${disabled 
                            ? 'cursor-not-allowed bg-gray-100 text-gray-500' 
                            : 'focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 hover:border-gray-300'
                        }
                    `}
                />
            </div>
        </div>
    );

    const SelectField = ({ label, icon: Icon, value, onChange, options, isLoading, disabled = false }: any) => (
         <div className="group">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-green-600 transition-colors">
                {label}
            </label>
            <div className={`relative flex items-center ${disabled ? 'opacity-70 grayscale' : ''}`}>
                <div className="absolute left-4 text-gray-400 group-focus-within:text-green-500 transition-colors">
                    {isLoading ? <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-green-500 rounded-full"></div> : <Icon className="w-5 h-5" />}
                </div>
                <select
                    disabled={disabled}
                    value={value}
                    onChange={onChange}
                    className={`w-full bg-gray-50 text-gray-800 font-medium pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 outline-none appearance-none transition-all duration-300
                        ${disabled 
                             ? 'cursor-not-allowed bg-gray-100 text-gray-500' 
                             : 'active:bg-white cursor-pointer focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 hover:border-gray-300'
                        }
                    `}
                >
                    <option value="">Pilih {label}</option>
                    {options.map((opt: any) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <div className="absolute right-4 text-gray-400 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>
        </div>
    );

	return (
		<div className="bg-gray-50 min-h-screen pt-[5rem] pb-20">
            <TopBar withBackButton>Konfirmasi Data</TopBar>

			{/* Error Modal */}
			{errorMessage && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal}></div>
					<motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm relative z-10 text-center"
                    >
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                            <FiAlertCircle className="w-8 h-8" />
                        </div>
						<h2 className="text-xl font-bold text-gray-800 mb-2">Terjadi Kesalahan</h2>
						<p className="text-gray-500 mb-6 text-sm">{errorMessage}</p>
						<button
							className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-medium w-full"
							onClick={closeModal}>
							Tutup
						</button>
					</motion.div>
				</div>
			)}
			
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
                {/* Header Section */}
                <div className="text-center mb-8 space-y-2">
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-2
                            ${isRegistered ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}
                        `}
                    >
                        <FiCheckCircle className="w-4 h-4" /> 
                        {isRegistered ? "Status Terdaftar" : "Verifikasi Identitas"}
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-2xl sm:text-3xl font-extrabold text-gray-900"
                    >
                        {isRegistered ? "Data Anda Telah Dikonfirmasi" : "Konfirmasi Data Diri"}
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-500 max-w-lg mx-auto"
                    >
                        {isRegistered 
                            ? "Anda sudah terdaftar dalam program ini. Data di bawah ini adalah data yang tersimpan."
                            : "Mohon pastikan data di bawah ini sudah benar sebelum melanjutkan pendaftaran program."
                        }
                    </motion.p>
                </div>

                {isLoading ? (
                     <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[400px]">
                        <div className="animate-spin w-10 h-10 border-4 border-gray-200 border-t-green-500 rounded-full mb-4"></div>
                        <p className="text-gray-400 font-medium">Memuat data...</p>
                     </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
                    >
                        {/* Form Header */}
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Informasi Personal</span>
                            {isRegistered && <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">Terdaftar</span>}
                        </div>

                        <form className="p-6 sm:p-8 space-y-6">
                            {/* Group 1: Identitas */}
                            <div className="space-y-6">
                                <InputField 
                                    label="Nama Lengkap" 
                                    icon={FiUser} 
                                    value={credential.name} 
                                    onChange={(e: any) => setCredential({ ...credential, name: e.target.value })}
                                    placeholder="Nama Lengkap Anda"
                                    disabled={isRegistered}
                                />
                                <InputField 
                                    label="Nomor Induk Kependudukan (NIK)" 
                                    icon={FiCreditCard} 
                                    value={credential.nik} 
                                    onChange={(e: any) => setCredential({ ...credential, nik: e.target.value })}
                                     placeholder="16 Digit NIK"
                                     disabled={isRegistered}
                                />
                                <InputField 
                                    label="Tanggal Lahir" 
                                    icon={FiCalendar} 
                                    type="date"
                                    value={moment(credential.birthdate).format("YYYY-MM-DD")} 
                                    onChange={(e: any) => setCredential({ ...credential, birthdate: e.target.value })}
                                    disabled={isRegistered}
                                />
                                <SelectField 
                                    label="Jenis Kelamin"
                                    icon={FiUsers}
                                    value={credential.gender}
                                    onChange={(e: any) => setCredential({ ...credential, gender: e.target.value })}
                                    disabled={isRegistered}
                                    options={[
                                        { value: "L", label: "Laki-laki" },
                                        { value: "P", label: "Perempuan" }
                                    ]}
                                />
                                <InputField 
                                    label="Nomor WhatsApp / HP" 
                                    icon={FiPhone} 
                                    value={credential.contact} 
                                    onChange={(e: any) => setCredential({ ...credential, contact: e.target.value })}
                                     placeholder="08xxxxxxxxxx"
                                     disabled={isRegistered}
                                />
                                <SelectField 
                                    label="Jenjang Ajar"
                                    icon={FiBookOpen}
                                    value={credential.educational_level_id}
                                    onChange={(e: any) => setCredential({ ...credential, educational_level_id: e.target.value })}
                                    isLoading={isLoadingEdu}
                                    disabled={isRegistered}
                                    options={eduLevel.map(lvl => ({ value: lvl.id, label: lvl.name }))}
                                />
                                <InputField 
                                    label="Tempat Tugas / Sekolah" 
                                    icon={FiMapPin} 
                                    value={credential.school_place} 
                                    onChange={(e: any) => setCredential({ ...credential, school_place: e.target.value })}
                                    placeholder="Nama Sekolah Tempat Anda Mengajar"
                                    disabled={isRegistered}
                                />
                            </div>

                            {/* Notice */}
                            {!isRegistered && (
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-sm text-blue-800">
                                    <FiAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <p>Pastikan data di atas sudah benar. Data ini akan digunakan untuk pendaftaran program mitra dan tidak dapat diubah setelah dikonfirmasi.</p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={isSaving || isRegistered}
                                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform flex items-center justify-center gap-2
                                    ${isRegistered
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                                        : isSaving 
                                            ? "bg-gray-400 cursor-wait shadow-none" 
                                            : "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 active:scale-[0.99] shadow-green-200"
                                    }
                                `}
                            >
                                {isRegistered ? (
                                    <>
                                        <FiCheckCircle className="w-5 h-5" />
                                        Anda Sudah Terdaftar
                                    </>
                                ) : isSaving ? (
                                    <>
                                        <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div>
                                        Menyimpan Data...
                                    </>
                                ) : (
                                    <>
                                        <FiSave className="w-5 h-5" />
                                        Konfirmasi & Simpan Data
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                )}
            </div>
		</div>
	);
};

export default PartnerConfirmData;
