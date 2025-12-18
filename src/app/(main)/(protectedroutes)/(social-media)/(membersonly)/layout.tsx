"use client";
import SocialMediaNavbar from "@/components/nav/social_media_nav";
import Navigate from "@/components/navigator/navigate";
import { Status } from "@/constant/constant";
import { useAuth } from "@/utils/context/auth_context";
import {
	getUserStatus,
	isAllProfileCompleted,
} from "@/utils/function/function";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
	const { auth } = useAuth();

	return getUserStatus(auth) != Status.ACTIVE ? (
		<Navigate to={"/"} />
	) : (
		<>
			{children} {getUserStatus(auth) == Status.ACTIVE && <SocialMediaNavbar />}
		</>
	);
}
