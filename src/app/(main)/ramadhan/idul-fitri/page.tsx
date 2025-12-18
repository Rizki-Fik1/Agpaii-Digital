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
		<div className="p-6 bg-gray-50 min-h-screen pt-[5.21rem]">
			<TopBar withBackButton>Panduan Sholat Idul Fitri</TopBar>
			{data.sholat_idul_fitri.steps.map((stepData, index) => (
				<div
					key={index}
					className="mb-6 p-4 rounded-lg border border-gray-200">
					<h2 className="text-xl font-semibold mb-2">
						Langkah {stepData.step}: {stepData.title}
					</h2>
					<p className="text-gray-700 mb-2">{stepData.description}</p>

					{stepData.arabic && (
						<div className="mb-2">
							<p className="font-arabic text-right text-xl mb-1">
								{stepData.arabic}
							</p>
							<p className="text-gray-600 italic">({stepData.translation})</p>
						</div>
					)}

					{stepData.notes && stepData.notes.length > 0 && (
						<div className="mb-2">
							<h3 className="font-semibold">Catatan:</h3>
							<ul className="list-disc list-inside text-gray-700">
								{stepData.notes.map((note, noteIndex) => (
									<li key={noteIndex}>{note}</li>
								))}
							</ul>
						</div>
					)}

					{stepData.additional_takbir && (
						<div className="mb-2">
							<h3 className="font-semibold mb-1">Takbir Tambahan:</h3>
							<p className="text-gray-700">
								Jumlah Takbir: {stepData.additional_takbir.count}
							</p>
							{stepData.additional_takbir.recommended_readings &&
								stepData.additional_takbir.recommended_readings.length > 0 && (
									<div className="mt-2">
										<h4 className="font-semibold">Bacaan yang Dianjurkan:</h4>
										{stepData.additional_takbir.recommended_readings.map(
											(reading, readingIndex) => (
												<div
													key={readingIndex}
													className="mb-2">
													<p className="font-arabic text-right text-lg mb-1">
														{reading.arabic}
													</p>
													<p className="text-gray-600 italic">
														({reading.translation})
													</p>
												</div>
											),
										)}
									</div>
								)}
							{stepData.additional_takbir.notes &&
								stepData.additional_takbir.notes.length > 0 && (
									<div className="mt-2">
										<h4 className="font-semibold">Catatan Takbir Tambahan:</h4>
										<ul className="list-disc list-inside text-gray-700">
											{stepData.additional_takbir.notes.map(
												(note, noteIndex) => (
													<li key={noteIndex}>{note}</li>
												),
											)}
										</ul>
									</div>
								)}
						</div>
					)}

					{stepData.actions && stepData.actions.length > 0 && (
						<div className="mb-2">
							<h3 className="font-semibold">Anjuran:</h3>
							<ul className="list-disc list-inside text-gray-700">
								{stepData.actions.map((action, actionIndex) => (
									<li key={actionIndex}>{action}</li>
								))}
							</ul>
						</div>
					)}

					{stepData.hadith && (
						<div className="mb-2">
							<h3 className="font-semibold">Hadits Terkait Khutbah:</h3>
							<p className="font-arabic text-right text-lg mb-1">
								{stepData.hadith.arabic}
							</p>
							<p className="text-gray-600 italic">
								({stepData.hadith.translation}) - {stepData.hadith.source}
							</p>
						</div>
					)}

					{stepData.sunnah_khutbah && stepData.sunnah_khutbah.length > 0 && (
						<div>
							<h3 className="font-semibold">Sunnah Khutbah:</h3>
							<ul className="list-disc list-inside text-gray-700">
								{stepData.sunnah_khutbah.map((sunnah, sunnahIndex) => (
									<li key={sunnahIndex}>{sunnah}</li>
								))}
							</ul>
						</div>
					)}
				</div>
			))}
		</div>
	);
};

export default IdulFitriPage;
