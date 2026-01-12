/**
 * Student Data Constants
 * Mock data untuk simulasi fitur kelas siswa (frontend-only)
 */

// Role ID untuk siswa
export const STUDENT_ROLE_ID = 12;

// Interface untuk materi
export interface Material {
  id: number;
  title: string;
  description: string;
  content: string; // Full content/summary
  type: "pdf" | "video";
  fileUrl: string;
  duration: string; // e.g. "15 menit"
  chapters?: string[];
  createdAt: string;
  // Repost fields
  repostedFrom?: string; // Original author name
  originalId?: number; // Original material ID
  isPublic?: boolean; // Can be reposted by others
}

// Mock materi kelas dengan detail
export const MOCK_MATERIALS: Material[] = [
  {
    id: 1,
    title: "Pengenalan Al-Quran",
    description: "Belajar dasar-dasar membaca Al-Quran dengan tajwid yang benar",
    content: "Materi ini membahas tentang sejarah turunnya Al-Quran, keutamaan membaca Al-Quran, dan pengenalan huruf hijaiyah. Siswa akan mempelajari cara membaca dengan tartil dan memahami makna-makna dasar dalam Al-Quran.",
    type: "pdf",
    fileUrl: "/materials/al-quran-intro.pdf",
    duration: "30 menit",
    chapters: ["Sejarah Al-Quran", "Keutamaan Membaca", "Huruf Hijaiyah", "Tanda Baca"],
    createdAt: "2026-01-05",
  },
  {
    id: 2,
    title: "Sejarah Nabi Muhammad SAW",
    description: "Mempelajari perjalanan hidup Rasulullah SAW dari lahir hingga wafat",
    content: "Video pembelajaran tentang kelahiran Nabi Muhammad SAW, masa kecil, pengangkatan menjadi rasul, hijrah ke Madinah, dan perjuangan dakwah hingga wafat. Dilengkapi dengan ilustrasi dan penjelasan detail.",
    type: "video",
    fileUrl: "https://www.youtube.com/embed/4zLfCnGVeL4",
    duration: "45 menit",
    chapters: ["Kelahiran", "Masa Kecil", "Pengangkatan Rasul", "Hijrah", "Wafat"],
    createdAt: "2026-01-03",
  },
  {
    id: 3,
    title: "Rukun Islam",
    description: "Memahami 5 rukun Islam dan implementasinya dalam kehidupan sehari-hari",
    content: "Materi lengkap tentang 5 rukun Islam: Syahadat, Shalat, Zakat, Puasa, dan Haji. Setiap rukun dijelaskan secara detail beserta tata cara pelaksanaan dan hikmahnya.",
    type: "pdf",
    fileUrl: "/materials/rukun-islam.pdf",
    duration: "25 menit",
    chapters: ["Syahadat", "Shalat", "Zakat", "Puasa", "Haji"],
    createdAt: "2026-01-01",
  },
  {
    id: 4,
    title: "Hukum Tajwid",
    description: "Mempelajari hukum-hukum bacaan dalam Al-Quran",
    content: "Materi ini membahas berbagai hukum tajwid seperti Idzhar, Idgham, Iqlab, dan Ikhfa. Dilengkapi dengan contoh-contoh ayat dan latihan pengucapan yang benar.",
    type: "pdf",
    fileUrl: "/materials/tajwid.pdf",
    duration: "40 menit",
    chapters: ["Idzhar", "Idgham", "Iqlab", "Ikhfa", "Qalqalah"],
    createdAt: "2025-12-28",
  },
];

// Interface untuk latihan soal
export interface Exercise {
  id: number;
  title: string;
  description: string;
  totalQuestions: number;
  duration: number; // menit
  deadline: string;
  isCompleted: boolean;
  score?: number;
  questions?: Question[];
  // Repost fields
  repostedFrom?: string; // Original author name
  originalId?: number; // Original exercise ID
  isPublic?: boolean; // Can be reposted by others
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
}

// Mock latihan soal dengan detail
export const MOCK_EXERCISES: Exercise[] = [
  {
    id: 1,
    title: "Latihan Tajwid Dasar",
    description: "Uji pemahaman tentang hukum-hukum tajwid dasar",
    totalQuestions: 5,
    duration: 10,
    deadline: "2026-01-15",
    isCompleted: false,
    questions: [
      {
        id: 1,
        question: "Apa yang dimaksud dengan hukum Idzhar?",
        options: [
          "Membaca dengan jelas tanpa dengung",
          "Membaca dengan dengung",
          "Membaca dengan melebur",
          "Membaca dengan membalik"
        ],
        correctAnswer: 0
      },
      {
        id: 2,
        question: "Huruf-huruf Idzhar Halqi adalah...",
        options: [
          "ب ت ث",
          "ء ه ع ح غ خ",
          "ي ر م ل و ن",
          "ق ط ب ج د"
        ],
        correctAnswer: 1
      },
      {
        id: 3,
        question: "Idgham Bighunnah terjadi ketika Nun Mati bertemu huruf...",
        options: [
          "ل ر",
          "ب",
          "ي ن م و",
          "ء ه ع ح غ خ"
        ],
        correctAnswer: 2
      },
      {
        id: 4,
        question: "Hukum Iqlab terjadi ketika Nun Mati bertemu huruf...",
        options: [
          "ب",
          "ل",
          "ر",
          "م"
        ],
        correctAnswer: 0
      },
      {
        id: 5,
        question: "Berapa lama panjang bacaan Mad Wajib Muttashil?",
        options: [
          "1 alif",
          "2-3 alif",
          "4-5 alif",
          "6 alif"
        ],
        correctAnswer: 2
      }
    ]
  },
  {
    id: 2,
    title: "Quiz Sejarah Islam",
    description: "Evaluasi pengetahuan tentang sejarah Nabi Muhammad SAW",
    totalQuestions: 5,
    duration: 10,
    deadline: "2026-01-10",
    isCompleted: true,
    score: 85,
    questions: [
      {
        id: 1,
        question: "Nabi Muhammad SAW lahir pada tahun...",
        options: ["570 M", "571 M", "572 M", "573 M"],
        correctAnswer: 0
      },
      {
        id: 2,
        question: "Siapa nama ibu Nabi Muhammad SAW?",
        options: ["Halimah", "Aminah", "Khadijah", "Fatimah"],
        correctAnswer: 1
      },
      {
        id: 3,
        question: "Di gua manakah Nabi Muhammad menerima wahyu pertama?",
        options: ["Gua Tsur", "Gua Hira", "Gua Kahfi", "Gua Ashabul"],
        correctAnswer: 1
      },
      {
        id: 4,
        question: "Peristiwa Hijrah terjadi pada tahun...",
        options: ["620 M", "621 M", "622 M", "623 M"],
        correctAnswer: 2
      },
      {
        id: 5,
        question: "Siapa sahabat yang menemani Nabi saat Hijrah?",
        options: ["Umar bin Khattab", "Abu Bakar", "Ali bin Abi Thalib", "Utsman bin Affan"],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 3,
    title: "Evaluasi Rukun Islam",
    description: "Tes pemahaman tentang 5 rukun Islam dan implementasinya",
    totalQuestions: 5,
    duration: 15,
    deadline: "2026-01-20",
    isCompleted: false,
    questions: [
      {
        id: 1,
        question: "Rukun Islam yang pertama adalah...",
        options: ["Shalat", "Syahadat", "Zakat", "Puasa"],
        correctAnswer: 1
      },
      {
        id: 2,
        question: "Berapa rakaat shalat Maghrib?",
        options: ["2 rakaat", "3 rakaat", "4 rakaat", "5 rakaat"],
        correctAnswer: 1
      },
      {
        id: 3,
        question: "Zakat fitrah wajib dikeluarkan sebelum...",
        options: ["Shalat Idul Fitri", "Shalat Tarawih", "Puasa Ramadhan", "Malam Lailatul Qadar"],
        correctAnswer: 0
      },
      {
        id: 4,
        question: "Puasa Ramadhan dilakukan selama...",
        options: ["1 minggu", "2 minggu", "29-30 hari", "40 hari"],
        correctAnswer: 2
      },
      {
        id: 5,
        question: "Haji wajib dilaksanakan bagi muslim yang...",
        options: ["Sudah dewasa", "Mampu", "Laki-laki", "Bekerja"],
        correctAnswer: 1
      }
    ]
  },
];

// Public exercises from other teachers that can be reposted
export const PUBLIC_EXERCISES: (Exercise & { authorName: string; authorSchool: string })[] = [
  {
    id: 101,
    title: "Latihan Akhlak Terpuji",
    description: "Evaluasi pemahaman tentang akhlak mulia dalam Islam",
    totalQuestions: 5,
    duration: 15,
    deadline: "2026-02-15",
    isCompleted: false,
    isPublic: true,
    authorName: "Ustadz Ahmad",
    authorSchool: "SMP Negeri 2 Surabaya",
    questions: [
      { id: 1, question: "Apa yang dimaksud dengan akhlak mahmudah?", options: ["Akhlak tercela", "Akhlak terpuji", "Akhlak biasa", "Tidak ada"], correctAnswer: 1 },
      { id: 2, question: "Contoh sifat jujur dalam kehidupan sehari-hari adalah?", options: ["Berbohong untuk kebaikan", "Berkata benar meski pahit", "Menyembunyikan kesalahan", "Berbohong agar tidak dihukum"], correctAnswer: 1 },
      { id: 3, question: "Sabar termasuk akhlak...?", options: ["Tercela", "Terpuji", "Biasa", "Tidak baik"], correctAnswer: 1 },
      { id: 4, question: "Lawan dari sifat sombong adalah?", options: ["Kikir", "Rendah hati", "Malas", "Bohong"], correctAnswer: 1 },
      { id: 5, question: "Menjaga lisan artinya?", options: ["Tidak berbicara", "Berbicara yang baik", "Berbicara banyak", "Diam saja"], correctAnswer: 1 },
    ],
  },
  {
    id: 102,
    title: "Quiz Sholat 5 Waktu",
    description: "Tes pemahaman tentang tata cara sholat wajib",
    totalQuestions: 5,
    duration: 10,
    deadline: "2026-02-20",
    isCompleted: false,
    isPublic: true,
    authorName: "Bu Fatimah",
    authorSchool: "SMP Islam Terpadu Jakarta",
    questions: [
      { id: 1, question: "Berapa jumlah rakaat sholat Maghrib?", options: ["2", "3", "4", "5"], correctAnswer: 1 },
      { id: 2, question: "Sholat apa yang dilakukan saat matahari terbenam?", options: ["Dzuhur", "Ashar", "Maghrib", "Isya"], correctAnswer: 2 },
      { id: 3, question: "Apa yang dibaca saat ruku?", options: ["Allahu Akbar", "Subhana Rabbiyal Azhim", "Sami Allahu Liman Hamidah", "Rabbana Lakal Hamd"], correctAnswer: 1 },
      { id: 4, question: "Gerakan setelah ruku adalah?", options: ["Sujud", "Iktidal", "Duduk", "Salam"], correctAnswer: 1 },
      { id: 5, question: "Kapan waktu sholat Subuh berakhir?", options: ["Saat matahari terbit", "Saat dzuhur", "Saat sore", "Saat malam"], correctAnswer: 0 },
    ],
  },
  {
    id: 103,
    title: "Evaluasi Puasa Ramadhan",
    description: "Uji pemahaman tentang ibadah puasa di bulan Ramadhan",
    totalQuestions: 5,
    duration: 12,
    deadline: "2026-02-25",
    isCompleted: false,
    isPublic: true,
    authorName: "Pak Hasan",
    authorSchool: "MTs Negeri 1 Bandung",
    questions: [
      { id: 1, question: "Apa yang membatalkan puasa?", options: ["Tidur siang", "Makan dan minum sengaja", "Mandi", "Berjemur"], correctAnswer: 1 },
      { id: 2, question: "Kapan waktu sahur berakhir?", options: ["Saat imsak", "Saat dzuhur", "Saat maghrib", "Saat isya"], correctAnswer: 0 },
      { id: 3, question: "Hukum puasa Ramadhan adalah?", options: ["Sunnah", "Wajib", "Mubah", "Makruh"], correctAnswer: 1 },
      { id: 4, question: "Apa yang dibaca saat berbuka?", options: ["Doa sebelum makan", "Doa berbuka puasa", "Doa setelah makan", "Istighfar"], correctAnswer: 1 },
      { id: 5, question: "Lailatul Qadar terjadi pada?", options: ["Malam ganjil 10 terakhir Ramadhan", "Setiap malam", "Malam pertama", "Malam ke-15"], correctAnswer: 0 },
    ],
  },
];

// Mock diskusi kelas
export interface Reply {
  id: number;
  authorName: string;
  authorAvatar: string | null;
  content: string;
  createdAt: string;
}

export interface Discussion {
  id: number;
  authorName: string;
  authorAvatar: string | null;
  content: string;
  createdAt: string;
  repliesCount: number;
  repliesData?: Reply[];
  images?: string[]; // Array of image URLs
  video?: string; // Video URL (YouTube embed)
}

export const MOCK_DISCUSSIONS: Discussion[] = [
  {
    id: 0,
    authorName: "Siswa", // This can be edited if logged in user's name is "Siswa"
    authorAvatar: null,
    content: "Ini adalah contoh diskusi yang bisa saya edit. Saya ingin bertanya tentang materi rukun Islam, apakah ada yang bisa menjelaskan secara detail tentang syarat-syarat sholat?",
    createdAt: "2026-01-09 08:00",
    repliesCount: 2,
    repliesData: [
      {
        id: 1,
        authorName: "Ustadz Hasan",
        authorAvatar: null,
        content: "Syarat sah sholat ada 5: suci dari hadats, suci badan/pakaian/tempat, menutup aurat, menghadap kiblat, dan masuk waktu sholat.",
        createdAt: "2026-01-09 08:30",
      },
      {
        id: 2,
        authorName: "Ahmad",
        authorAvatar: null,
        content: "Terima kasih ustadz atas penjelasannya!",
        createdAt: "2026-01-09 09:00",
      },
    ],
  },
  {
    id: 1,
    authorName: "Ahmad",
    authorAvatar: null,
    content: "Bagaimana cara membedakan hukum bacaan idzhar dan ikhfa? Berikut contoh tulisannya yang saya foto dari buku tajwid.",
    createdAt: "2026-01-06 10:30",
    repliesCount: 5,
    repliesData: [
      {
        id: 1,
        authorName: "Ustadz Hasan",
        authorAvatar: null,
        content: "Idzhar dibaca jelas tanpa dengung, sedangkan ikhfa dibaca samar dengan dengung. Idzhar terjadi jika nun mati bertemu huruf halqi (ء ه ع ح غ خ).",
        createdAt: "2026-01-06 11:00",
      },
      {
        id: 2,
        authorName: "Fatimah",
        authorAvatar: null,
        content: "Terima kasih Ustadz, sekarang saya jadi lebih paham perbedaannya!",
        createdAt: "2026-01-06 11:15",
      },
      {
        id: 3,
        authorName: "Muhammad",
        authorAvatar: null,
        content: "Untuk ikhfa, cirinya ada dengung sekitar 2 harakat ya Ustadz?",
        createdAt: "2026-01-06 11:30",
      },
    ],
    images: [
      "https://placehold.co/400x300/e8f5e9/2e7d32?text=Tajwid+1",
      "https://placehold.co/400x300/e3f2fd/1565c0?text=Tajwid+2",
    ],
  },
  {
    id: 2,
    authorName: "Fatimah",
    authorAvatar: null,
    content: "Apa hikmah dari puasa Ramadhan yang bisa kita ambil? Simak video penjelasan dari Ustadz berikut ini.",
    createdAt: "2026-01-05 14:15",
    repliesCount: 8,
    repliesData: [
      {
        id: 1,
        authorName: "Aisyah",
        authorAvatar: null,
        content: "Puasa mengajarkan kita kesabaran dan empati terhadap orang yang kurang mampu.",
        createdAt: "2026-01-05 14:30",
      },
      {
        id: 2,
        authorName: "Umar",
        authorAvatar: null,
        content: "Setuju! Puasa juga melatih pengendalian diri kita dalam berbagai hal.",
        createdAt: "2026-01-05 14:45",
      },
      {
        id: 3,
        authorName: "Ahmad",
        authorAvatar: null,
        content: "Video-nya sangat bermanfaat, terima kasih sudah berbagi!",
        createdAt: "2026-01-05 15:00",
      },
      {
        id: 4,
        authorName: "Bu Siti",
        authorAvatar: null,
        content: "Bagus sekali diskusinya. Puasa juga mengajarkan kita untuk bersyukur atas nikmat Allah.",
        createdAt: "2026-01-05 15:20",
      },
    ],
    video: "https://www.youtube.com/embed/4zLfCnGVeL4",
  },
  {
    id: 3,
    authorName: "Muhammad",
    authorAvatar: null,
    content: "Mohon dijelaskan tentang tata cara sholat jenazah. Apakah ada yang punya catatan atau referensi?",
    createdAt: "2026-01-04 09:00",
    repliesCount: 3,
    repliesData: [
      {
        id: 1,
        authorName: "Ustadz Hasan",
        authorAvatar: null,
        content: "Sholat jenazah dilakukan dengan 4 takbir. Takbir 1: Al-Fatihah, Takbir 2: Sholawat, Takbir 3: Doa untuk jenazah, Takbir 4: Doa penutup lalu salam.",
        createdAt: "2026-01-04 09:30",
      },
      {
        id: 2,
        authorName: "Aisyah",
        authorAvatar: null,
        content: "Saya punya catatan dari pelajaran kemarin, bisa saya foto dan kirim di sini.",
        createdAt: "2026-01-04 10:00",
      },
    ],
  },
  {
    id: 4,
    authorName: "Aisyah",
    authorAvatar: null,
    content: "Dokumentasi kegiatan belajar tajwid hari ini! Alhamdulillah berjalan lancar. Ada video penjelasan dari guru dan foto-foto saat praktik.",
    createdAt: "2026-01-03 15:45",
    repliesCount: 12,
    repliesData: [
      {
        id: 1,
        authorName: "Ahmad",
        authorAvatar: null,
        content: "MasyaAllah, kegiatannya seru banget! Kapan ada lagi ya?",
        createdAt: "2026-01-03 16:00",
      },
      {
        id: 2,
        authorName: "Fatimah",
        authorAvatar: null,
        content: "Terima kasih sudah mendokumentasikan. Foto-fotonya bagus!",
        createdAt: "2026-01-03 16:15",
      },
      {
        id: 3,
        authorName: "Ustadz Hasan",
        authorAvatar: null,
        content: "Alhamdulillah kegiatan hari ini berjalan lancar. Minggu depan kita lanjutkan ke materi mad.",
        createdAt: "2026-01-03 16:30",
      },
      {
        id: 4,
        authorName: "Muhammad",
        authorAvatar: null,
        content: "Siap Ustadz! Semoga semakin lancar membaca Al-Quran kita semua.",
        createdAt: "2026-01-03 16:45",
      },
    ],
    images: [
      "https://placehold.co/400x300/fff3e0/e65100?text=Kegiatan+1",
      "https://placehold.co/400x300/fce4ec/c2185b?text=Kegiatan+2",
      "https://placehold.co/400x300/f3e5f5/7b1fa2?text=Kegiatan+3",
    ],
    video: "https://www.youtube.com/embed/LDU_Txk06tM",
  },
  {
    id: 5,
    authorName: "Umar",
    authorAvatar: null,
    content: "Berikut foto materi tentang Rukun Iman yang saya ringkas. Semoga bermanfaat untuk teman-teman.",
    createdAt: "2026-01-02 08:20",
    repliesCount: 7,
    repliesData: [
      {
        id: 1,
        authorName: "Fatimah",
        authorAvatar: null,
        content: "Wah ringkasannya rapi sekali! Terima kasih Umar!",
        createdAt: "2026-01-02 08:45",
      },
      {
        id: 2,
        authorName: "Aisyah",
        authorAvatar: null,
        content: "Boleh saya simpan untuk belajar juga?",
        createdAt: "2026-01-02 09:00",
      },
      {
        id: 3,
        authorName: "Umar",
        authorAvatar: null,
        content: "Silakan Aisyah, semoga bermanfaat untuk kita semua.",
        createdAt: "2026-01-02 09:15",
      },
    ],
    images: [
      "https://placehold.co/400x300/e8eaf6/3f51b5?text=Rukun+Iman",
    ],
  },
];

// Mock forum publik (seluruh sekolah)
export interface ForumPost {
  id: number;
  authorName: string;
  authorRole: string;
  authorAvatar: string | null;
  content: string;
  createdAt: string;
  likes: number;
  comments: number;
  images?: string[];
  video?: string;
}

export const MOCK_FORUM_POSTS: ForumPost[] = [
  {
    id: 1,
    authorName: "Ustadz Hasan",
    authorRole: "Guru PAI",
    authorAvatar: null,
    content: "Assalamualaikum, mari kita bahas tentang persiapan menghadapi ujian semester. Berikut video panduan belajar yang bisa membantu teman-teman. Semangat belajar!",
    createdAt: "2026-01-06 08:00",
    likes: 24,
    comments: 12,
    video: "https://www.youtube.com/embed/4zLfCnGVeL4",
  },
  {
    id: 2,
    authorName: "Siti Aisyah",
    authorRole: "Siswa Kelas 9A",
    authorAvatar: null,
    content: "Terima kasih atas materi tajwid yang sangat bermanfaat. Berikut catatan yang saya buat untuk review. Alhamdulillah sekarang sudah lebih paham.",
    createdAt: "2026-01-05 16:30",
    likes: 15,
    comments: 5,
    images: [
      "https://placehold.co/400x300/e0f7fa/00796b?text=Catatan+1",
      "https://placehold.co/400x300/f1f8e9/558b2f?text=Catatan+2",
    ],
  },
  {
    id: 3,
    authorName: "Ahmad Fauzan",
    authorRole: "Siswa Kelas 8B",
    authorAvatar: null,
    content: "Ada yang bisa bantu jelaskan tentang wudhu? Saya masih bingung urutannya. Ini foto dari buku yang saya punya.",
    createdAt: "2026-01-05 11:20",
    likes: 8,
    comments: 18,
    images: [
      "https://placehold.co/400x300/e1f5fe/0288d1?text=Tata+Cara+Wudhu",
    ],
  },
  {
    id: 4,
    authorName: "Bu Fatimah",
    authorRole: "Guru PAI",
    authorAvatar: null,
    content: "Dokumentasi kegiatan lomba adzan antar kelas kemarin. Alhamdulillah semua peserta tampil dengan baik!",
    createdAt: "2026-01-04 14:00",
    likes: 45,
    comments: 23,
    images: [
      "https://placehold.co/400x300/fff8e1/ff8f00?text=Lomba+Adzan+1",
      "https://placehold.co/400x300/ffebee/e53935?text=Lomba+Adzan+2",
      "https://placehold.co/400x300/f3e5f5/8e24aa?text=Lomba+Adzan+3",
    ],
    video: "https://www.youtube.com/embed/LDU_Txk06tM",
  },
];

// Info kelas-kelas siswa (mock) - siswa bisa punya lebih dari 1 kelas
export interface ClassInfo {
  id: number;
  name: string;
  subject: string;
  teacher: {
    name: string;
    email: string;
  };
  totalStudents: number;
  school: string;
  color: string;
}

export const MOCK_CLASSES: ClassInfo[] = [
  {
    id: 1,
    name: "PAI Kelas 9A",
    subject: "Pendidikan Agama Islam",
    teacher: {
      name: "Ustadz Hasan",
      email: "hasan@sekolah.sch.id",
    },
    totalStudents: 32,
    school: "SMP Negeri 1 Jakarta",
    color: "from-teal-600 to-teal-500",
  },
  {
    id: 2,
    name: "Bahasa Indonesia 9A",
    subject: "Bahasa Indonesia",
    teacher: {
      name: "Bu Siti",
      email: "siti@sekolah.sch.id",
    },
    totalStudents: 32,
    school: "SMP Negeri 1 Jakarta",
    color: "from-orange-600 to-orange-500",
  },
];

// Helper function to get class by ID
export const getClassById = (id: number): ClassInfo | undefined => {
  return MOCK_CLASSES.find((c) => c.id === id);
};

// ================================================
// ATTENDANCE / PRESENSI FEATURE
// ================================================

// Interface siswa dalam satu kelas
export interface StudentInClass {
  id: number;
  name: string;
  nisn: string;
}

// Status kehadiran
export type AttendanceStatus = "hadir" | "tidak_hadir" | "izin" | "sakit";

// Interface record presensi
export interface AttendanceRecord {
  classId: number;
  studentId: number;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
}

// Mock data siswa per kelas
export const MOCK_STUDENTS_BY_CLASS: { [classId: number]: StudentInClass[] } = {
  1: [
    { id: 101, name: "Ahmad Fauzan", nisn: "0012345601" },
    { id: 102, name: "Siti Aisyah", nisn: "0012345602" },
    { id: 103, name: "Muhammad Rizki", nisn: "0012345603" },
    { id: 104, name: "Fatimah Azzahra", nisn: "0012345604" },
    { id: 105, name: "Umar Hadi", nisn: "0012345605" },
    { id: 106, name: "Khadijah Nur", nisn: "0012345606" },
    { id: 107, name: "Ali Akbar", nisn: "0012345607" },
    { id: 108, name: "Zahra Putri", nisn: "0012345608" },
  ],
  2: [
    { id: 201, name: "Budi Santoso", nisn: "0012345701" },
    { id: 202, name: "Dewi Lestari", nisn: "0012345702" },
    { id: 203, name: "Eko Prasetyo", nisn: "0012345703" },
    { id: 204, name: "Fitriani Wulandari", nisn: "0012345704" },
    { id: 205, name: "Galih Pratama", nisn: "0012345705" },
    { id: 206, name: "Hana Safitri", nisn: "0012345706" },
  ],
};

// Mock data presensi (beberapa hari terakhir)
export const MOCK_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  // Kelas 1 - 2026-01-06
  { classId: 1, studentId: 101, date: "2026-01-06", status: "hadir" },
  { classId: 1, studentId: 102, date: "2026-01-06", status: "hadir" },
  { classId: 1, studentId: 103, date: "2026-01-06", status: "tidak_hadir" },
  { classId: 1, studentId: 104, date: "2026-01-06", status: "hadir" },
  { classId: 1, studentId: 105, date: "2026-01-06", status: "izin" },
  { classId: 1, studentId: 106, date: "2026-01-06", status: "hadir" },
  { classId: 1, studentId: 107, date: "2026-01-06", status: "hadir" },
  { classId: 1, studentId: 108, date: "2026-01-06", status: "sakit" },
  // Kelas 1 - 2026-01-07
  { classId: 1, studentId: 101, date: "2026-01-07", status: "hadir" },
  { classId: 1, studentId: 102, date: "2026-01-07", status: "hadir" },
  { classId: 1, studentId: 103, date: "2026-01-07", status: "hadir" },
  { classId: 1, studentId: 104, date: "2026-01-07", status: "hadir" },
  { classId: 1, studentId: 105, date: "2026-01-07", status: "hadir" },
  { classId: 1, studentId: 106, date: "2026-01-07", status: "tidak_hadir" },
  { classId: 1, studentId: 107, date: "2026-01-07", status: "hadir" },
  { classId: 1, studentId: 108, date: "2026-01-07", status: "hadir" },
  // Kelas 1 - 2026-01-08
  { classId: 1, studentId: 101, date: "2026-01-08", status: "hadir" },
  { classId: 1, studentId: 102, date: "2026-01-08", status: "izin" },
  { classId: 1, studentId: 103, date: "2026-01-08", status: "hadir" },
  { classId: 1, studentId: 104, date: "2026-01-08", status: "hadir" },
  { classId: 1, studentId: 105, date: "2026-01-08", status: "hadir" },
  { classId: 1, studentId: 106, date: "2026-01-08", status: "hadir" },
  { classId: 1, studentId: 107, date: "2026-01-08", status: "sakit" },
  { classId: 1, studentId: 108, date: "2026-01-08", status: "hadir" },
  // Kelas 2 - 2026-01-06
  { classId: 2, studentId: 201, date: "2026-01-06", status: "hadir" },
  { classId: 2, studentId: 202, date: "2026-01-06", status: "hadir" },
  { classId: 2, studentId: 203, date: "2026-01-06", status: "hadir" },
  { classId: 2, studentId: 204, date: "2026-01-06", status: "tidak_hadir" },
  { classId: 2, studentId: 205, date: "2026-01-06", status: "hadir" },
  { classId: 2, studentId: 206, date: "2026-01-06", status: "hadir" },
  // Kelas 2 - 2026-01-07
  { classId: 2, studentId: 201, date: "2026-01-07", status: "hadir" },
  { classId: 2, studentId: 202, date: "2026-01-07", status: "izin" },
  { classId: 2, studentId: 203, date: "2026-01-07", status: "hadir" },
  { classId: 2, studentId: 204, date: "2026-01-07", status: "hadir" },
  { classId: 2, studentId: 205, date: "2026-01-07", status: "hadir" },
  { classId: 2, studentId: 206, date: "2026-01-07", status: "hadir" },
];

// Helper: Get students in a class
export const getStudentsInClass = (classId: number): StudentInClass[] => {
  return MOCK_STUDENTS_BY_CLASS[classId] || [];
};

// Helper: Get attendance records for a class on a specific date
export const getAttendanceByClassAndDate = (classId: number, date: string): AttendanceRecord[] => {
  return MOCK_ATTENDANCE_RECORDS.filter(
    (record) => record.classId === classId && record.date === date
  );
};

// Helper: Get all attendance records for a specific student in a class
export const getStudentAttendance = (classId: number, studentId: number): AttendanceRecord[] => {
  return MOCK_ATTENDANCE_RECORDS.filter(
    (record) => record.classId === classId && record.studentId === studentId
  );
};

// Helper: Calculate attendance statistics for a student in a class
export const getStudentAttendanceStats = (classId: number, studentId: number) => {
  const records = getStudentAttendance(classId, studentId);
  const total = records.length;
  const hadir = records.filter((r) => r.status === "hadir").length;
  const tidakHadir = records.filter((r) => r.status === "tidak_hadir").length;
  const izin = records.filter((r) => r.status === "izin").length;
  const sakit = records.filter((r) => r.status === "sakit").length;
  const percentage = total > 0 ? Math.round((hadir / total) * 100) : 0;
  
  return { total, hadir, tidakHadir, izin, sakit, percentage };
};

// Helper: Get unique dates with attendance for a class
export const getAttendanceDates = (classId: number): string[] => {
  const dates = MOCK_ATTENDANCE_RECORDS
    .filter((record) => record.classId === classId)
    .map((record) => record.date);
  return [...new Set(dates)].sort().reverse();
};

// ================================================
// MOCK SCHOOLS DATA
// ================================================

export interface School {
  id: number;
  name: string;
  city: string;
  type: "SMP" | "SMA" | "SMK" | "MI" | "MTs" | "MA";
}

export const MOCK_SCHOOLS: School[] = [
  { id: 1, name: "SMKN 1 Semarang", city: "Semarang", type: "SMK" },
  { id: 2, name: "SMAN 1 Semarang", city: "Semarang", type: "SMA" },
  { id: 3, name: "SMPN 1 Semarang", city: "Semarang", type: "SMP" },
  { id: 4, name: "MAN 1 Semarang", city: "Semarang", type: "MA" },
  { id: 5, name: "MTsN 1 Semarang", city: "Semarang", type: "MTs" },
  { id: 6, name: "SMKN 2 Surabaya", city: "Surabaya", type: "SMK" },
  { id: 7, name: "SMAN 1 Surabaya", city: "Surabaya", type: "SMA" },
  { id: 8, name: "SMPN 1 Jakarta", city: "Jakarta", type: "SMP" },
  { id: 9, name: "SMAN 8 Jakarta", city: "Jakarta", type: "SMA" },
  { id: 10, name: "SMKN 1 Bandung", city: "Bandung", type: "SMK" },
  { id: 11, name: "MAN 1 Yogyakarta", city: "Yogyakarta", type: "MA" },
  { id: 12, name: "SMPN 1 Malang", city: "Malang", type: "SMP" },
];

// Search schools by name
export const searchSchools = (query: string): School[] => {
  if (!query || query.length < 2) return [];
  const lowerQuery = query.toLowerCase();
  return MOCK_SCHOOLS.filter(
    (school) =>
      school.name.toLowerCase().includes(lowerQuery) ||
      school.city.toLowerCase().includes(lowerQuery)
  ).slice(0, 5);
};

// Student registration status (for demo - whether registered by teacher to a class)
export const MOCK_STUDENT_REGISTERED_TO_CLASS = false;

// ================================================
// REGISTERED STUDENTS (siswa yang sudah daftar, belum masuk kelas)
// ================================================

export interface RegisteredStudent {
  id: number;
  name: string;
  email: string;
  nisn: string;
  school: string;
  registeredAt: string;
}

// Siswa yang sudah mendaftar tapi belum didaftarkan ke kelas oleh guru
export const MOCK_REGISTERED_STUDENTS: RegisteredStudent[] = [
  { id: 101, name: "Ahmad Fauzi", email: "ahmad.fauzi@siswa.id", nisn: "0012345678", school: "SMKN 1 Semarang", registeredAt: "2024-01-05" },
  { id: 102, name: "Siti Aminah", email: "siti.aminah@siswa.id", nisn: "0012345679", school: "SMKN 1 Semarang", registeredAt: "2024-01-06" },
  { id: 103, name: "Budi Santoso", email: "budi.santoso@siswa.id", nisn: "0012345680", school: "SMKN 1 Semarang", registeredAt: "2024-01-07" },
  { id: 104, name: "Dewi Lestari", email: "dewi.lestari@siswa.id", nisn: "0012345681", school: "SMKN 1 Semarang", registeredAt: "2024-01-08" },
  { id: 105, name: "Rizky Pratama", email: "rizky.pratama@siswa.id", nisn: "0012345682", school: "SMKN 1 Semarang", registeredAt: "2024-01-09" },
  { id: 106, name: "Nur Hidayah", email: "nur.hidayah@siswa.id", nisn: "0012345683", school: "SMKN 1 Semarang", registeredAt: "2024-01-10" },
  { id: 107, name: "Eko Prasetyo", email: "eko.prasetyo@siswa.id", nisn: "0012345684", school: "SMAN 1 Semarang", registeredAt: "2024-01-11" },
  { id: 108, name: "Fitri Handayani", email: "fitri.handayani@siswa.id", nisn: "0012345685", school: "SMAN 1 Semarang", registeredAt: "2024-01-12" },
];

// Search registered students by name or NISN (filtered by school)
export const searchRegisteredStudents = (query: string, school: string, excludeIds: number[] = []): RegisteredStudent[] => {
  if (!query || query.length < 2) return [];
  const lowerQuery = query.toLowerCase();
  return MOCK_REGISTERED_STUDENTS.filter(
    (student) =>
      !excludeIds.includes(student.id) &&
      student.school === school && // Filter by school
      (student.name.toLowerCase().includes(lowerQuery) ||
       student.nisn.includes(query) ||
       student.email.toLowerCase().includes(lowerQuery))
  ).slice(0, 5);
};

// Keep old MOCK_CLASS_INFO for backward compatibility
export const MOCK_CLASS_INFO = MOCK_CLASSES[0];

