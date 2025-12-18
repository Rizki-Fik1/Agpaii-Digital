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
		<div className="p-6 bg-gray-50 min-h-screen pt-[5.21rem]">
			<TopBar withBackButton>Sholat Tarawih</TopBar>

			<div className="max-w-4xl mx-auto space-y-8">
				{/* Section Niat */}
				<section className="bg-white rounded-xl p-6 shadow-sm">
					<h2 className="text-2xl font-bold text-emerald-700 mb-4 border-b pb-2">
						Niat Sholat Tarawih
					</h2>
					<div className="grid gap-4">
						{data.sholat_tarawih.niat.map((niat, index) => (
							<div
								key={index}
								className="bg-gray-50 p-4 rounded-lg">
								<h3 className="font-semibold text-emerald-700 mb-2">
									{niat.type.toUpperCase()}
								</h3>
								<p className="text-3xl text-right leading-relaxed mb-2 font-arabic">
									{niat.arabic}
								</p>
								<p className="text-gray-600 italic mb-2">{niat.latin}</p>
								<p className="text-gray-700">{niat.arti}</p>
							</div>
						))}
					</div>
				</section>

				{/* Section Tata Cara */}
				<section className="bg-white rounded-xl p-6 shadow-sm">
					<h2 className="text-2xl font-bold text-emerald-700 mb-4 border-b pb-2">
						Tata Cara Sholat Tarawih
					</h2>
					<ol className="space-y-6">
						{data.sholat_tarawih.steps.map((step, index) => (
							<li
								key={index}
								className="group">
								<div className="flex flex-col gap-2">
									<div className="flex items-center gap-2">
										<span className="flex items-center justify-center w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full">
											{index + 1}
										</span>
										<h3 className="font-semibold text-lg text-gray-800">
											{step.name}
										</h3>
										{step.note && (
											<span className="text-sm text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
												{step.note}
											</span>
										)}
									</div>

									{step.arabic && (
										<p className="text-3xl text-right leading-relaxed font-arabic">
											{step.arabic}
										</p>
									)}

									{step.example && (
										<div className="ml-4 pl-4 border-l-2 border-emerald-100">
											<h4 className="text-sm font-semibold text-gray-500 mb-1">
												Contoh:
											</h4>
											<p className="text-2xl text-right font-arabic">
												{step.example.arabic}
											</p>
											<p className="text-gray-600 italic">
												{step.example.latin}
											</p>
										</div>
									)}

									{step.latin && (
										<p className="text-gray-600 italic">{step.latin}</p>
									)}

									{step.translation && (
										<p className="text-gray-700">
											Artinya: `{step.translation}``
										</p>
									)}
								</div>
							</li>
						))}
					</ol>
				</section>

				{/* Section Doa Setelah Tarawih */}
				<section className="bg-white rounded-xl p-6 shadow-sm">
					<h2 className="text-2xl font-bold text-emerald-700 mb-4 border-b pb-2">
						Doa Setelah Tarawih
					</h2>
					<div className="space-y-4">
						<p className="text-3xl text-right leading-relaxed font-arabic">
							{data.sholat_tarawih.doa_after.arabic}
						</p>
						<pre className="text-gray-600 italic whitespace-pre-wrap">
							{data.sholat_tarawih.doa_after.latin}
						</pre>
						<div className="p-4 bg-gray-50 rounded-lg">
							<p className="text-gray-700">
								{data.sholat_tarawih.doa_after.arti}
							</p>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
};

export default TarawihPage;
