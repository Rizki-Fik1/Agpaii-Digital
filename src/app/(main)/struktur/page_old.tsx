"use client";

import React from "react";
import TopBar from "@/components/nav/topbar";

const StrukturPage = () => {
	const pdfUrl = "https://cdn-agpaiidigital.online/struktur/strukturagpaii.pdf";

	return (
		<div className="pt-[4.2rem]">
			<TopBar withBackButton>Struktur Organisasi</TopBar>
			<div className="p-2">
				<div className="border rounded-lg shadow-md overflow-hidden h-[90vh]">
					<iframe
						src={pdfUrl}
						title="Struktur Organisasi"
						width="100%"
						height="100%"
						className="border-none"></iframe>
				</div>
			</div>
		</div>
	);
};

export default StrukturPage;
