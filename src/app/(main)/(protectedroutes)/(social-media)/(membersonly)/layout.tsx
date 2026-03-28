"use client";
import SocialMediaNavbar from "@/components/nav/social_media_nav";
import Navigate from "@/components/navigator/navigate";
import { Status } from "@/constant/constant";
import { useAuth } from "@/utils/context/auth_context";
import { getUserStatus } from "@/utils/function/function";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

export default function Layout({ children }: { children: ReactNode }) {
	const { auth } = useAuth();
	const pathname = usePathname();

	// Untuk halaman tertentu (detail post, new/edit post, chat detail, dll)
	// kita tidak ingin menyisakan ruang kosong di kanan untuk sidebar.
	const isFullWidthPage =
		pathname.startsWith("/social-media/post") ||
		pathname.startsWith("/social-media/chat/");

	return getUserStatus(auth) != Status.ACTIVE ? (
		<Navigate to={"/"} />
	) : (
		<div className="w-full relative min-h-screen">
			{/* Wrapper: kalau tidak full-width, beri padding kanan untuk sidebar */}
			<div
				className={
					"w-full h-full " +
					(isFullWidthPage ? "" : "lg:pr-[240px] xl:pr-[280px]")
				}
			>
				<div className="w-full max-w-[700px] xl:max-w-[750px] mx-auto min-w-0">
					{children}
				</div>
			</div>
			
			{/* Navbar Kanan (Desktop) & Navbar Bawah (Mobile) */}
			{!isFullWidthPage && getUserStatus(auth) == Status.ACTIVE && (
				<SocialMediaNavbar />
			)}
		</div>
	);
}
