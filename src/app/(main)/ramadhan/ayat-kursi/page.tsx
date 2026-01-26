import TopBar from "@/components/nav/topbar";
import React from "react";

// React Icons
import { BsStarFill } from "react-icons/bs";
import { FaFileAlt, FaQuran } from "react-icons/fa";

const ayatKursiData = {
  ayatKursi: {
    title: "Ayat Kursi",
    surah: "QS. Al-Baqarah: 255",
    arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    latin: "Allāhu lā ilāha illā huwal ḥayyul qayyūm. Lā ta'khużuhū sinatuw wa lā naum. Lahū mā fis samāwāti wa mā fil arḍ. Man żallażī yasyfa'u 'indahū illā bi'iżnih. Ya'lamu mā baina aidīhim wa mā khalfahum. Wa lā yuḥīṭūna bisyai'im min 'ilmihī illā bimā syā'. Wasi'a kursiyyuhus samāwāti wal arḍ. Wa lā ya'ūduhū ḥifẓuhumā. Wa huwal 'aliyyul 'aẓīm.",
    translation: "Allah, tidak ada tuhan selain Dia, Yang Mahahidup, Yang terus menerus mengurus (makhluk-Nya). Tidak mengantuk dan tidak tidur. Milik-Nya apa yang ada di langit dan apa yang ada di bumi. Tidak ada yang dapat memberi syafaat di sisi-Nya tanpa izin-Nya. Dia mengetahui apa yang di hadapan mereka dan apa yang di belakang mereka, dan mereka tidak mengetahui sesuatu apa pun tentang ilmu-Nya melainkan apa yang Dia kehendaki. Kursi-Nya meliputi langit dan bumi, dan Dia tidak merasa berat memelihara keduanya. Dan Dia Mahatinggi, Mahabesar.",
    keutamaan: [
      "Ayat paling agung dalam Al-Qur'an",
      "Perlindungan dari setan jika dibaca sebelum tidur",
      "Dijaga oleh malaikat hingga pagi jika dibaca setiap malam",
      "Termasuk dzikir pagi dan petang",
      "Dijamin masuk surga jika dibaca setelah sholat wajib dan meninggal",
    ]
  },
  suratPendek: [
    {
      nama: "Al-Fatihah",
      nomor: 1,
      ayat: 7,
      arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿١﴾ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿٢﴾ الرَّحْمَٰنِ الرَّحِيمِ ﴿٣﴾ مَالِكِ يَوْمِ الدِّينِ ﴿٤﴾ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿٥﴾ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ﴿٦﴾ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ﴿٧﴾",
      translation: "Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang. Segala puji bagi Allah, Tuhan semesta alam. Yang Maha Pengasih lagi Maha Penyayang. Pemilik hari pembalasan. Hanya kepada-Mu kami menyembah dan hanya kepada-Mu kami memohon pertolongan. Tunjukilah kami jalan yang lurus. Yaitu jalan orang-orang yang telah Engkau beri nikmat, bukan jalan orang-orang yang dimurkai dan bukan pula jalan orang-orang yang sesat.",
      keutamaan: "Ummul Qur'an, wajib dibaca setiap rakaat sholat"
    },
    {
      nama: "Al-Ikhlas",
      nomor: 112,
      ayat: 4,
      arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ ﴿١﴾ اللَّهُ الصَّمَدُ ﴿٢﴾ لَمْ يَلِدْ وَلَمْ يُولَدْ ﴿٣﴾ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ ﴿٤﴾",
      translation: "Katakanlah: 'Dia-lah Allah, Yang Maha Esa. Allah adalah Tuhan yang bergantung kepada-Nya segala sesuatu. Dia tiada beranak dan tidak pula diperanakkan, dan tidak ada seorangpun yang setara dengan Dia.'",
      keutamaan: "Setara dengan 1/3 Al-Qur'an"
    },
    {
      nama: "Al-Falaq",
      nomor: 113,
      ayat: 5,
      arabic: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ﴿١﴾ مِن شَرِّ مَا خَلَقَ ﴿٢﴾ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ﴿٣﴾ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ﴿٤﴾ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ ﴿٥﴾",
      translation: "Katakanlah: 'Aku berlindung kepada Tuhan yang menguasai subuh, dari kejahatan makhluk-Nya, dan dari kejahatan malam apabila telah gelap gulita, dan dari kejahatan wanita-wanita tukang sihir yang menghembus pada buhul-buhul, dan dari kejahatan pendengki bila ia dengki.'",
      keutamaan: "Perlindungan dari kejahatan"
    },
    {
      nama: "An-Nas",
      nomor: 114,
      ayat: 6,
      arabic: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ ﴿١﴾ مَلِكِ النَّاسِ ﴿٢﴾ إِلَٰهِ النَّاسِ ﴿٣﴾ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ﴿٤﴾ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ﴿٥﴾ مِنَ الْجِنَّةِ وَالنَّاسِ ﴿٦﴾",
      translation: "Katakanlah: 'Aku berlindung kepada Tuhan (yang memelihara dan menguasai) manusia. Raja manusia. Sembahan manusia. Dari kejahatan (bisikan) setan yang biasa bersembunyi, yang membisikkan (kejahatan) ke dalam dada manusia, dari (golongan) jin dan manusia.'",
      keutamaan: "Perlindungan dari was-was setan"
    },
    {
      nama: "Al-Kafirun",
      nomor: 109,
      ayat: 6,
      arabic: "قُلْ يَا أَيُّهَا الْكَافِرُونَ ﴿١﴾ لَا أَعْبُدُ مَا تَعْبُدُونَ ﴿٢﴾ وَلَا أَنتُمْ عَابِدُونَ مَا أَعْبُدُ ﴿٣﴾ وَلَا أَنَا عَابِدٌ مَّا عَبَدتُّمْ ﴿٤﴾ وَلَا أَنتُمْ عَابِدُونَ مَا أَعْبُدُ ﴿٥﴾ لَكُمْ دِينُكُمْ وَلِيَ دِينِ ﴿٦﴾",
      translation: "Katakanlah: 'Hai orang-orang kafir, Aku tidak akan menyembah apa yang kamu sembah. Dan kamu bukan penyembah Tuhan yang aku sembah. Dan aku tidak pernah menjadi penyembah apa yang kamu sembah, dan kamu tidak pernah (pula) menjadi penyembah Tuhan yang aku sembah. Untukmu agamamu, dan untukku agamaku.'",
      keutamaan: "Bebas dari kesyirikan"
    },
    {
      nama: "An-Nasr",
      nomor: 110,
      ayat: 3,
      arabic: "إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ ﴿١﴾ وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا ﴿٢﴾ فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ ۚ إِنَّهُ كَانَ تَوَّابًا ﴿٣﴾",
      translation: "Apabila telah datang pertolongan Allah dan kemenangan, dan kamu lihat manusia masuk agama Allah dengan berbondong-bondong, maka bertasbihlah dengan memuji Tuhanmu dan mohonlah ampun kepada-Nya. Sesungguhnya Dia Maha Penerima taubat.",
      keutamaan: "Surat yang menyampaikan kemenangan"
    },
  ]
};

const AyatKursiPage = () => {
  return (
    <div className="bg-gradient-to-b from-emerald-50 to-white min-h-screen pt-[4.2rem]">
      <TopBar withBackButton>Ayat Kursi & Surat Pendek</TopBar>
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Ayat Kursi - Featured */}
        <div className="bg-gradient-to-br from-teal-600 via-emerald-600 to-green-700 rounded-3xl p-6 mb-6 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-4">
              <FaFileAlt className="w-10 h-10 mx-auto mb-2" />
              <h1 className="text-2xl font-bold">{ayatKursiData.ayatKursi.title}</h1>
              <p className="text-emerald-100 text-sm">{ayatKursiData.ayatKursi.surah}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 mb-4">
              <p className="font-arabic text-right text-2xl leading-[2.5] text-white">
                {ayatKursiData.ayatKursi.arabic}
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
              <p className="text-emerald-50 text-sm italic mb-2">
                {ayatKursiData.ayatKursi.latin}
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-4 text-gray-800">
              <h4 className="font-bold text-emerald-700 mb-2">Terjemahan:</h4>
              <p className="text-sm leading-relaxed">{ayatKursiData.ayatKursi.translation}</p>
            </div>
          </div>
        </div>

        {/* Keutamaan Ayat Kursi */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 mb-6 border border-amber-200">
          <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
            <BsStarFill className="w-5 h-5" />
            Keutamaan Ayat Kursi
          </h3>
          <ul className="space-y-2">
            {ayatKursiData.ayatKursi.keutamaan.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-amber-500 flex-shrink-0">✦</span>
                <span className="text-sm text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Surat Pendek */}
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-full"></span>
          Surat-Surat Pendek
        </h2>

        <div className="space-y-4">
          {ayatKursiData.suratPendek.map((surat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-[#009788] to-[#00b894] px-5 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center">
                      <span className="text-white font-bold">{surat.nomor}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{surat.nama}</h3>
                      <p className="text-emerald-100 text-xs">{surat.ayat} Ayat</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-5 space-y-4">
                {/* Arabic Text */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4">
                  <p className="font-arabic text-right text-xl leading-[2.2] text-gray-800">
                    {surat.arabic}
                  </p>
                </div>
                
                {/* Translation */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-bold text-gray-800 mb-2 text-sm">Terjemahan:</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {surat.translation}
                  </p>
                </div>
                
                {/* Keutamaan */}
                <div className="flex items-center gap-2 bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <span>⭐</span>
                  <p className="text-sm text-amber-800 font-medium">{surat.keutamaan}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-white rounded-2xl p-6 text-center shadow-md border border-gray-100 mt-6 mb-6">
          <p className="text-gray-600 text-sm">
            Semoga kita bisa mengamalkan bacaan Al-Qur'an dalam kehidupan sehari-hari
          </p>
          <p className="text-[#009788] font-semibold mt-2 font-arabic text-lg">
            إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ
          </p>
          <p className="text-gray-500 text-xs mt-1 italic">
            "Sesungguhnya Al-Qur'an ini memberi petunjuk ke jalan yang paling lurus" (QS. Al-Isra: 9)
          </p>
        </div>
      </div>
    </div>
  );
};

export default AyatKursiPage;
