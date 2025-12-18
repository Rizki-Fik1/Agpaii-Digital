"use client";
import Modal from "@/components/modal/modal";
import TopBar from "@/components/nav/topbar";
import { useAuth } from "@/utils/context/auth_context";
import { useModal } from "@/utils/hooks/use_modal";
import { UserIcon } from "@heroicons/react/16/solid";
import {
	AcademicCapIcon,
	CameraIcon,
	MapPinIcon,
	LockClosedIcon,
	ArrowLeftStartOnRectangleIcon,
} from "@heroicons/react/24/solid";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

export default function EditProfile() {
	const queryClient = useQueryClient();
	const { auth, authLoading } = useAuth();
	const menuList: { label: string; link: string; icon: ReactNode }[] = [
		{
			label: "Informasi Umum",
			link: "edit/information",
			icon: <UserIcon />,
		},
		{
			label: "Provinsi / Kota ",
			link: "edit/region",
			icon: <MapPinIcon />,
		},
		{
			label: "Status Guru",
			link: "edit/status",
			icon: <AcademicCapIcon />,
		},
		{
			label: "Profile Sosmed",
			link: "edit/social-media",
			icon: <CameraIcon />,
		},
		{
			label: "Ubah Password",
			link: "edit/password",
			icon: <LockClosedIcon />,
		},
	];

	const router = useRouter();
	const { show, toggle } = useModal();
	const logout = async () => {
		localStorage.removeItem("access_token");
		await queryClient
			.invalidateQueries({ queryKey: ["auth"] })
			.then(() => router.push("/auth/login"));
	};

	if (authLoading) return null;

	return (
		<>
			<Modal
				show={show}
				onClose={toggle}
				className="w-[20rem]">
				<div className="mt-8">
					{/* <img src="/img/logout.svg" className="size-32" alt="" /> */}
					<h1 className="mb-8 pr-6 text-left text-[0.9rem] text-slate-600">
						Apakah anda yakin ingin log out?
					</h1>
					<div className="flex *:px-3 *:sm:py-2 *:py-1.5 gap-1.5 justify-end">
						<button className="bg-slate-300 rounded-md">Batal</button>
						<button
							onClick={() => logout()}
							className="bg-[#009788]  !px-4 rounded-md text-white">
							Log Out
						</button>
					</div>
				</div>
			</Modal>
			<div className="pt-[4.21rem]">
				<TopBar
					withBackButton
					href="/">
					Edit Profile
				</TopBar>
				<div className="flex flex-col px-[5%] sm:px-6 gap-3 mt-4">
					<div className="mb-2 mt-3">
						<div className="text-2xl drop-shadow font-semibold text-[#009788]">
							Edit Profile
						</div>
						<p className="text-sm text-slate-500">
							Edit profile sesuai keinginan anda
						</p>
					</div>
					{menuList.map((menu, i) => (
						<Link
							href={menu.link}
							key={i}
							className="flex items-center px-4 sm:px-5 shadow py-2 border-b border-b-gray-200 rounded-lg border border-slate-200">
							<h1 className="text-slate-500 text-[0.92rem]">{menu.label}</h1>
							<span className="p-2 text-[#009788] rounded-md ms-auto *:size-6">
								{menu.icon}
							</span>
						</Link>
					))}
					{auth.role_id == 1 && (
						<Link
							href={"/edit-user"}
							className="flex items-center px-4 sm:px-5 shadow py-2 border-b border-b-gray-200 rounded-lg border border-slate-200">
							<h1 className="text-slate-500 text-[0.92rem]">Edit User</h1>
							<span className="p-2 text-[#009788] rounded-md ms-auto *:size-6">
								<UserIcon />
							</span>
						</Link>
					)}
					<div
						onClick={toggle}
						className="flex items-center px-5 shadow py-2 border-b border-b-gray-200 mt-16 rounded-lg border border-slate-200">
						<h1 className="text-slate-500 font-medium text-[0.92rem]">
							Logout
						</h1>
						<span className="p-2 text-[#009788] rounded-md ms-auto ">
							<ArrowLeftStartOnRectangleIcon className="size-6" />
						</span>
					</div>
				</div>
			</div>
		</>
	);
}
