import Loader from "../loader/loader";
import { ReactNode } from "react";

export default function ModalContent({
	type,
	onAccept,
	pending = false,
	onCancel,
	children,
}: {
	type: "payment" | "expired" | "inactive" | "pending";
	onCancel?: () => void;
	onAccept?: () => void;
	pending?: boolean;
	children?: ReactNode;
}) {
	const contents: any = {
		inactive: (
			<>
				<div className="flex flex-col items-center text-sm text-center">
					<img
						src="/img/credit_card.svg"
						className="size-20 mt-8"
						alt=""
					/>
					<p className="text-slate-600 pt-3 mt-6">
						Lakukan Iuran Pendaftaran untuk <br /> mengaktifkan akun
					</p>
					<div className="flex flex-col mt-3 gap-2 w-full *:cursor-pointer">
						<span
							onClick={onAccept}
							className="px-4 py-2 w-full bg-[#009788] text-white border border-slate-300 rounded-md">
							Klik Disini
						</span>
						<span
							onClick={onCancel}
							className="px-4 py-2 w-full bg-gray-200 rounded-md">
							Nanti Saja
						</span>
					</div>
				</div>
			</>
		),
		expired: (
			<>
				<div className="flex flex-col items-center text-sm text-center">
					<img
						src="/img/credit_card.svg"
						className="size-20 mt-6"
						alt=""
					/>
					<p className="text-slate-600 pt-3 mt-6">
						Saatnya iuran 6 bulan untuk tetap <br /> mendapatkan fasilitas
						AGPAII Digital.
					</p>
					<div className="flex flex-col mt-3 gap-2 w-full *:cursor-pointer">
						<span
							onClick={onAccept}
							className="px-4 py-2 w-full bg-[#009788] text-white border border-slate-300 rounded-md">
							Klik Disini
						</span>
						<span
							onClick={onCancel}
							className="px-4 py-2 w-full bg-gray-200 rounded-md">
							Nanti Saja
						</span>
					</div>
				</div>
			</>
		),
		pending: (
			<>
				<div className="flex flex-col items-center text-sm text-center ">
					<img
						src="/img/profile.svg"
						className="size-32 mt-8"
						alt=""
					/>
					<p className="text-slate-600 text-left pt-3 ">
						Lengkapi Profil Anda untuk mendapatkan <br /> nomor KTA
					</p>
					{children}
					<div className="flex flex-col mt-3 gap-2 w-full *:cursor-pointer">
						<div
							onClick={onAccept}
							className="px-4 py-2 w-full bg-[#009788] text-white border border-slate-300 rounded-md">
							Klik Disini
						</div>
						<span
							onClick={onCancel}
							className="px-4 py-2 w-full bg-gray-200 rounded-md">
							Nanti Saja
						</span>
					</div>
				</div>
			</>
		),
		payment: (
			<>
				<div className="flex flex-col items-center text-sm text-center">
					<div className="w-full text-left text-lg text-slate-700">
						<h1 className="font-semibold">Jadilah anggota AGPAII</h1>
					</div>
					<img
						src="/img/payment.svg"
						alt=""
						className="size-40"
					/>
					<div className="flex flex-col gap-2 w-full items-start">
						<ul className="flex flex-col text-slate-600 list-disc text-left px-6">
							<li>Mendapatkan KTA Digital</li>
							<li>
								<span>Dapat mengakses fitur AGPAII Digital</span>
							</li>
						</ul>
					</div>

					<div className="flex flex-col mt-3 gap-2 w-full *:cursor-pointer">
						{pending ? (
							<div className="w-full flex justify-center py-2">
								<Loader className="size-8" />
							</div>
						) : (
							<>
								<div
									onClick={onAccept}
									className="px-4 py-2 w-full bg-[#009788] text-white border border-slate-300 rounded-md">
									Bayar Sekarang
								</div>

								<span
									onClick={onCancel}
									className="px-4 py-2 w-full bg-gray-200 rounded-md">
									Batal
								</span>
							</>
						)}
					</div>
				</div>
			</>
		),
	};

	return contents[type];
}
