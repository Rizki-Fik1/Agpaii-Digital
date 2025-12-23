import TopBar from "@/components/nav/topbar";
import React from "react";

const data = {
	sholat_idul_fitri: {
		steps: [
			{
				step: 1,
				title: "Niat Shalat Id",
				description:
					"Membaca niat shalat Idul Fitri sebagai imam, makmum, atau sendiri",
				arabic:
					"أُصَلِّي سُنَّةً لعِيْدِ اْلفِطْرِ رَكْعَتَيْنِ (مَأْمُوْمًا/إِمَامًا) لِلّٰهِ تَعَــالَى",
				translation:
					"Aku niat shalat sunnah Idul Fitri dua rakaat (menjadi makmum/imam) karena Allah ta’ala.",
				notes: [
					"Hukum melafalkan niat adalah sunnah",
					"Yang wajib adalah niat dalam hati (sengaja menunaikan shalat Idul Fitri)",
				],
			},
			{
				step: 2,
				title: "Takbiratul Ihram",
				description:
					"Takbir pembuka shalat diikuti takbir tambahan pada rakaat pertama",
				additional_takbir: {
					count: 7,
					recommended_readings: [
						{
							arabic:
								"اللهُ أَكْبَرُ كَبِيرًا، وَالْحَمْدُ لِلّٰهِ كَثِيرًا، وَسُبْحَانَ اللهِ بُكْرَةً وَأَصِيلًا",
							translation:
								"Allah Maha Besar dengan segala kebesaran, segala puji bagi Allah dengan pujian yang banyak, Maha Suci Allah, baik waktu pagi dan petang.",
						},
						{
							arabic:
								"سُبْحَانَ اللهِ وَالْحَمْدُ لِلّٰهِ وَلاَ إِلٰهَ إِلاَّ اللهُ وَاللهُ أَكْبَرُ",
							translation:
								"Maha Suci Allah, segala puji bagi Allah, tiada tuhan selain Allah, Allah maha besar.",
						},
					],
					notes: [
						"Hukum takbir tambahan adalah sunnah",
						"Dibaca di antara tiap takbir tambahan",
					],
				},
			},
			{
				step: 3,
				title: "Membaca Al-Fatihah",
				description:
					"Membaca surat Al-Fatihah dan surat pendek setelah takbir tambahan",
				actions: [
					"Membaca Al-Fatihah (wajib)",
					"Dianjurkan membaca Surat Al-A'la",
					"Melanjutkan gerakan shalat seperti biasa (rukuk, sujud, dll)",
				],
			},
			{
				step: 4,
				title: "Rakaat Kedua",
				description: "Tata cara rakaat kedua dengan takbir tambahan",
				additional_takbir: {
					count: 5,
					actions: [
						"Membaca Al-Fatihah",
						"Dianjurkan membaca Surat Al-Ghasyiyah",
						"Melanjutkan gerakan shalat hingga salam",
					],
					notes: [
						"Bacaan di antara takbir sama seperti rakaat pertama",
						"Kelupaan melakukan takbir tambahan tidak membatalkan shalat",
					],
				},
			},
			{
				step: 5,
				title: "Mendengar Khutbah",
				description: "Menyimak khutbah Idul Fitri setelah shalat",
				hadith: {
					arabic: "السنة أن يخطب الإمام في العيدين خطبتين يفصل بينهما بجلوس",
					translation:
						"Sunnah seorang Imam berkhutbah dua kali pada shalat hari raya (Idul Fitri dan Idul Adha), dan memisahkan kedua khutbah dengan duduk.",
					source: "HR Asy-Syafi’i",
				},
				sunnah_khutbah: [
					"Khutbah pertama dimulai dengan 9 takbir",
					"Khutbah kedua dimulai dengan 7 takbir",
				],
				notes: [
					"Wajib didengarkan bagi jamaah",
					"Tidak diwajibkan jika shalat dilakukan sendirian",
				],
			},
		],
	},
};
const IdulFitriPage = () => {
	return (
		<div className="bg-gradient-to-b from-emerald-50 to-white min-h-screen pt-[4.2rem]">
			<TopBar withBackButton>Panduan Sholat Idul Fitri</TopBar>
			
			<div className="max-w-4xl mx-auto px-4 py-6">
				{/* Header Section */}
				<div className="bg-gradient-to-r from-[#009788] to-[#00b894] rounded-2xl p-6 mb-6 text-white shadow-lg">
					<div className="flex items-center gap-3 mb-2">
						<h1 className="text-2xl font-bold">Tata Cara Sholat Idul Fitri</h1>
					</div>
					<p className="text-emerald-50 text-sm">
						Panduan lengkap melaksanakan sholat Idul Fitri sesuai sunnah
					</p>
				</div>

				{/* Steps */}
				{data.sholat_idul_fitri.steps.map((stepData, index) => (
					<div
						key={index}
						className="mb-5 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-100">
						
						{/* Step Header */}
						<div className="bg-gradient-to-r from-[#009788] to-[#00b894] px-5 py-4">
							<div className="flex items-center gap-3">
								<div className="bg-white text-[#009788] rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg shadow-md">
									{stepData.step}
								</div>
								<h2 className="text-xl font-bold text-white">
									{stepData.title}
								</h2>
							</div>
						</div>

						{/* Step Content */}
						<div className="p-5 space-y-4">
							{/* Description */}
							<p className="text-gray-700 leading-relaxed">
								{stepData.description}
							</p>

							{/* Arabic Text & Translation */}
							{stepData.arabic && (
								<div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4">
									<p className="font-arabic text-right text-2xl mb-3 leading-loose text-gray-800">
										{stepData.arabic}
									</p>
									<div className="flex items-start gap-2">
										<svg className="w-5 h-5 text-[#009788] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
											<path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
										</svg>
										<p className="text-gray-600 italic text-sm leading-relaxed">
											{stepData.translation}
										</p>
									</div>
								</div>
							)}

							{/* Notes */}
							{stepData.notes && stepData.notes.length > 0 && (
								<div className="bg-amber-50 rounded-xl p-4">
									<h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
										<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
											<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
										</svg>
										Catatan
									</h3>
									<ul className="space-y-2">
										{stepData.notes.map((note, noteIndex) => (
											<li key={noteIndex} className="flex items-start gap-2 text-gray-700 text-sm">
												<svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
													<circle cx="12" cy="12" r="3"/>
												</svg>
												<span>{note}</span>
											</li>
										))}
									</ul>
								</div>
							)}

							{/* Additional Takbir */}
							{stepData.additional_takbir && (
								<div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4">
									<h3 className="font-bold mb-3 flex items-center gap-2">
										<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
											<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
										</svg>
										Takbir Tambahan
									</h3>
									<div className="rounded-lg p-3 mb-3">
										<p className="text-gray-700 font-semibold">
											Jumlah Takbir: <span className="text-[#009788] text-lg">{stepData.additional_takbir.count}x</span>
										</p>
									</div>
									
									{stepData.additional_takbir.recommended_readings &&
										stepData.additional_takbir.recommended_readings.length > 0 && (
											<div className="space-y-3">
												<h4 className="font-semibold text-sm">Bacaan yang Dianjurkan:</h4>
												{stepData.additional_takbir.recommended_readings.map(
													(reading, readingIndex) => (
														<div
															key={readingIndex}
															className="rounded-lg p-3">
															<p className="font-arabic text-right text-xl mb-2 leading-loose text-gray-800">
																{reading.arabic}
															</p>
															<p className="text-gray-600 italic text-sm">
																{reading.translation}
															</p>
														</div>
													),
												)}
											</div>
										)}
									
									{stepData.additional_takbir.notes &&
										stepData.additional_takbir.notes.length > 0 && (
											<div className="mt-3">
												<ul className="space-y-2">
													{stepData.additional_takbir.notes.map(
														(note, noteIndex) => (
															<li key={noteIndex} className="flex items-start gap-2 text-gray-700 text-sm">
																<svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
																	<circle cx="12" cy="12" r="3"/>
																</svg>
																<span>{note}</span>
															</li>
														),
													)}
												</ul>
											</div>
										)}
								</div>
							)}

							{/* Actions */}
							{stepData.actions && stepData.actions.length > 0 && (
								<div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4">
									<h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
										<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
											<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
										</svg>
										Anjuran
									</h3>
									<ul className="space-y-2">
										{stepData.actions.map((action, actionIndex) => (
											<li key={actionIndex} className="flex items-start gap-2 text-gray-700 text-sm">
												<svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
													<circle cx="12" cy="12" r="3"/>
												</svg>
												<span>{action}</span>
											</li>
										))}
									</ul>
								</div>
							)}

							{/* Hadith */}
							{stepData.hadith && (
								<div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4">
									<h3 className="font-bold mb-3 flex items-center gap-2">
										<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
											<path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
										</svg>
										Hadits Terkait Khutbah
									</h3>
									<div className="rounded-lg p-3 mb-2">
										<p className="font-arabic text-right text-xl mb-2 leading-loose text-gray-800">
											{stepData.hadith.arabic}
										</p>
										<p className="italic text-sm mb-1">
											{stepData.hadith.translation}
										</p>
										<p className="font-semibold text-xs">
											— {stepData.hadith.source}
										</p>
									</div>
								</div>
							)}

							{/* Sunnah Khutbah */}
							{stepData.sunnah_khutbah && stepData.sunnah_khutbah.length > 0 && (
								<div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4">
									<h3 className="font-bold mb-2 flex items-center gap-2">
										Sunnah Khutbah
									</h3>
									<ul className="space-y-2">
										{stepData.sunnah_khutbah.map((sunnah, sunnahIndex) => (
											<li key={sunnahIndex} className="flex items-start gap-2 text-gray-700 text-sm">
												<svg className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
													<circle cx="12" cy="12" r="3"/>
												</svg>
												<span>{sunnah}</span>
											</li>
										))}
									</ul>
								</div>
							)}
						</div>
					</div>
				))}

				{/* Footer */}
				<div className="bg-white rounded-2xl p-6 text-center shadow-md border border-gray-100 mb-6">
					<p className="text-gray-600 text-sm">
						Semoga panduan ini bermanfaat dalam melaksanakan ibadah sholat Idul Fitri
					</p>
					<p className="text-[#009788] font-semibold mt-2">
						تَقَبَّلَ اللهُ مِنَّا وَمِنْكُمْ
					</p>
					<p className="text-gray-500 text-xs mt-1 italic">
						(Semoga Allah menerima (amal) dari kami dan dari kalian)
					</p>
				</div>
			</div>
		</div>
	);
};

export default IdulFitriPage;
