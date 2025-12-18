// components/tasbih/TasbihDigital.tsx
"use client";
import { useState } from "react";
import Modal from "react-modal";
import { useRouter } from "next/navigation";
import API from "@/utils/api/config";
import TopBar from "@/components/nav/topbar";

const TasbihDigital = () => {
	const router = useRouter();
	const [count, setCount] = useState(0);
	const [showSaveModal, setShowSaveModal] = useState(false);
	const [dzikirName, setDzikirName] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSave = async () => {
		try {
			setIsSubmitting(true);
			await API.post("/tasbih", {
				name: dzikirName,
				count: count,
			});
			setCount(0);
			setShowSaveModal(false);
			setDzikirName("");
			router.push("/tasbih/history");
		} catch (error) {
			console.error("Gagal menyimpan:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleIncrement = () => {
		setCount((prev) => prev + 1);
		if (navigator.vibrate) {
			navigator.vibrate(60);
		}
	};

	return (
		<div className="p-6 bg-gray-50 min-h-screen pt-[5.21rem]">
			<TopBar withBackButton>Tasbih Digital</TopBar>
			{/* Watch Display */}
			<div className="mx-auto flex flex-col items-center">
				<button
					onClick={handleIncrement}
					className="relative mx-auto h-72 w-72 rounded-full mt-4 border-8 border-gray-600 bg-[#19473E] shadow-xl transition-transform duration-200 active:scale-95 active:shadow-inner hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#009788]/50 overflow-hidden group">
					<h2 className="absolute top-16 w-full text-center text-2xl font-semibold uppercase tracking-wide text-white">
						Tasbih Digital
					</h2>
					<p className="mt-20 text-center text-8xl font-light text-white">
						{count}
					</p>
				</button>
			</div>

			{/* Control Buttons */}
			<div className="mx-auto mb-8 flex w-fit gap-5 rounded-full mt-8 bg-[#F0A500] p-4">
				<button
					onClick={() => setCount(0)}
					className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-2xl font-semibold text-[#009788] shadow-lg">
					↻
				</button>
			</div>

			{/* Action Buttons */}
			<div className="flex gap-3">
				<button
					onClick={() => setShowSaveModal(true)}
					className="flex-1 rounded-lg bg-[#009788] px-6 py-3 text-sm font-bold text-white">
					SIMPAN
				</button>
				<button
					onClick={() => router.push("/tasbih/history")}
					className="flex-1 rounded-lg bg-[#F0A500] px-6 py-3 text-sm font-bold text-white">
					ZIKIR TERSIMPAN
				</button>
			</div>

			{/* Save Modal */}
			<Modal
				isOpen={showSaveModal}
				onRequestClose={() => setShowSaveModal(false)}
				className="modal"
				overlayClassName="modal-overlay">
				<div className="w-80 rounded-lg bg-white p-6">
					<h3 className="mb-4 text-center text-xl font-bold">Simpan Dzikir</h3>
					<input
						type="text"
						placeholder="Nama Dzikir"
						value={dzikirName}
						onChange={(e) => setDzikirName(e.target.value)}
						className="mb-4 w-full rounded border border-gray-300 px-3 py-2"
					/>
					<div className="flex gap-3">
						<button
							onClick={() => {
								setShowSaveModal(false);
								setDzikirName("");
							}}
							className="flex-1 rounded bg-red-500 px-4 py-2 text-white">
							Batal
						</button>
						<button
							onClick={handleSave}
							disabled={isSubmitting}
							className="flex flex-1 items-center justify-center rounded bg-green-500 px-4 py-2 text-white disabled:opacity-70">
							{isSubmitting ? (
								<div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
							) : (
								"Simpan"
							)}
						</button>
					</div>
				</div>
			</Modal>

			<style
				jsx
				global>{`
				.modal-overlay {
					position: fixed;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					background-color: rgba(0, 0, 0, 0.5);
					display: flex;
					justify-content: center;
					align-items: center;
					z-index: 1000;
				}

				.modal {
					position: relative;
					background: transparent;
					overflow: auto;
					border-radius: 4px;
					outline: none;
				}
			`}</style>
		</div>
	);
};

export default TasbihDigital;
