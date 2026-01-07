/**
 * Student Data Constants
 * Mock data untuk simulasi fitur kelas siswa (frontend-only)
 */

// Role ID untuk siswa
export const STUDENT_ROLE_ID = 12;

// Mock materi kelas
export const MOCK_MATERIALS = [
  {
    id: 1,
    title: "Pengenalan Al-Quran",
    description: "Belajar dasar-dasar membaca Al-Quran dengan tajwid yang benar",
    type: "pdf",
    fileUrl: "/materials/al-quran-intro.pdf",
    createdAt: "2026-01-05",
  },
  {
    id: 2,
    title: "Sejarah Nabi Muhammad SAW",
    description: "Mempelajari perjalanan hidup Rasulullah SAW dari lahir hingga wafat",
    type: "video",
    fileUrl: "https://youtube.com/watch?v=example",
    createdAt: "2026-01-03",
  },
  {
    id: 3,
    title: "Rukun Islam",
    description: "Memahami 5 rukun Islam dan implementasinya dalam kehidupan sehari-hari",
    type: "pdf",
    fileUrl: "/materials/rukun-islam.pdf",
    createdAt: "2026-01-01",
  },
];

// Mock latihan soal
export const MOCK_EXERCISES = [
  {
    id: 1,
    title: "Latihan Tajwid Dasar",
    totalQuestions: 20,
    duration: 30, // menit
    deadline: "2026-01-15",
    isCompleted: false,
  },
  {
    id: 2,
    title: "Quiz Sejarah Islam",
    totalQuestions: 15,
    duration: 25,
    deadline: "2026-01-10",
    isCompleted: true,
    score: 85,
  },
  {
    id: 3,
    title: "Evaluasi Rukun Islam",
    totalQuestions: 25,
    duration: 45,
    deadline: "2026-01-20",
    isCompleted: false,
  },
];

// Mock diskusi kelas
export interface Discussion {
  id: number;
  authorName: string;
  authorAvatar: string | null;
  content: string;
  createdAt: string;
  replies: number;
  images?: string[]; // Array of image URLs
  video?: string; // Video URL (YouTube embed)
}

export const MOCK_DISCUSSIONS: Discussion[] = [
  {
    id: 1,
    authorName: "Ahmad",
    authorAvatar: null,
    content: "Bagaimana cara membedakan hukum bacaan idzhar dan ikhfa? Berikut contoh tulisannya yang saya foto dari buku tajwid.",
    createdAt: "2026-01-06 10:30",
    replies: 5,
    images: [
      "https://picsum.photos/seed/quran1/400/300",
      "https://picsum.photos/seed/tajwid1/400/300",
    ],
  },
  {
    id: 2,
    authorName: "Fatimah",
    authorAvatar: null,
    content: "Apa hikmah dari puasa Ramadhan yang bisa kita ambil? Simak video penjelasan dari Ustadz berikut ini.",
    createdAt: "2026-01-05 14:15",
    replies: 8,
    video: "https://www.youtube.com/embed/4zLfCnGVeL4",
  },
  {
    id: 3,
    authorName: "Muhammad",
    authorAvatar: null,
    content: "Mohon dijelaskan tentang tata cara sholat jenazah. Apakah ada yang punya catatan atau referensi?",
    createdAt: "2026-01-04 09:00",
    replies: 3,
  },
  {
    id: 4,
    authorName: "Aisyah",
    authorAvatar: null,
    content: "Dokumentasi kegiatan belajar tajwid hari ini! Alhamdulillah berjalan lancar. Ada video penjelasan dari guru dan foto-foto saat praktik.",
    createdAt: "2026-01-03 15:45",
    replies: 12,
    images: [
      "https://picsum.photos/seed/study1/400/300",
      "https://picsum.photos/seed/class1/400/300",
      "https://picsum.photos/seed/book1/400/300",
    ],
    video: "https://www.youtube.com/embed/LDU_Txk06tM",
  },
  {
    id: 5,
    authorName: "Umar",
    authorAvatar: null,
    content: "Berikut foto materi tentang Rukun Iman yang saya ringkas. Semoga bermanfaat untuk teman-teman.",
    createdAt: "2026-01-02 08:20",
    replies: 7,
    images: [
      "https://picsum.photos/seed/notes1/400/300",
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
      "https://picsum.photos/seed/notes2/400/300",
      "https://picsum.photos/seed/study2/400/300",
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
      "https://picsum.photos/seed/wudhu1/400/300",
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
      "https://picsum.photos/seed/lomba1/400/300",
      "https://picsum.photos/seed/lomba2/400/300",
      "https://picsum.photos/seed/lomba3/400/300",
    ],
    video: "https://www.youtube.com/embed/LDU_Txk06tM",
  },
];

// Info kelas siswa (mock)
export const MOCK_CLASS_INFO = {
  id: 1,
  name: "PAI Kelas 9A",
  teacher: {
    name: "Ustadz Hasan",
    email: "hasan@sekolah.sch.id",
  },
  totalStudents: 32,
  school: "SMP Negeri 1 Jakarta",
};
