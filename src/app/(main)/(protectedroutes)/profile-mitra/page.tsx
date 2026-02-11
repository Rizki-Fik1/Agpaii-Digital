"use client";
import React, { useState, useEffect } from "react";
import TopBar from "@/components/nav/topbar";
import { useAuth } from "@/utils/context/auth_context";
import { FiUser, FiBriefcase, FiMail, FiPhone, FiEdit3, FiSave, FiCamera } from "react-icons/fi";
import { toast } from "sonner";
import Nav from "@/components/nav/student_nav"; // Will be overridden by layout logic to MitraNav

export default function MitraProfilePage() {
    const { auth, setAuth } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    
    // Local state for editing
    const [formData, setFormData] = useState({
        name: "",
        instansi: "",
        email: "",
        phone: "",
        pic: "",
        logo: ""
    });

    useEffect(() => {
        if (auth) {
            
            setFormData({
                name: auth.name || "",
                // Fallback sequence: brand_name (from backend) -> instansi_name (legacy/alt) -> name
                instansi: auth.brand_name || auth.instansi_name || auth.name || "Nama Instansi Belum Diisi",
                email: auth.email || "",
                // Fallback sequence: phone (backend) -> no_hp (frontend state)
                phone: auth.phone || auth.no_hp || "",
                pic: auth.pic_name || "Nama PIC Belum Diisi",
                logo: (auth.logo_mitra || auth.logo) 
                    ? (auth.logo_mitra || auth.logo).startsWith('http') 
                        ? (auth.logo_mitra || auth.logo) 
                        : `https://file.agpaiidigital.org/${auth.logo_mitra || auth.logo}`
                    : null
            });
        }
    }, [auth]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        // Mock save API
        const updatedAuth = {
            ...auth,
            name: formData.name,
            instansi_name: formData.instansi,
            email: formData.email,
            no_hp: formData.phone,
            pic_name: formData.pic
        };

        setAuth(updatedAuth);
        setIsEditing(false);
        toast.success("Profil berhasil diperbarui!");
    };

    return (
        <div className="pt-[4.5rem] bg-gray-50 min-h-screen pb-24">
            <TopBar>Profil Mitra</TopBar>
            
            <div className="px-5">
                {/* Header Card */}
                <div className="bg-white rounded-3xl shadow-lg p-6 mb-6 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-green-500 to-teal-600"></div>
                    <div className="relative pt-6">
                        <div className="w-24 h-24 mx-auto rounded-full border-4 border-white shadow-md bg-gray-200 overflow-hidden relative group">
                            {formData.logo ? (
                                <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full text-gray-400">
                                    <FiBriefcase className="w-8 h-8" />
                                </div>
                            )}
                            {isEditing && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer">
                                    <FiCamera className="text-white w-6 h-6" />
                                </div>
                            )}
                        </div>
                        <h2 className="mt-3 text-xl font-bold text-gray-800">{formData.instansi}</h2>
                        <p className="text-sm text-gray-500">{formData.email}</p>
                    </div>
                    
                    <button 
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        className={`absolute top-28 right-4 p-2 rounded-full shadow-md transition-all ${isEditing ? 'bg-green-500 text-white' : 'bg-white text-gray-600 hover:text-green-600'}`}
                    >
                        {isEditing ? <FiSave className="w-5 h-5"/> : <FiEdit3 className="w-5 h-5" />}
                    </button>
                </div>

                {/* Info Form */}
                <div className="bg-white rounded-3xl shadow-lg p-6 space-y-6">
                    <h3 className="font-bold text-gray-800 border-b pb-2">Informasi Mitra</h3>
                    
                    <div className="space-y-4">
                        <div className="group">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Nama Instansi</label>
                            <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                                <FiBriefcase className="text-green-500 w-5 h-5" />
                                <input 
                                    name="instansi"
                                    value={formData.instansi}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="flex-1 bg-transparent outline-none text-gray-700 font-medium disabled:text-gray-500"
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Nama PIC</label>
                            <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                                <FiUser className="text-green-500 w-5 h-5" />
                                <input 
                                    name="pic"
                                    value={formData.pic}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="flex-1 bg-transparent outline-none text-gray-700 font-medium disabled:text-gray-500"
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Email</label>
                            <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                                <FiMail className="text-green-500 w-5 h-5" />
                                <input 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={!isEditing} // Email usually uneditable or needs special flow
                                    className="flex-1 bg-transparent outline-none text-gray-700 font-medium disabled:text-gray-500 opacity-70"
                                />
                            </div>
                        </div>

                         <div className="group">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Nomor HP</label>
                            <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                                <FiPhone className="text-green-500 w-5 h-5" />
                                <input 
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="flex-1 bg-transparent outline-none text-gray-700 font-medium disabled:text-gray-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>


                {/* LOGOUT BUTTON */}
                <div className="mt-8">
                    <button
                        onClick={() => {
                            if (confirm("Apakah Anda yakin ingin keluar?")) {
                                localStorage.removeItem("access_token");
                                setAuth(null);
                                window.location.href = "/";
                            }
                        }}
                        className="w-full py-3 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Keluar
                    </button>
                    <p className="text-center text-gray-400 text-xs mt-4">
                        Versi Aplikasi 1.0.0 &copy; 2024 AGPAII Digital
                    </p>
                </div>
            </div>
        </div>
    );
}
