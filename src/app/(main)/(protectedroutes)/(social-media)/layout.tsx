"use client";
import SocialMediaNavbar from "@/components/nav/social_media_nav";
import { Status } from "@/constant/constant";
import { useAuth } from "@/utils/context/auth_context";
import { getUserStatus } from "@/utils/function/function";
import { ReactNode } from "react";

export default function SocialMediaLayout({
	children,
}: {
	children: ReactNode;
}) {
	return <>{children}</>;
}
