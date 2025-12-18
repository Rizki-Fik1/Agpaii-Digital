"use client";

import TopBar from "@/components/nav/topbar";
import { ArrowLeftIcon } from "@mui/x-date-pickers/icons";
import { useRouter, useSearchParams } from "next/navigation";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
	const router = useRouter();
	const params = useSearchParams();
	return (
		<div className="pt-[4.21rem]">
			<TopBar
				withBackButton
				href="/">
				Dokumen Cloud
			</TopBar>
			<div className="flex py-3 border-b border-b-slate-300 px-4 sm:px-5 gap-2 items-center">
				<ArrowLeftIcon
					onClick={() => router.back()}
					className="!size-6 cursor-pointer"
				/>
				<h1 className="text-[0.95rem] text-sm text-slate-700">
					{params.get("name") || ""}
				</h1>
			</div>
			<div>{children}</div>
		</div>
	);
}
