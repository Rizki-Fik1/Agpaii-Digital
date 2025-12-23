import TopBar from "@/components/nav/topbar";
import React from "react";

const data = {
	title: "DOA RAMADHAN",
	data: [
		{
			hari: 1,
			judul: "Doa Hari ke-1 Puasa Ramadhan",
			arabic:
				"اَللَّهُمَّ اجْعَلْ صِيَامِي فِيْهِ صِيَامَ الصَّائِمِيْنَ، وَقِيَامِي فِيْهِ قِيَامَ الْقَائِمِيْنَ، وَنَبِّهْنِي فِيْهِ عَنْ نَوْمَةِ الْغَافِلِيْنَ، وَهَبْ لِي جُرْمِي فِيْهِ يَا اِلَهَ الْعَالَمِيْنَ، وَاعْفُ عَنِّي يَا عَافِياً عَنْ الْمُجْرِمِيْنَ",
			latin:
				"Allâhummaj’al shiyâmî fîhi shiyâmash shâimîn, wa qiyâmî fîhi qiyâmal qâimîn, wa nabbihnî fîhi ‘an nawmatil ghâfilîn, wa hablî jurmî fîhi yâ Ilâhal ‘âlamîn, wa’fu ‘annî yâ ‘âfiyan ‘anil mujrimîn.",
			terjemah:
				"Ya Allah, jadikan puasaku di bulan ini sebagai puasa orang-orang yang berpuasa sebenarnya, shalat malamku di dalamnya sebagai orang yang shalat malam sebenarnya, bangunkan aku di dalamnya dari tidurnya orang-orang yang lalai. Bebaskan aku dari dosa-dosaku wahai Tuhan semesta alam. Maafkan aku wahai Yang memberi ampunan kepada orang-orang yang berbuat dosa.",
		},
		{
			hari: 2,
			judul: "Doa Hari ke-2 Puasa Ramadhan",
			arabic:
				"اَللَّهُمَ قَرّ ِبْنِيْ فِيْهِ اِلَى مَرْضَاتِكَ وَجَنَّبْنِيْ فِيْهِ مِنْ سَخَطِكَ وَنَقِمَاتِكَ وَوَفِّقْنِيْ فِيْهِ لِقِرآئَةِ اَيَاتِكَ بِرَحْمَتِكَ يَااَرْحَمَ الرَّاحِمِيْنَ",
			latin:
				"Allâhumma qarribnî fîhi ilâ mardhâtika wa jannibnî fîhi min sakhatika wa naqimâtika wa waffiqnî fîhi liqirâ-ati âyâtika birahmatika yâ arhamar râhimîn.",
			terjemah:
				"Ya Allah! Mohon dekatkanlah aku kepada keridhaan-Mu dan jauhkanlah aku dari kemurkaan serta balasan-Mu. Mohon berilah aku kemampuan untuk membaca ayat-ayat-Mu dengan rahmat-Mu, Wahai Maha Pengasih dari semua yang Pengasih.",
		},
		{
			hari: 3,
			judul: "Doa Hari ke-3 Puasa Ramadhan",
			arabic:
				"اَللَّهُمَّ ارْزُقْنِيْ فِيْهِ الذِّهْنِ وَالتَّنْبِيْهِ وَبَاعِدْنِيْ فِيْهِ مِنَ السَّفَاهَةِ وَالتَمْوِيْهِ وَاجْعَلْ لِي نَصِيْبًا مِنْ كُلِّ خَيْرٍ تُنْزِلُ فِيْهِ بِجُوْدِكَ يَا اَجْوَدَ ْالآجْوَدِيْنَ",
			latin:
				"Allâhummarzuqnî fîhidz dzihna wattanbîh wa bâ’idnî fîhi minas safâhati wattamwîh waj’al lî nashîban min kulli khairin tunzilu fîhi bijûdika yâ ajwadal ajwadîn.",
			terjemah:
				"Ya Allah! Mohon berikanlah aku rezeki akal dan kewaspadaan, serta jauhkanlah aku dari kebodohan dan kesesatan. Anugerahkanlah kepadaku bagian dari segala kebaikan yang Engkau turunkan, demi kemurahan-Mu, wahai Yang Maha Dermawan dari semua dermawan.",
		},
		{
			hari: 4,
			judul: "Doa Hari ke-4 Puasa Ramadhan",
			arabic:
				"اَللَّهُمَّ قَوِّنِيْ فِيْهِ عَلَى إِقَامَةِ أَمْرِكَ وَ أَذِقْنِيْ فِيْهِ حَلاَوَةَ ذِكْرِكَ وَ أَوْزِعْنِيْ فِيْهِ لأدَاءِ شُكْرِكَ بِكَرَمِكَ وَ احْفَظْنِيْ فِيْهِ بِحِفْظِكَ وَ سِتْرِكَ يَا أَبْصَرَ النَّاظِرِيْنَ",
			latin:
				"Allâhumma qawwinii fiihi ‘alaa iqoomati amrika wa adziqnii fiihi halaawata dzikrika wa audzi’nii fiihi li adaai syukrika bikaramika wahfazhnii fiihi bihifzhika wa sitrika yaa absharan-naazhiriin.",
			terjemah:
				"Ya Allah! Mohon berikanlah kekuatan kepadaku untuk menegakkan perintah-perintah-Mu, dan berilah aku manisnya berdzikir mengingat-Mu. Mohon berilah aku kekuatan untuk bersyukur kepada-Mu dengan kemuliaan-Mu. Dan jagalah aku dengan penjagaan-Mu dan perlindungan-Mu, wahai Yang Maha Melihat.",
		},
		{
			hari: 5,
			judul: "Doa Hari ke-5 Puasa Ramadhan",
			arabic:
				"اَللَّهُمَّ اجْعَلْنِيْ فِيْهِ مِنَ الْمُسْتَغْفِرِيْنَ وَ اجْعَلْنِيْ فِيْهِ مِنْ عِبَادِكَ الصَّالِحِيْنَ الْقَانِتِيْنَ وَ اجْعَلْنِيْ فِيْهِ مِنْ أَوْلِيَائِكَ الْمُقَرَّبِيْنَ بِرَأْفَتِكَ يَا أَرْحَمَ الرَّاحِمِيْنَ",
			latin:
				"Allâhummaj’alnî fîhi minal mustaghfirîn waj’alnî fîhi min ‘ibâdikas shâlihîn al qânitîn waj’alnî fîhi min awliyâ-ikal muqarrabîn bira’fatika yâ arhamarrâhimîn.",
			terjemah:
				"Ya Allah! Mohon jadikanlah aku di bulan ini termasuk di antara orang-orang yang memohon ampunan, dan jadikanlah aku sebagai hamba-Mu yang saleh dan setia. Serta mohon jadikanlah aku di antara auliya’-Mu yang dekat di sisi-Mu, dengan kelembutan-Mu, wahai Yang Maha Pengasih di antara semua pengasih.",
		},
		{
			hari: 6,
			judul: "Doa Hari ke-6 Puasa Ramadhan",
			arabic:
				"اَللَّهُمَّ لاَ تَخْذُلْنِيْ فِيْهِ لِتَعَرُّضِ مَعْصِيَتِكَ وَ لاَ تَضْرِبْنِيْ بِسِيَاطِ نَقِمَتِكَ وَ زَحْزِحْنِيْ فِيْهِ مِنْ مُوْجِبَاتِ سَخَطِكَ بِمَنِّكَ وَ أَيَادِيْكَ يَا مُنْتَهَى رَغْبَةِ الرَّاغِبِيْنَ",
			latin:
				"Allâhumma lâ takhdzulnî fîhi lita’arrudhi ma’shiyatika wa lâ tadhribnî bisiyâthi naqimatika wa zahzihnî fîhi min mûjibâti sakhatika bimannika wa ayâdîka yâ muntahâ raghbatirrâghibîn.",
			terjemah:
				"Ya Allah! Janganlah Engkau hinakan aku di bulan ini karena perbuatan maksiatku terhadap-Mu, dan janganlah Engkau cambuk aku dengan cambuk balasan-Mu. Jauhkanlah aku dari hal-hal yang dapat menyebabkan kemurkaan-Mu, dengan kelembutan dan ketinggian rahmat-Mu, wahai pegangan terakhir orang-orang yang berkeinginan.",
		},
		{
			hari: 7,
			judul: "Doa Hari ke-7 Puasa Ramadhan",
			arabic:
				"اَللَّهُمَّ أَعِنِّيْ فِيْهِ عَلَى صِيَامِهِ وَ قِيَامِهِ وَ جَنِّبْنِيْ فِيْهِ مِنْ هَفَوَاتِهِ وَ آثَامِهِ وَ ارْزُقْنِيْ فِيْهِ ذِكْرَكَ بِدَوَامِهِ بِتَوْفِيْقِكَ يَا هَادِيَ الْمُضِلِّيْنَ",
			latin:
				"Allâhumma a’innî fîhi ‘alâ shiyâmihi wa qiyâmihi wa jannibnî fîhi min hafawâtihi wa âtsâmihi warzuqnî fîhi dzikrika bidawâmihi bitaufîqika yâ hâdiyal mudhillîn.",
			terjemah:
				"Ya Allah, bantulah aku untuk berpuasa dan shalat malam serta jauhkan aku dari kesia-siaan dan perbuatan dosa. Anugerahilah aku di dalamnya dengan dawamnya ingat pada-Mu dengan taufik-Mu, wahai Yang menunjuki orang tersesat.",
		},
		{
			hari: 8,
			judul: "Doa Hari ke-8 Puasa Ramadhan",
			arabic:
				"اَللَّهُمَّ ارْزُقْنِيْ فِيْهِ رَحْمَةَ الأَيْتَامِ وَ إِطْعَامَ الطَّعَامِ وَ إِفْشَاءَ السَّلاَمِ وَ صُحْبَةَ الْكِرَامِ بِطَوْلِكَ يَا مَلْجَأَ الآمِلِيْنَ",
			latin:
				"Allâhummarzuqnî fîhi rahmatal aytâm wa it’âmitha’âm wa ifsyâis salâm wa suhbatil kirâm bithawlika yâ malja-al âmilîn.",
			terjemah:
				"Ya Allah, anugerahilah kepada kami rasa sayang terhadap anak-anak yatim dan suka memberi makan (orang miskin) serta menyebarkan kedamaian dan bergaul dengan orang-orang mulia dengan kemurahan-Mu wahai tempat berlindung bagi orang-orang yang berharap.",
		},
		{
			hari: 9,
			judul: "Doa Hari ke-9 Puasa Ramadhan",
			arabic:
				"اَللَّهُمَّ اجْعَلْ لِيْ فِيْهِ نَصِيْبًا مِنْ رَحْمَتِكَ الْوَاسِعَةِ وَ اهْدِنِيْ فِيْهِ لِبَرَاهِيْنِكَ السَّاطِعَةِ وَ خُذْ بِنَاصِيَتِيْ إِلَى مَرْضَاتِكَ الْجَامِعَةِ بِمَحَبَّتِكَ يَا أَمَلَ الْمُشْتَاقِيْنَ",
			latin:
				"Allâhummaj’allî fîhi nashîban min rahmatikal wâsi’ah wahdinî fîhi libarâhînikas sâthi’ah wa khudz binâshiyatî ilâ mardhâtikal jâmi’ah bimahabbatika yâ amalal musytâqîn.",
			terjemah:
				"Ya Allah! Anugerahilah aku sebagian dari rahmat-Mu yang luas, dan berikanlah aku petunjuk kepada ajaran-Mu yang terang, dan bimbinglah aku menuju keridhaan-Mu yang penuh dengan kecintaan-Mu, wahai harapan orang-orang yang merindu.",
		},
		{
			hari: 10,
			judul: "Doa Hari ke-10 Puasa Ramadhan",
			arabic:
				"اَللَّهُمَّ اجْعَلْنِيْ فِيْهِ مِنَ الْمُتَوَكِّلِيْنَ عَلَيْكَ وَ اجْعَلْنِيْ فِيْهِ مِنَ الْفَائِزِيْنَ لَدَيْكَ وَ اجْعَلْنِيْ فِيْهِ مِنَ الْمُقَرَّبِيْنَ إِلَيْكَ بِإِحْسَانِكَ يَا غَايَةَ الطَّالِبِيْنَ",
			latin:
				"Allâhummaj ‘alnî fîhi minal mutawakkilîn ‘alaika waj’alnî fîhi minal fâizîn ladaika waj’alnî fîhi minal muqarrabîn ilaika biîhsânika yâ ghâyatat thâlibîn.",
			terjemah:
				"Ya Allah! Mohon jadikanlah aku di antara orang-orang yang bertawakkal kepada-Mu, dan jadikanlah aku di antara orang-orang yang menang di sisi-Mu, dan jadikanlah aku di antara orang-orang yang dekat kepada-Mu, dengan kebaikan-Mu, wahai tujuan orang-orang yang memohon.",
		},
		{
			hari: 11,
			judul: "Doa Hari ke-11 Puasa Ramadhan",
			arabic:
				"اَللَّهُمَّ حَبِّبْ إِلَيَّ فِيْهِ الْإِحْسَانَ وَ كَرِّهْ إِلَيَّ فِيْهِ الْفُسُوْقَ وَ الْعِصْيَانَ وَ حَرِّمْ عَلَيَّ فِيْهِ السَّخَطَ وَ النِّيْرَانَ بِعَوْنِكَ يَا غِيَاثَ الْمُسْتَغِيْثِيْنَ",
			latin:
				"Allâhumma habbib ilayya fîhil ihsan wa karrih fîhil fusûq wal ‘isyân wa harrim ‘alayya fîhis sakhatha wannîrân bi’aunika yâ ghiyâtsal mustaghîtsîn.",
			terjemah:
				"Ya Allah! Mohon tanamkanlah ke dalam diriku kecintaan kepada perbuatan baik, dan tanamkanlah ke dalam diriku kebencian terhadap kemaksiatan dan kefasikan. Mohon jauhkanlah dariku kemurkaan-Mu dan api neraka dengan pertolongan-Mu, wahai Penolong orang-orang yang meminta pertolongan.",
		},
		{
			hari: 12,
			judul: "Doa Hari ke-12 Puasa Ramadhan",
			arabic:
				"اَللَّهُمَّ زَيِّنِّيْ فِيْهِ بِالسِّتْرِ وَ الْعَفَافِ وَ اسْتُرْنِيْ فِيْهِ بِلِبَاسِ الْقُنُوْعِ وَ الْكَفَافِ وَ احْمِلْنِيْ فِيْهِ عَلَى الْعَدْلِ وَالإِنْصَافِ وَ آمِنِّيْ فِيْهِ مِنْ كُلِّ مَا أَخَافُ بِعِصْمَتِكَ يَا عِصْمَةَ الْخَائِفِيْنَ",
			latin:
				"Allâhumma zayyinî fîhi bissitri wal ‘afâf wasturnî fîhi bilibâsil qunû’i wal kafâf wahmilnî fîhi ‘alal ‘adli wal inshâf wa âminnî fîhi min kulli mâ akhâfu bi’ismatika yâ ‘ismatal khâifîn.",
			terjemah:
				"Ya Allah, mohon hiasilah aku di bulan ini dengan penutup aib dan kesucian. Tutupilah diriku dengan pakaian kecukupan dan kerelaan diri. Tuntunlah aku untuk senantiasa bersikap adil dan taat. Selamatkanlah aku dari segala sesuatu yang aku takuti. Dengan perlindungan-Mu, wahai tempat bernaung bagi mereka yang ketakutan.",
		},
		{
			hari: 13,
			judul: "Doa Hari ke-13 Puasa Ramadhan",
			arabic:
				"اَللَّهُمَّ طَهِّرْنِيْ فِيْهِ مِنَ الدَّنَسِ وَ الْأَقْذَارِ وَ صَبِّرْنِيْ فِيْهِ عَلَى كَائِنَاتِ الْأَقْدَارِ وَ وَفِّقْنِيْ فِيْهِ لِلتُّقَى وَ صُحْبَةِ الأَبْرَارِ بِعَوْنِكَ يَا قُرَّةَ عَيْنِ الْمَسَاكِيْنِ",
			latin:
				"Allâhumma thahhirnî fîhi minaddanasi wal aqdzâr wa sabbirnî fîhi ‘ala kâinâtil aqdâri wawaffiqnî fîhi littuqâ wa suhbatil abrâr bi’aunika yâ qurrata ‘ainil masâkîn.",
			terjemah:
				"Ya Allah! Mohon sucikanlah diri kami di bulan ini dari segala nista dan perbuatan keji. Berilah aku kesabaran atas apa yang telah Engkau tetapkan. Anugerahkan kepada kami ketakwaan dan persahabatan dengan orang-orang yang baik dengan pertolongan-Mu, wahai cahaya hati orang-orang yang miskin.",
		},
		{
			hari: 14,
			judul: "Doa Hari ke-14 Puasa Ramadhan",
			arabic:
				"اَللَّهُمَّ لاَ تُؤَاخِذْنِيْ فِيْهِ بِالْعَثَرَاتِ وَ أَقِلْنِيْ فِيْهِ مِنَ الْخَطَايَا وَ الْهَفَوَاتِ وَ لاَ تَجْعَلْنِيْ فِيْهِ غَرَضًا لِلْبَلايَا وَ الآفَاتِ بِعِزَّتِكَ يَا عِزَّ الْمُسْلِمِيْنَ",
			latin: "",
			terjemah:
				"Ya Allah! Mohon janganlah Engkau tuntut dariku di bulan ini semua kesalahan yang aku lakukan. Hapuskan seluruh kesalahan dan kebodohanku. Hindarkan aku dari bencana dan malapetaka. Demi kemuliaan-Mu, wahai sandaran kemuliaan kaum Muslimin.",
		},
		{
			hari: 15,
			judul: "Doa Hari ke-15 Puasa Ramadhan",
			arabic:
				"اَللَّهُمَّ ارْزُقْنِيْ فِيْهِ طَاعَةَ الْخَاشِعِيْنَ وَ اشْرَحْ فِيْهِ صَدْرِيْ بِإِنَابَةِ الْمُخْبِتِيْنَ بِأَمَانِكَ يَا أَمَانَ الْخَائِفِيْنَ",
			latin:
				"Allâhummar zuqnî fîhi thâ’atal khâsyi’în wasyrah fîhi shadrî bi inâbatil mukhbitîn biamânika yâ amânal khâifîn.",
			terjemah:
				"Ya Allah, mohon anugerahilah aku di bulan ini dengan ketaatan orang-orang yang khusyu serta lapangkanlah dadaku dengan taubat orang-orang yang rendah diri. Dengan kekuatan-Mu, wahai tempat berlindung bagi orang-orang yang ketakutan.",
		},
		{
			hari: 16,
			judul: "Doa Hari ke-16 Puasa Ramadhan",
			arabic:
				"اَللَّهُمَّ وَفِّقْنِيْ فِيْهِ لِمُوَافَقَةِ الْأَبْرَارِ وَ جَنِّبْنِيْ فِيْهِ مُرَافَقَةَ الْأَشْرَارِ وَ آوِنِيْ فِيْهِ بِرَحْمَتِكَ إِلَى (فِيْ ) دَارِ الْقَرَارِ بِإِلَهِيَّتِكَ يَا إِلَهَ الْعَالَمِيْنَ",
			latin:
				"Allâhumma waffiqnî fîhi limuwâfaqatil abrâr wa jannibnî fîhi murafaqatal asyrâr wa âwinî fîhi birahmatika ilâ dâril qarâri bîlâhiyyatika yâ ilâhal ‘âlamîn.",
			terjemah:
				"Ya Allah, anugerahilah aku di bulan ini agar supaya bisa bergaul dengan orang-orang baik, dan jauhkanlah aku dari bergaul dengan orang-orang jahat. Berilah aku perlindungan di bulan ini dengan rahmat-Mu sampai ke alam akhirat. Demi keesaan-Mu, wahai Tuhan semesta alam.",
		},
		{
			hari: 17,
			judul: "Doa Hari ke-17 Puasa Ramadhan",
			arabic:
				"اَللَّهُمَّ اهْدِنِيْ فِيْهِ لِصَالِحِ الأَعْمَالِ وَ اقْضِ لِيْ فِيْهِ الْحَوَائِجَ وَ الآمَالَ يَا مَنْ لاَ يَحْتَاجُ إِلَى التَّفْسِيْرِ وَ السُّؤَالِ يَا عَالِمًا بِمَا فِيْ صُدُوْرِ الْعَالَمِيْنَ صَلِّ عَلَى مُحَمَّدٍ وَ آلِهِ الطَّاهِرِيْنَ",
			latin:
				"Allâhummah dinî fîhi lishâlihil a’mâli waqdhi lî fîhil hawâija wal âmâla yâ man lâ yahtâju ilat tafsîr was suâli yâ ‘âliman bimâ fî shudûril ‘âlamîn shalli ‘alâ muhammadin wa âlihith thâhirîn.",
			terjemah:
				"Ya Allah anugerahilah aku di bulan ini kemampuan untuk berperilaku yang baik dan kabulkanlah semua hajat dan keinginanku. Wahai yang tidak memerlukan penjelasan dan pertanyaan. Wahai yang Maha mengetahui apa yang ada di dalam alam ini. Anugerahilah shalawat dan salam bagi Muhammad dan keluarganya yang suci.",
		},
		{
			hari: 18,
			judul: "Doa Hari ke-18 Puasa Ramadhan",
			arabic:
				"اَللَّهُمَّ نَبِّهْنِيْ فِيْهِ لِبَرَكَاتِ أَسْحَارِهِ وَ نَوِّرْ فِيْهِ قَلْبِيْ بِضِيَاءِ أَنْوَارِهِ وَ خُذْ بِكُلِّ أَعْضَائِيْ إِلَى اتِّبَاعِ آثَارِهِ بِنُوْرِكَ يَا مُنَوِّرَ قُلُوْبِ الْعَارِفِيْنَ",
			latin:
				"Allâhumma nabbihnî fîhi libarakâti ashârihi wa nawwir fîhi qalbî bidhiyâi anwârihi wa khudz bikulli a’dhâî ilat tibâ’I âtsârihi binûrika yâ munawwiral qulûbil ‘ârifîn.",
			terjemah:
				"Ya Allah, sadarkanlah aku untuk mengetahui berkat yang ada pada waktu sahur. Terangilah hatiku dengan cahaya-Mu yang lembut. Jadikanlah seluruh anggota badanku dapat mengikuti cahaya itu. Wahai Penerang hati sanubari.",
		},
		{
			hari: 19,
			judul: "Doa Hari ke-19 Puasa Ramadhan",
			arabic:
				"اَللَّهُمَّ وَفِّرْ فِيْهِ حَظِّيْ مِنْ بَرَكَاتِهِ وَ سَهِّلْ سَبِيْلِيْ إِلَى خَيْرَاتِهِ وَ لاَ تَحْرِمْنِيْ قَبُوْلَ حَسَنَاتِهِ يَا هَادِيًا إِلَى الْحَقِّ الْمُبِيْنِ",
			latin:
				"Allâhumma waffir hadzdzî min barakâtihi wa sahhil sabîlî ilâ khayrâtihi walâ tahrimnî qabûla hasanâtihi yâ hâdiyan ilal haqqil mubîn.",
			terjemah:
				"Ya Allah, jadikanlah aku di bulan ini lebih bisa menikmati berkat-berkat-Mu dan mudahkanlah jalanku untuk mendapat kebaikan-kebaikannya. Jangan Engkau haramkan aku untuk menerima kebaikan-kebaikannya. Wahai Pemberi petunjuk kepada jalan yang terang.",
		},
		{
			hari: 20,
			judul: "Doa Hari ke-20 Puasa Ramadhan",
			arabic:
				"اَللَّهُمَّ افْتَحْ لِيْ فِيْهِ أَبْوَابَ الْجِنَانِ وَ أَغْلِقْ عَنِّيْ فِيْهِ أَبْوَابَ النِّيْرَانِ وَ وَفِّقْنِيْ فِيْهِ لِتِلاَوَةِ الْقُرْآنِ يَا مُنْزِلَ السَّكِيْنَةِ فِيْ قُلُوْبِ الْمُؤْمِنِيْنَ",
			latin:
				"Allâhummaftah lî fîhi abwâbal jinâni wa agliq ‘annî fîhi abwâban nîrân wa waffiqnî litilâwatil qur’âni yâ munzilas sakînata fî qulûbil mu’minîn.",
			terjemah:
				"Ya Allah, bukakanlah bagiku di bulan ini pintu-pintu menuju surga dan tutupkanlah bagiku pintu-pintu neraka. Berikanlah kemampuan padaku untuk menelaah Al-Qur’an di bulan ini. Wahai yang menurunkan ketenangan ke dalam hati orang-orang mukmin.",
		},
		{
			hari: 21,
			judul: "Doa Hari ke-21 Puasa Ramadhan",
			arabic:
				"اَللَّهُمَّ اجْعَلْ لِيْ فِيْهِ إِلَى مَرْضَاتِكَ دَلِيْلاً وَ لاَ تَجْعَلْ لِلشَّيْطَانِ فِيْهِ عَلَيَّ سَبِيْلاً وَ اجْعَلِ الْجَنَّةَ لِيْ مَنْزِلاً وَ مَقِيْلاً يَا قَاضِيَ حَوَائِجِ الطَّالِبِيْنَ",
			latin:
				"Allâhummaj ‘al lî fîhi ilâ mardhâtika dalîlan wa lâ taj’al lisysyaithâni fîhi ‘alayya sabîlan waj’alil jannata lî manzilan wa maqîlan yâ qâdhiya hawâijal muhtâjîn.",
			terjemah:
				"Ya Allah, tuntunlah aku di bulan yang mulia ini untuk mendapat keridhaan-Mu, dan janganlah adakan celah bagi setan untuk menggodaku. Jadikanlah surga sebagai tempat tinggal dan pernaunganku. Wahai yang memenuhi hajat orang-orang yang meminta.",
		},
		{
			hari: 22,
			judul: "Doa Hari ke-22 Puasa Ramadhan",
			arabic:
				"اَللَّهُمَّ افْتَحْ لِيْ فِيْهِ أَبْوَابَ فَضْلِكَ وَ أَنْزِلْ عَلَيَّ فِيْهِ بَرَكَاتِكَ وَ وَفِّقْنِيْ فِيْهِ لِمُوْجِبَاتِ مَرْضَاتِكَ وَ أَسْكِنِّيْ فِيْهِ بُحْبُوْحَاتِ جَنَّاتِكَ يَا مُجِيْبَ دَعْوَةِ الْمُضْطَرِّيْنَ",
			latin:
				"Allâhummaftah lî abwâba fadhlika wa anzil ‘alayya fîhi barakâtika wa waffiqnî fîhi limûjibâti mardhâtika wa askinnî fîhi buhbûhâti jannâtika yâ mujîba da’watil mudhtharrîn.",
			terjemah:
				"Ya Allah, bukakanlah lebar–lebar pintu karunia-Mu di bulan ini dan curahkanlah berkah-berkah-Mu. Tempatkan aku di tempat yang membuat-Mu ridha. Tempatkanlah aku di dalam surga-Mu. Wahai Yang Maha menjawab doa orang yang dalam kesempitan.",
		},
		{
			hari: 23,
			judul: "Doa Hari ke-23 Puasa Ramadhan",
			arabic:
				"اَللَّهُمَّ اغْسِلْنِيْ فِيْهِ مِنَ الذُّنُوْبِ وَ طَهِّرْنِيْ فِيْهِ مِنَ الْعُيُوْبِ وَ امْتَحِنْ قَلْبِيْ فِيْهِ بِتَقْوَى الْقُلُوْبِ يَا مُقِيْلَ عَثَرَاتِ الْمُذْنِبِيْنَ",
			latin:
				"Allâhummaghsilnî fîhi minadzdzunûbi wa thahhirnî fîhi minal ‘uyûbi wamtahin qalbî bitaqwal qulûbi yâ muqîla ‘atsarâtil mudznibîna.",
			terjemah:
				"Ya Allah, sucikanlah aku dari dosa-dosa dan bersihkanlah diriku dari segala aib/keburukan. Tanamkanlah ketakwaan di dalam hatiku. Wahai Penghapus kesalahan orang-orang yang berdosa.",
		},
		{
			hari: 24,
			judul: "Doa Hari ke-24 Puasa Ramadhan",
			arabic:
				"اَللَّهُمَّ إِنِّيْ أَسْأَلُكَ فِيْهِ مَا يُرْضِيْكَ وَ أَعُوْذُ بِكَ مِمَّا يُؤْذِيْكَ وَ أَسْأَلُكَ التَّوْفِيْقَ فِيْهِ لأَنْ أُطِيْعَكَ وَ لاَ أَعْصِيَكَ يَا جَوَّادَ السَّائِلِيْنَ",
			latin:
				"Allâhumma innî asaluka fîhi mâ yurdhîka wa a’ûdzu bika mimmâ yu’dzîka wa asalukat taufîqa fîhi lian utî’aka wa lâ a’shîka yâ ajwadas sâilîn.",
			terjemah:
				"Ya Allah, aku memohon pada-Mu di bulan yang suci ini segala sesuatu yang mendatangkan keridhaan-Mu, dan aku berlindung kepada-Mu dari hal-hal yang mendatangkan kemurkaan-Mu. Aku juga memohon kepada-Mu kemampuan untuk mentaati-Mu serta menjauhi maksiat terhadap-Mu. Wahai Pemberi (segala kebaikan) bagi para peminta.",
		},
		{
			hari: 25,
			judul: "Doa Hari ke-25 Puasa Ramadhan",
			arabic:
				"اَللَّهُمَّ اجْعَلْنِيْ فِيْهِ مُحِبًّا لِأَوْلِيَائِكَ وَ مُعَادِيًا لأَعْدَائِكَ مُسْتَنّا بِسُنَّةِ خَاتَمِ أَنْبِيَائِكَ يَا عَاصِمَ قُلُوْبِ النَّبِيِّيْنَ",
			latin:
				"Allâhummaj’alnî fîhi muhibban li awliyâika wa mu’âdiyan lia’dâika mustanan bisunnati khâtami anbiyâika yâ ‘âsima qulûbinnabiyyîn.",
			terjemah:
				"Ya Allah, jadikanlah aku di bulan ini lebih mencintai para wali-Mu dan memusuhi musuh-musuh-Mu. Jadikanlah aku pengikut sunnah Nabi-Mu yang terakhir. Wahai yang menjaga hati para nabi.",
		},
		{
			hari: 26,
			judul: "Doa Hari ke-26 Puasa Ramadhan",
			arabic:
				"اَللَّهُمَّ اجْعَلْ سَعْيِيْ فِيْهِ مَشْكُوْرًا وَ ذَنْبِيْ فِيْهِ مَغْفُوْرًا وَ عَمَلِيْ فِيْهِ مَقْبُوْلاً وَ عَيْبِيْ فِيْهِ مَسْتُوْرًا يَا أَسْمَعَ السَّامِعِيْنَ",
			latin:
				"Allâhummaj’al sa’yî fîhi masykûran wa dzanbî fîhi maghfûran wa ‘amalî fîhi maqbûlan wa ‘aybî fîhi mastûran yâ asma’as sâmi’îna.",
			terjemah:
				"Ya Allah, jadikanlah setiap usaha yang kulakukan di bulan ini bernilai syukur, dosa-dosaku terampuni, amal-amalku diterima, dan seluruh aibku ditutupi. Wahai Yang Maha Mendengar dari semua yang mendengar.",
		},
		{
			hari: 27,
			judul: "Doa Hari ke-27 Puasa Ramadhan",
			arabic:
				"اَللَّهُمَّ ارْزُقْنِيْ فِيْهِ فَضْلَ لَيْلَةِ الْقَدْرِ وَ صَيِّرْ أُمُوْرِيْ فِيْهِ مِنَ الْعُسْرِ إِلَى الْيُسْرِ وَ اقْبَلْ مَعَاذِيْرِيْ وَ حُطَّ عَنِّيَ الذَّنْبَ وَ الْوِزْرَ يَا رَؤُوْفًا بِعِبَادِهِ الصَّالِحِيْنَ",
			latin:
				"Allâhummarzuqnî fîhi fadhla laylatil qadri wa shayyir umûrî fîhi minal ‘usri ilal yusri waqbal ma’âdzîrî wa huththa ‘anniyadz dzanba wal wizra yâ ra`ûfan bi’ibâdihîsh shâlihîn.",
			terjemah:
				"Ya Allah, berkahilah aku di bulan ini dengan mendapatkan lailatul qadr. Ubah arah hidupku dari kesulitan menjadi kemudahan. Terimalah segala permohonan maafku dan hapuskan dosa-dosa serta kesalahanku. Wahai Yang Maha Penyayang terhadap hamba-hamba-Nya yang saleh.",
		},
		{
			hari: 28,
			judul: "Doa Hari ke-28 Puasa Ramadhan",
			arabic:
				"اَللَّهُمَّ وَفِّرْ حَظِّيْ فِيْهِ مِنَ النَّوَافِلِ وَ أَكْرِمْنِيْ فِيْهِ بِإِحْضَارِ الْمَسَائِلِ وَ قَرِّبْ فِيْهِ وَسِيْلَتِيْ إِلَيْكَ مِنْ بَيْنِ الْوَسَائِلِ يَا مَنْ لاَ يَشْغَلُهُ إِلْحَاحُ الْمُلِحِّيْنَ",
			latin:
				"Allâhumma waffir hadzdzî minan nawâfili wa akrimnî fîhi bîhdhâril masâili wa qarrib fîhi wasîlatî ilayka min baynil wasâili yâ man lâ yasyghaluhu ilhâhul mulihhîna.",
			terjemah:
				"Ya Allah, sempurnakanlah bagiku dalam (mengerjakan) amalan-amalan sunnah, dan muliakanlah aku dengan terkabulnya semua permintaan. Dekatkanlah aku kepada-Mu melalui berbagai wasilah (jalan). Wahai Yang tidak pernah sibuk meskipun banyaknya permintaan orang yang memohon.",
		},
		{
			hari: 29,
			judul: "Doa Hari ke-29 Puasa Ramadhan",
			arabic:
				"اَللَّهُمَّ غَشِّنِيْ فِيْهِ بِالرَّحْمَةِ وَ ارْزُقْنِيْ فِيْهِ التَّوْفِيْقَ وَ الْعِصْمَةَ وَ طَهِّرْ قَلْبِيْ مِنْ غَيَاهِبِ التُّهَمَةِ يَا رَحِيْمًا بِعِبَادِهِ الْمُؤْمِنِيْنَ",
			latin:
				"Allâhumma ghasysyinî fîhi birrahmati warzuqnî fîhit tawfîqa wal ‘ismata wa thahhir qalbî min ghayâhibit tuhmati yâ rahîman bi’ibâdihil mukminîn.",
			terjemah:
				"Ya Allah, selimutilah aku di bulan ini dengan rahmat-Mu, anugerahilah aku taufik dan penjagaan-Mu. Sucikanlah hatiku dari segala keburukan dan benih fitnah, wahai Yang Maha Pengasih terhadap hamba-hamba-Nya yang beriman.",
		},
		{
			hari: 30,
			judul: "Doa Hari ke-30 Puasa Ramadhan",
			arabic:
				"اَللَّهُمَّ اجْعَلْ صِيَامِيْ فِيْهِ بِالشُّكْرِ وَ الْقَبُوْلِ عَلَى مَا تَرْضَاهُ وَ يَرْضَاهُ الرَّسُوْلُ مُحْكَمَةً فُرُوْعُهُ بِالأُصُوْلِ بِحَقِّ سَيِّدِنَا مُحَمَّدٍ وَ آلِهِ الطَّاهِرِيْنَ وَ الْحَمْدُ ِللهِ رَبِّ الْعَالَمِيْنَ",
			latin:
				"Allâhummaj’al shiyâmî fîhi bisysyukri wal qabûli ‘alâ mâ tardhâhu wayardlâhurrasûlu muhkamatan furû’uhu bil ushuli bihaqqi sayyidinâ muhammadin wa âlihit thâhirîn wal hamdu lillâhi rabbil ‘âlamîn.",
			terjemah:
				"Ya Allah, terimalah puasaku di bulan ini dengan rasa syukur dan penerimaan, sesuai dengan yang Engkau ridai dan yang diridai oleh Rasul-Mu. Teguhkanlah (amalan) cabangnya dengan pokoknya. Dengan hak junjungan kami Nabi Muhammad dan keluarganya yang suci. Segala puji bagi Allah, Tuhan semesta alam.",
		},
	],
};

const DoaRamadhanPage = () => {
	return (
		<div className="bg-gradient-to-b from-emerald-50 to-white min-h-screen pt-[4.2rem]">
			<TopBar withBackButton>Doa Ramadhan</TopBar>
			
			<div className="max-w-4xl mx-auto px-4 py-6">
				{/* Header Section */}
				<div className="bg-gradient-to-r from-[#009788] to-[#00b894] rounded-2xl p-6 mb-6 text-white shadow-lg">
					<div className="flex items-center gap-3 mb-2">
						<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
							<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
							<path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
						</svg>
						<h1 className="text-2xl font-bold">Doa Harian Ramadhan</h1>
					</div>
					<p className="text-emerald-50 text-sm">
						Kumpulan doa untuk setiap hari di bulan suci Ramadhan
					</p>
				</div>

				{/* Doa Cards */}
				{data.data.map((item) => (
					<div
						key={item.hari}
						className="mb-5 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-100">
						
						{/* Card Header */}
						<div className="bg-gradient-to-r from-[#009788] to-[#00b894] px-5 py-4">
							<div className="flex items-center gap-3">
								<div className="bg-white text-[#009788] rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow-md">
									{item.hari}
								</div>
								<div>
									<h2 className="text-lg font-bold text-white">
										Hari ke-{item.hari}
									</h2>
									<p className="text-emerald-100 text-sm">
										Doa Puasa Ramadhan
									</p>
								</div>
							</div>
						</div>

						{/* Card Content */}
						<div className="p-5 space-y-4">
							{/* Arabic Text */}
							<div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4">
								<div className="flex items-center gap-2 mb-3">
									<svg className="w-5 h-5 text-[#009788]" fill="currentColor" viewBox="0 0 24 24">
										<path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
									</svg>
									<h3 className="font-bold text-[#009788]">Bacaan Arab</h3>
								</div>
								<p className="font-arabic text-right text-2xl leading-loose text-gray-800">
									{item.arabic}
								</p>
							</div>

							{/* Latin Text */}
							{item.latin && (
								<div className="bg-blue-50 rounded-xl p-4">
									<div className="flex items-center gap-2 mb-2">
										<svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
											<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
										</svg>
										<h3 className="font-bold text-blue-800">Bacaan Latin</h3>
									</div>
									<p className="text-gray-700 italic leading-relaxed text-sm">
										{item.latin}
									</p>
								</div>
							)}

							{/* Translation */}
							<div className="bg-purple-50 rounded-xl p-4">
								<div className="flex items-center gap-2 mb-2">
									<svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
										<path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
									</svg>
									<h3 className="font-bold text-purple-800">Terjemahan</h3>
								</div>
								<p className="text-gray-700 leading-relaxed text-sm">
									{item.terjemah}
								</p>
							</div>
						</div>
					</div>
				))}

				{/* Footer */}
				<div className="bg-white rounded-2xl p-6 text-center shadow-md border border-gray-100 mb-6">
					<p className="text-gray-600 text-sm">
						Semoga doa-doa ini diterima oleh Allah SWT
					</p>
					<p className="text-[#009788] font-semibold mt-2">
						آمِيْنَ يَا رَبَّ الْعَالَمِيْنَ
					</p>
					<p className="text-gray-500 text-xs mt-1 italic">
						(Aamiin ya Rabbal 'alamin)
					</p>
				</div>
			</div>
		</div>
	);
};

export default DoaRamadhanPage;
