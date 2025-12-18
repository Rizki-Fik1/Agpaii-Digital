"use client";
import Loader from "@/components/loader/loader";
import Modal from "@/components/modal/modal";
import TopBar from "@/components/nav/topbar";
import { useModal } from "@/utils/hooks/use_modal";
import { useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OthersMenuPage() {
	const router = useRouter();
	const queryClient = useQueryClient();

	const { show, toggle } = useModal();
	const [showLogoutModal, setShowLogoutModal] = useState(false);
	const [isRamadhanFeatureEnabled, setIsRamadhanFeatureEnabled] =
		useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Check cache first
		const cachedFeature = sessionStorage.getItem('ramadhan_feature');
		if (cachedFeature !== null) {
			setIsRamadhanFeatureEnabled(cachedFeature === 'true');
			setIsLoading(false);
			return;
		}

		fetch(
			`${process.env.NEXT_PUBLIC_MITRA_URL}/api/feature-status/ramadhan_feature`
		)
			.then((response) => response.json())
			.then((data) => {
				setIsRamadhanFeatureEnabled(data.is_enabled);
				sessionStorage.setItem('ramadhan_feature', String(data.is_enabled));
				setIsLoading(false);
			})
			.catch((error) => {
				console.error("Error fetching feature status:", error);
				setIsLoading(false);
			});
	}, []);

	const menuList = [
		{
			label: "Doa",
			icon: "/img/doa.svg",
			link: "/doa",
		},
		{
			label: "Struktur Organisasi",
			icon: "/svg/organisasi.svg",
			link: "/struktur",
		},
		{
			label: "Ruang Guru",
			icon: "/img/ruang_guru.svg",
			link: "/ruang-guru",
		},
		{
			label: "Tryout",
			icon: "/svg/latihan_soal.svg",
			link: "https://cbt.agpaiidigital.org",
		},
		{
			label: "Acara",
			icon: "/svg/acara.svg",
			link: "/event",
		},
		{
			label: "RPP Digital",
			icon: "/svg/rpp_digital.svg",
			link: "/perangkat-ajar",
		},
		{
			label: "Waktu Shalat",
			icon: "/svg/waktu_sholat.svg",
			link: "/waktu-sholat",
		},
		{
			label: "Dokumen Cloud",
			icon: "/svg/dokumen_cloud.svg",
			link: "/cloud",
		},
		{
			label: "Mitra",
			icon: "/img/icon_mitra_new.png",
			link: "/mitra",
		},
		{
			label: "Perangkat Ajar",
			icon: "/img/icon_perangkat_ajar.png",
			link: "/perangkat-ajar",
		},
		{
			label: "Live & Video",
			icon: "/img/youtubee.svg",
			link: "/live",
		},
		{
			label: "Tasbih Digital",
			icon: "/img/tasbih.svg",
			link: "/tasbih",
		},
		{
			label: "Wakaf",
			icon: "/img/wakaf.png",
			link: "https://apps.satuwakaf.id/campaign/ce7fcf60-7b55-4ee7-9531-9f0d599c7e60?share=1&title=dana-abadi-pendidikan-agama-islam-di-sekolah-berbasis-wakaf",
			external: true,
		},
		{
			label: isRamadhanFeatureEnabled ? "Artikel" : "Ramadhan",
			icon: isRamadhanFeatureEnabled
				? "/img/article.png"
				: "/img/ramadan-logo.svg",
			link: isRamadhanFeatureEnabled ? "/article" : "/ramadhan",
		},
		{
			label: "Marketplace",
			icon: "/img/marketplace.svg",
			link: "/marketplace",
		},
		{
			label: "PPOB",
			icon: "/svg/cartppob.svg",
			link: "/ecommerce",
		},
		{
			label: "Log Out",
			icon: "/img/logout.png",
			link: null,
		},
	];

	const menuCategories = [
		{
			title: "Mengaji",
			icon: "/svg/icon-quran.svg",
			items: [
				{ label: "Doa", icon: "/img/ikon-doa.svg", link: "/doa" },
				{ label: "Al-Quran", icon: "/svg/ikon-alquran.svg", link: "/murrotal/surat" },
				{ label: "Tasbih Digital", icon: "/svg/ikon-tasbih.svg", link: "/tasbih" },
				{ label: "Arah Kiblat", icon: "/svg/ikon-kabah.svg", link: "/arah-kiblat" },
				{ label: "Waktu Shalat", icon: "/svg/ikon-solat.svg", link: "/waktu-sholat" },
				{ label: "Ramadhan", icon: "/svg/ikon-ramadhan.svg", link: "/ramadhan" },
				{ label: "Wakaf", icon: "/svg/ikon-wakaf.svg", link: "https://apps.satuwakaf.id/campaign/ce7fcf60-7b55-4ee7-9531-9f0d599c7e60?share=1&title=dana-abadi-pendidikan-agama-islam-di-sekolah-berbasis-wakaf", external: true },
			],
		},
		{
			title: "Edukasi",
			icon: "/svg/icon-book.svg",
			items: [
				{ label: "Ruang Guru", icon: "/svg/ikon-guru.svg", link: "/ruang-guru" },
				{ label: "Perangkat Ajar", icon: "/svg/ikon-perangkat.svg", link: "/perangkat-ajar" },
				{ label: "RPP Digital", icon: "/svg/ikon-rpp.svg", link: "/perangkat-ajar" },
				{ label: "Tryout", icon: "/svg/ikon-tryout.svg", link: "https://cbt.agpaiidigital.org" },
			],
		},
		{
			title: "Perdagangan",
			icon: "/svg/icon-store.svg",
			items: [
				{ label: "Marketplace", icon: "/svg/ikon-marketplace.svg", link: "/marketplace" },
				{ label: "PPOB", icon: "/svg/ikon-ppob.svg", link: "/ecommerce" },
				{ label: "Mitra", icon: "/svg/ikon-mitra.svg", link: "/mitra" },
			],
		},
		{
			title: "Acara dan Organisasi",
			icon: "/svg/icon-member.svg",
			items: [
				{ label: "Acara", icon: "/svg/ikon-event.svg", link: "/event" },
				{ label: "Struktur Organisasi", icon: "/svg/ikon-struktur.svg", link: "/struktur" },
				{ label: "Informasi Anggota", icon: "/svg/ikon-anggota.svg", link: "/member" },
				{ label: "KTA Digital", icon: "/svg/ikon-kta.svg", link: "/kta" },
				{ label: "Live dan Video", icon: "/svg/ikon-live.svg", link: "/live" },
				{ label: "Sosial Media", icon: "/svg/ikon-sosmed.svg", link: "/social-media" },
			],
		},
		{
			title: "Akun",
			icon: "/svg/icon-user.svg",
			items: [
				{ label: "Log Out", icon: "/img/logout.png", link: null, isLogout: true },
			],
		},
	];

	const logout = async () => {
		localStorage.removeItem("access_token");
		await queryClient.invalidateQueries({ queryKey: ["auth"] });
		router.push("/auth/login");
	};

	const confirmLogout = () => {
		setShowLogoutModal(true);
	};

	const handleLogoutCancel = () => {
		setShowLogoutModal(false);
	};

	const handleLogoutConfirm = () => {
		setShowLogoutModal(false);
		logout();
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<Loader className="size-16" />
			</div>
		);
	}

	return (
		<>
			{/* Modal Maintenance */}
			<Modal
				show={show}
				onClose={toggle}>
				<div className="max-w-[15rem] pb-3 pt-2">
					<div className="flex justify-between items-center">
						<h1 className="font-medium text-[1.050rem]">Dalam Maintenance</h1>
					</div>
					<div className="flex gap-6 pt-8 flex-col items-center ">
						<img
							src="/img/maintain.svg"
							className="size-40 -ml-5"
							alt=""
						/>
						<p className="text-sm text-[0.9rem] text-neutral-600">
							Fitur ini akan segera tersedia di versi yang akan datang
						</p>
					</div>
				</div>
			</Modal>

			{/* Modal Logout Confirmation */}
			<Modal
				show={showLogoutModal}
				onClose={handleLogoutCancel}>
				<div className="p-6 text-center">
					<h2 className="text-lg font-medium mb-4">Konfirmasi Logout</h2>
					<p className="text-sm text-gray-600 mb-6">
						Apakah Anda yakin ingin logout?
					</p>
					<div className="flex justify-center gap-4">
						<button
							onClick={handleLogoutCancel}
							className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md">
							Batal
						</button>
						<button
							onClick={handleLogoutConfirm}
							className="px-4 py-2 bg-red-500 text-white rounded-md">
							Logout
						</button>
					</div>
				</div>
			</Modal>

			<div className="pt-[3.9rem]">
				<TopBar withBackButton>Menu Lainnya</TopBar>
				<div className="px-6 py-6">
					{/* Kategori Menu */}
					{menuCategories.map((category, catIndex) => (
						<div key={catIndex} className="mb-8">
							<div className="flex items-center gap-3 mb-5">
								<div className="bg-teal-600 p-2 rounded-lg">
									{category.icon.startsWith("/") ? (
										<img src={category.icon} alt="" className="size-5" />
									) : (
										<span className="text-white text-lg">{category.icon}</span>
									)}
								</div>
								<h2 className="text-lg font-semibold text-slate-700">
									{category.title} <span className="text-teal-600">AGPAII</span>
								</h2>
							</div>
							<div className="grid grid-cols-4 gap-4">
								{category.items.map((item: any, itemIndex) => {
									const handleClick = () => {
										if (item.isLogout) {
											confirmLogout();
										} else if (item.link) {
											if (item.external) {
												window.open(item.link, '_blank');
											} else {
												router.push(item.link);
											}
										}
									};

									return (
										<div
											key={itemIndex}
											onClick={handleClick}
											className="flex flex-col items-center gap-2 cursor-pointer group">
											<div className={`rounded-2xl p-3 transition ${item.isLogout ? 'bg-red-100 group-hover:bg-red-200' : 'bg-slate-100 group-hover:bg-slate-200'}`}>
												<img
													src={item.icon}
													className="size-10 object-contain"
													alt=""
												/>
											</div>
											<p className={`text-xs text-center line-clamp-2 ${item.isLogout ? 'text-red-600' : 'text-slate-600'}`}>
												{item.label}
											</p>
										</div>
									);
								})}
							</div>
						</div>
					))}
				</div>
			</div>
		</>
	);
}