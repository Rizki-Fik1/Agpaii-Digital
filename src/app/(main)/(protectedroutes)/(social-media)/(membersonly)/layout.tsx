"use client";
import SocialMediaNavbar from "@/components/nav/social_media_nav";
import Navigate from "@/components/navigator/navigate";
import { Status } from "@/constant/constant";
import { useAuth } from "@/utils/context/auth_context";
import { getUserStatus } from "@/utils/function/function";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
	const { auth } = useAuth();

	return getUserStatus(auth) != Status.ACTIVE ? (
		<Navigate to={"/"} />
	) : (
		<div className="w-full relative min-h-screen">
			{/* Wrapper untuk membatasi ukuran body content terhadap Sidebar Sosmed kita di sebelah kanan pada Desktop */}
			<div className="w-full h-full lg:pr-[240px] xl:pr-[280px]">
				<div className="w-full max-w-[700px] xl:max-w-[750px] mx-auto min-w-0">
					{children}
				</div>
			</div>
			
			{/* Navbar Kanan (Desktop) & Navbar Bawah (Mobile) */}
			{getUserStatus(auth) == Status.ACTIVE && <SocialMediaNavbar />}
		</div>
	);
}
