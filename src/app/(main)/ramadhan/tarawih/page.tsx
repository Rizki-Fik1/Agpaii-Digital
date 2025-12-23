import TopBar from "@/components/nav/topbar";
import React from "react";

const data = {
	sholat_tarawih: {
		niat: [
			{
				type: "sendiri",
				arabic:
					"اُصَلِّى سُنَّةَ التَّرَاوِيْحِ رَكْعَتَيْنِ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلهِ تَعَالَى",
				latin:
					"Ushalli sunnatat tarāwīhi rak'atayni mustaqbilal qiblati lillāhi ta'ālā",
				arti: "Aku niat sholat sunnah tarawih dua rakaat dengan menghadap kiblat, saat ini, karena Allah Ta'ala.",
			},
			{
				type: "makmum",
				arabic:
					"اُصَلِّى سُنَّةَ التَّرَاوِيْحِ رَكْعَتَيْنِ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً مَأْمُوْمًا لِلهِ تَعَالَى",
				latin:
					"Ushalli sunnatat tarawihi rak'atayni mustaqbilal qiblati ada'an ma'muman lilahi ta'alaa",
				arti: "Aku niat sholat sunnah tarawih dua rakaat dengan menghadap kiblat, saat ini sebagai makmum karena Allah Ta'ala.",
			},
			{
				type: "imam",
				arabic:
					"اُصَلِّى سُنَّةَ التَّرَاوِيْحِ رَكْعَتَيْنِ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً إِمَامًا ِللهِ تَعَالَى",
				latin:
					"Ushalli sunnatat tarawihi rak'atayni mustaqbilal qiblati ada'an imaman lilahi ta'alaa",
				arti: "Aku niat sholat sunnah tarawih dua rakaat dengan menghadap kiblat, saat ini sebagai imam karena Allah Ta'ala.",
			},
		],
		steps: [
			{
				name: "Takbiratul Ihram",
				arabic: "اللّٰهُ أَكْبَرُ",
				latin: "Allāhu Akbar",
				translation: "Allah Maha Besar",
			},
			{
				name: "Doa Iftitah",
				arabic:
					"سُبْحَانَكَ اللّٰهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَلَا إِلٰهَ غَيْرُكَ",
				latin:
					"Subḥānaka Allāhumma wa biḥamdika wa tabārakasmuka wa ta‘ālā jadduka wa lā ilāha ghairuka.",
				translation:
					"Maha Suci Engkau, ya Allah, dengan memuji-Mu. Mahaberkah nama-Mu, Maha tinggi keagungan-Mu, dan tidak ada ilah selain Engkau.",
				note: "disunnahkan",
			},
			{
				name: "Membaca Surat Al-Fatihah",
				arabic:
					"بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ الْحَمْدُ لِلّٰهِ رَبِّ الْعٰلَمِيْنَ الرَّحْمٰنِ الرَّحِيْمِ مٰلِكِ يَوْمِ الدِّيْنِ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِيْنُ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيْمَ صِرَاطَ الَّذِيْنَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوْبِ عَلَيْهِمْ وَلَا الضَّآلِّيْنَ آمِّيْنَ",
			},
			{
				name: "Membaca Surat Pendek",
				example: {
					name: "Al-Ikhlas",
					arabic:
						"قُلْ هُوَ اللّٰهُ أَحَدٌ اَللّٰهُ الصَّمَدُ لَمْ يَلِدْ وَلَمْ يُوْلَدْ وَلَمْ يَكُنْ لَّهُ كُفُوًا أَحَدٌ",
					latin:
						"Qul huwallāhu aḥad, Allāhuṣ-ṣamad, lam yalid wa lam yūlad, wa lam yakul lahū kufuwan aḥad.",
				},
			},
			{
				name: "Rukuk",
				arabic: "سُبْحَانَ رَبِّيَ الْعَظِيْمِ",
				latin: "Subḥāna rabbiyal ‘aẓīm",
				translation: "Maha Suci Tuhanku Yang Maha Agung",
			},
			{
				name: "I’tidal",
				arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ رَبَّنَا لَكَ الْحَمْدُ",
				latin: "Sami‘allāhu liman ḥamidah, Rabbanā lakal-ḥamd",
				translation:
					"Allah Maha Mendengar hamba yang memuji-Nya. Wahai Tuhan kami, segala puji bagi-Mu.",
			},
			{
				name: "Sujud Pertama",
				arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
				latin: "Subḥāna rabbiyal a‘lā",
				translation: "Maha Suci Tuhanku Yang Maha Tinggi",
			},
			{
				name: "Duduk di Antara Dua Sujud",
				arabic:
					"رَبِّ اغْفِرْ لِيْ وَارْحَمْنِيْ وَاجْبُرْنِيْ وَارْفَعْنِيْ وَارْزُقْنِيْ وَاهْدِنِيْ وَعَافِنِيْ وَاعْفُ عَنِّيْ",
			},
			{
				name: "Sujud Kedua",
				arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
				latin: "Subḥāna rabbiyal a‘lā",
				translation: "Maha Suci Tuhanku Yang Maha Tinggi",
			},
			{
				name: "Tasyahud Akhir",
				arabic:
					"التَّحِيَّاتُ لِلّٰهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللّٰهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَىٰ عِبَادِ اللّٰهِ الصَّالِحِيْنَ، أَشْهَدُ أَنْ لَّا إِلٰهَ إِلَّا اللّٰهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُوْلُهُ",
				translation:
					"Segala penghormatan, keberkahan, kebahagiaan, dan kebaikan adalah milik Allah. Semoga kesejahteraan, rahmat, dan berkah Allah dilimpahkan kepadamu, wahai Nabi. Semoga kesejahteraan dilimpahkan kepada kami dan hamba-hamba Allah yang saleh. Aku bersaksi bahwa tiada Tuhan selain Allah dan aku bersaksi bahwa Muhammad adalah hamba dan utusan-Nya.",
			},
			{
				name: "Salam",
				arabic: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللّٰهِ (Ke kanan dan kiri)",
				translation: "Semoga keselamatan dan rahmat Allah tercurah kepadamu.",
			},
		],
		doa_after: {
			arabic:
				"اَللّٰهُمَّ اجْعَلْنَا بِالْإِيْمَانِ كَامِلِيْنَ... وَالْحَمْدُ لِلّٰهِ رَبِّ الْعَالَمِيْنَ",
			latin:
				"Allâhummaj'alnâ bil îmâni kâmilîn... Wal hamdulillâhi rabbil 'âlamîn.",
			arti: "Ya Allah, jadikanlah kami orang-orang yang sempurna imannya... Segala puji bagi Allah, tuhan semesta alam.",
		},
	},
};

const TarawihPage = () => {
	return (
		<div className="bg-gradient-to-b from-emerald-50 to-white min-h-screen pt-[4.2rem]">
			<TopBar withBackButton>Sholat Tarawih</TopBar>
			
			<div className="max-w-4xl mx-auto px-4 py-6">
				{/* Header Section */}
				<div className="bg-gradient-to-r from-[#009788] to-[#00b894] rounded-2xl p-6 mb-6 text-white shadow-lg">
					<div className="flex items-center gap-3 mb-2">
						<h1 className="text-2xl font-bold">Panduan Sholat Tarawih</h1>
					</div>
					<p className="text-emerald-50 text-sm">
						Tata cara lengkap melaksanakan sholat tarawih di bulan Ramadhan
					</p>
				</div>

				{/* Section Niat */}
				<div className="mb-5 bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
					<div className="bg-gradient-to-r from-[#009788] to-[#00b894] px-5 py-4">
						<div className="flex items-center gap-3">
							<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
								<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
								<path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
							</svg>
							<h2 className="text-xl font-bold text-white">Niat Sholat Tarawih</h2>
						</div>
					</div>
					
					<div className="p-5 space-y-4">
						{data.sholat_tarawih.niat.map((niat, index) => (
							<div key={index} className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
								<div className="flex items-center gap-2 mb-3">
									<h3 className="font-bold text-[#07806F ] uppercase">{niat.type}</h3>
								</div>
								<p className="font-arabic text-right text-2xl mb-3 leading-loose text-gray-800">
									{niat.arabic}
								</p>
								<p className="text-gray-600 italic text-sm mb-2">{niat.latin}</p>
								<p className="text-gray-700 text-sm">{niat.arti}</p>
							</div>
						))}
					</div>
				</div>

				{/* Section Tata Cara */}
				<div className="mb-5 bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
					<div className="bg-gradient-to-r from-[#009788] to-[#00b894] px-5 py-4">
						<div className="flex items-center gap-3">
							<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
								<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
							</svg>
							<h2 className="text-xl font-bold text-white">Tata Cara Sholat Tarawih</h2>
						</div>
					</div>
					
					<div className="p-5 space-y-4">
						{data.sholat_tarawih.steps.map((step, index) => (
							<div key={index} className="bg-gray-50 rounded-xl p-4 border-l-4 border-[#009788]">
								<div className="flex items-start gap-3 mb-3">
									<div className="bg-[#009788] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
										{index + 1}
									</div>
									<div className="flex-1">
										<div className="flex items-center gap-2 flex-wrap">
											<h3 className="font-bold text-gray-900">{step.name}</h3>
											{step.note && (
												<span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
													{step.note}
												</span>
											)}
										</div>
									</div>
								</div>

								{step.arabic && (
									<div className="bg-white rounded-lg p-3 mb-2">
										<p className="font-arabic text-right text-xl leading-loose text-gray-800">
											{step.arabic}
										</p>
									</div>
								)}

								{step.example && (
									<div className="rounded-lg p-3 mb-2">
										<p className="text-xs font-semibold text-[#07806F] mb-2">
											Contoh: {step.example.name}
										</p>
										<p className="font-arabic text-right text-lg leading-loose text-gray-800 mb-1">
											{step.example.arabic}
										</p>
										<p className="text-gray-600 italic text-xs">
											{step.example.latin}
										</p>
									</div>
								)}

								{step.latin && (
									<p className="text-gray-600 italic text-sm mb-1">{step.latin}</p>
								)}

								{step.translation && (
									<p className="text-gray-700 text-sm">
										<span className="font-semibold">Artinya:</span> {step.translation}
									</p>
								)}
							</div>
						))}
					</div>
				</div>

				{/* Section Doa Setelah Tarawih */}
				<div className="mb-5 bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
					<div className="bg-gradient-to-r from-[#009788] to-[#00b894] px-5 py-4">
						<div className="flex items-center gap-3">
							<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
								<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
							</svg>
							<h2 className="text-xl font-bold text-white">Doa Setelah Tarawih</h2>
						</div>
					</div>
					
					<div className="p-5 space-y-4">
						<div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4">
							<p className="font-arabic text-right text-2xl mb-3 leading-loose text-gray-800">
								{data.sholat_tarawih.doa_after.arabic}
							</p>
							<p className="text-gray-600 italic text-sm mb-3 whitespace-pre-wrap">
								{data.sholat_tarawih.doa_after.latin}
							</p>
							<div className="bg-white rounded-lg p-3">
								<p className="text-gray-700 text-sm">
									<span className="font-semibold">Artinya:</span> {data.sholat_tarawih.doa_after.arti}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="bg-white rounded-2xl p-6 text-center shadow-md border border-gray-100 mb-6">
					<p className="text-gray-600 text-sm">
						Semoga panduan ini bermanfaat dalam melaksanakan ibadah sholat tarawih
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

export default TarawihPage;
