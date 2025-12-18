import React from "react";
import TopBar from "@/components/nav/topbar";

interface MitraDetailContentProps {
	subtitle: string;
	description: string;
	imageUrl: string;
	isConfirmed: boolean;
	onConfirm: () => void;
	onExternalUrlClick: () => void;
}

const MitraDetailContent: React.FC<MitraDetailContentProps> = ({
	subtitle,
	description,
	imageUrl,
	isConfirmed,
	onConfirm,
	onExternalUrlClick,
}) => {
	return (
		<div className="min-h-screen bg-white p-6">
			<div className="mb-6">
				<img
					src={imageUrl}
					alt="Mitra"
					className="w-full h-64 object-cover rounded-lg"
				/>
			</div>

			<div className="mb-6">
				<h1 className="text-xl font-bold text-gray-800">{subtitle}</h1>
				<h2 className="text-lg font-bold text-gray-700 mt-4">Deskripsi</h2>
				<p className="text-gray-600 mt-2">{description}</p>
			</div>

			<div className="flex flex-col space-y-4">
				<button
					disabled={isConfirmed}
					className="bg-green-500 text-white px-4 py-2 rounded"
					onClick={onConfirm}>
					{isConfirmed ? "Anda Sudah Terdaftar" : "Konfirmasi Data Diri"}
				</button>
				<button
					className={`px-4 py-2 rounded ${
						isConfirmed
							? "bg-green-500 text-white"
							: "bg-gray-300 text-gray-500"
					}`}
					onClick={onExternalUrlClick}
					disabled={!isConfirmed}>
					{isConfirmed ? "Buka Link" : "Isi Form Dahulu"}
				</button>
			</div>
		</div>
	);
};

export default MitraDetailContent;
