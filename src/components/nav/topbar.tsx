"use client";

import { ChevronLeftIcon } from "@heroicons/react/16/solid";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline"; // For dots icon

export default function TopBar({
	children,
	withBackButton,
	href,
	dots,
}: {
	children?: ReactNode;
	withBackButton?: boolean;
	href?: string;
	dots?: string;
}) {
	const router = useRouter();

	const handleBack = () => {
		if (href) {
			router.push(href);
		} else {
			router.back();
		}
	};

	return (
		<div className="fixed top-0 left-0 right-0 mx-auto max-w-[480px] px-4 sm:px-5 py-5 bg-[#266565] flex items-center z-[9999] shadow">
			{withBackButton && (
				<ChevronLeftIcon
					onClick={handleBack}
					className="size-6 cursor-pointer text-white hover:opacity-80 transition-opacity"
				/>
			)}
			<h1 className="text-white font-medium ml-3 flex-grow capitalize">
				{children}
			</h1>
			{/* Menu Icon */}
			{dots && (
				<Menu>
					<MenuButton className="relative cursor-pointer text-white">
						<EllipsisVerticalIcon className="h-6 w-6 text-white" />
					</MenuButton>
					<MenuItems className="absolute right-0 mt-24 w-40 bg-white text-black shadow-md rounded-md">
						<MenuItem>
							<a
								href={dots}
								className="block px-4 py-2 hover:bg-gray-200 cursor-pointer">
								Kelola Produk
							</a>
						</MenuItem>
						{/* Add more menu options here as needed */}
					</MenuItems>
				</Menu>
			)}
		</div>
	);
}
