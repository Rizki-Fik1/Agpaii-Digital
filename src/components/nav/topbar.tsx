"use client"; 

import { ChevronLeftIcon } from "@heroicons/react/16/solid";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline"; // For dots icon
import Link from "next/link";

export default function TopBar({
	children,
	withBackButton,
	href,
	dots,
	kelolaButton,
	tambahButton,
    rightContent,
}: {
	children?: ReactNode;
	withBackButton?: boolean;
	href?: string;
	dots?: string;
	kelolaButton?: string;
	tambahButton?: string;
    rightContent?: ReactNode;
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
		<div className="fixed top-0 left-0 right-0 md:left-20 lg:left-64 bg-gradient-to-r from-[#006557] to-[#009788] z-[90] shadow-sm transition-all min-h-[64px] flex justify-center border-b border-[#009788]/20">
			<div className="w-full max-w-[480px] md:max-w-none xl:max-w-7xl mx-auto px-4 md:px-8 py-3 md:py-4 flex items-center">
				{withBackButton && (
					<div 
						onClick={handleBack}
						className="mr-3 p-1.5 -ml-2 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
					>
						<ChevronLeftIcon className="size-6 md:size-5 text-white" />
					</div>
				)}
				<div className="flex-grow flex items-center justify-between">
                <h1 className="text-white font-medium capitalize truncate">
                    {children}
                </h1>
                {rightContent && (
                    <div className="ml-2 flex-shrink-0">
                        {rightContent}
                    </div>
                )}
            </div>

			{/* Tambah Button */}
			{tambahButton && (
				<Link href={tambahButton}>
					<button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded-full transition-colors">
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
						</svg>
						<span className="font-medium">Tambah</span>
					</button>
				</Link>
			)}

			{/* Kelola Button */}
			{kelolaButton && (
				<Link href={kelolaButton}>
					<button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded-full transition-colors">
						<img 
							src="/svg/marketplace.svg" 
							alt="Marketplace" 
							className="w-5 h-5 object-contain"
						/>
						<span className="font-medium">Kelola</span>
					</button>
				</Link>
			)}

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
		</div>
	);
}
