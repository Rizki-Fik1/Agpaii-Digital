export interface DoaItem {
  id: number;
  judul: string;
  arab: string;
  indo: string;
  sumber?: string;
}

const doaQuran: DoaItem[] = [
  {
    id: 1,
    judul: "Kebaikan Dunia & Akhirat",
    arab: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    indo: "Ya Tuhan kami, berilah kami kebaikan di dunia dan akhirat, dan lindungi kami dari api neraka.",
    sumber: "QS. Al-Baqarah: 201",
  },
  {
    id: 2,
    judul: "Keteguhan & Kesabaran",
    arab: "رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا",
    indo: "Ya Tuhan kami, limpahkan kesabaran dan teguhkan pendirian kami.",
    sumber: "QS. Al-Baqarah: 250",
  },
  {
    id: 3,
    judul: "Keteguhan Iman",
    arab: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا",
    indo: "Ya Tuhan kami, jangan Engkau sesatkan hati kami setelah diberi petunjuk.",
    sumber: "QS. Ali Imran: 8",
  },
  {
    id: 4,
    judul: "Memohon Ilmu",
    arab: "رَبِّ زِدْنِي عِلْمًا",
    indo: "Ya Tuhanku, tambahkanlah aku ilmu.",
    sumber: "QS. Thaha: 114",
  },
  {
    id: 5,
    judul: "Husnul Khatimah",
    arab: "اللَّهُمَّ اخْتِمْ لَنَا بِحُسْنِ الْخَاتِمَةِ",
    indo: "Ya Allah, akhirilah hidup kami dengan baik.",
  },
  {
    id: 6,
    judul: "Istighfar Nabi Adam",
    arab: "رَبَّنَا ظَلَمْنَا أَنْفُسَنَا",
    indo: "Kami telah menzalimi diri kami, ampunilah kami.",
    sumber: "QS. Al-A'raf: 23",
  },
  {
    id: 7,
    judul: "Perlindungan dari Neraka",
    arab: "رَبَّنَا اصْرِفْ عَنَّا عَذَابَ جَهَنَّمَ",
    indo: "Jauhkan kami dari azab neraka.",
    sumber: "QS. Al-Furqan: 65",
  },
  {
    id: 8,
    judul: "Kelapangan Hati",
    arab: "رَبِّ اشْرَحْ لِي صَدْرِي",
    indo: "Lapangkanlah dadaku.",
    sumber: "QS. Thaha: 25",
  },
  {
    id: 9,
    judul: "Jodoh & Keturunan",
    arab: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا",
    indo: "Anugerahkan pasangan dan keturunan yang baik.",
    sumber: "QS. Al-Furqan: 74",
  },
  {
    id: 10,
    judul: "Perlindungan dari Syaitan",
    arab: "رَبِّ أَعُوذُ بِكَ مِنْ هَمَزَاتِ الشَّيَاطِينِ",
    indo: "Aku berlindung dari godaan setan.",
    sumber: "QS. Al-Mu'minun: 97",
  },
  {
    id: 11,
    judul: "Mensyukuri Nikmat",
    arab: "رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ",
    indo: "Bimbing aku untuk bersyukur.",
    sumber: "QS. An-Naml: 19",
  },
  {
    id: 12,
    judul: "Terhindar dari Dengki",
    arab: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
    indo: "Dari kejahatan orang dengki.",
    sumber: "QS. Al-Falaq: 5",
  },
  {
    id: 13,
    judul: "Tawakkal",
    arab: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    indo: "Cukuplah Allah sebagai penolong.",
    sumber: "QS. Ali Imran: 173",
  },
  {
    id: 14,
    judul: "Perlindungan dari Orang Zalim",
    arab: "رَبِّ نَجِّنِي مِنَ الْقَوْمِ الظَّالِمِينَ",
    indo: "Selamatkan aku dari orang zalim.",
    sumber: "QS. Al-Qasas: 21",
  },
  {
    id: 15,
    judul: "Istighfar Nabi Yunus",
    arab: "لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ",
    indo: "Tiada Tuhan selain Engkau, aku termasuk orang zalim.",
    sumber: "QS. Al-Anbiya: 87",
  },
  {
    id: 16,
    judul: "Kemudahan Urusan",
    arab: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي",
    indo: "Lapangkan dadaku dan mudahkan urusanku.",
    sumber: "QS. Thaha: 25–26",
  },
  {
    id: 17,
    judul: "Rezeki",
    arab: "رَبِّ ارْزُقْنِي مِنْ حَيْثُ لَا أَحْتَسِبُ",
    indo: "Berilah aku rezeki dari arah tak disangka.",
  },
  {
    id: 18,
    judul: "Rumah di Surga",
    arab: "رَبِّ ابْنِ لِي عِندَكَ بَيْتًا فِي الْجَنَّةِ",
    indo: "Bangunkan aku rumah di surga.",
    sumber: "QS. At-Tahrim: 11",
  },
  {
    id: 19,
    judul: "Cahaya & Ampunan",
    arab: "رَبَّنَا أَتْمِمْ لَنَا نُورَنَا",
    indo: "Sempurnakan cahaya kami dan ampuni kami.",
    sumber: "QS. At-Tahrim: 8",
  },
  {
    id: 20,
    judul: "Hikmah",
    arab: "رَبِّ هَبْ لِي حُكْمًا",
    indo: "Berikan aku hikmah.",
    sumber: "QS. Asy-Syu'ara: 83",
  },
  {
    id: 21,
    judul: "Tempat yang Baik",
    arab: "رَبِّ أَنزِلْنِي مُنزَلًا مُّبَارَكًا",
    indo: "Tempatkan aku di tempat yang diberkahi.",
    sumber: "QS. Al-Mu'minun: 29",
  },
];

export default doaQuran;
