/**
 * Student Data Constants
 * Type definitions and helper functions for student features
 */

// Role ID untuk siswa
export const STUDENT_ROLE_ID = 8;
export const MITRA_ROLE_ID = 14;

// Interface untuk materi
export interface Material {
  id: number;
  title: string;
  description: string;
  content: string; // Full content/summary
  type: "pdf" | "video";
  fileUrl: string;
  file_url?: string; // API snake_case alternative
  duration: string; // e.g. "15 menit"
  chapters?: string[];
  createdAt: string;
  created_at?: string; // API snake_case alternative
  // Repost fields
  repostedFrom?: string; // Original author name
  originalId?: number; // Original material ID
  isPublic?: boolean; // Can be reposted by others
}

export interface RepostSourceTeacher {
  id: number;
  name: string;
  avatar: string | null;
}

export interface RepostSourceClass {
  id: number;
  name: string;
}

export interface RepostSource {
  teacher: RepostSourceTeacher;
  class: RepostSourceClass;
}

// Interface untuk latihan soal
export interface Exercise {
  id: number;
  title: string;
  description: string;
  totalQuestions: number;
  duration: number; // menit
  deadline: string;

  // Attempt / status
  is_completed: boolean;
  result_score: number | null;
  attempt_id: number | null;

  // Repost
  is_repost: boolean;
  reposted_from: RepostSource | null;

  // Optional (detail view)
  questions?: Question[];
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
}

// Interface diskusi kelas
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

// Interface forum publik (seluruh sekolah)
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

// Info kelas-kelas siswa
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

// Helper function to get class by ID
export const getClassById = (id: number): ClassInfo | undefined => {
  return undefined;
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
export type AttendanceStatus = "hadir" | "alpa" | "izin" | "sakit" | "tidak_hadir";

// Interface record presensi
export interface AttendanceRecord {
  classId: number;
  studentId: number;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
}

// Helper: Get students in a class
export const getStudentsInClass = (classId: number): StudentInClass[] => {
  return [];
};

// Helper: Get attendance records for a class on a specific date
export const getAttendanceByClassAndDate = (
  classId: number,
  date: string
): AttendanceRecord[] => {
  return [];
};

// Helper: Get all attendance records for a specific student in a class
export const getStudentAttendance = (
  classId: number,
  studentId: number
): AttendanceRecord[] => {
  return [];
};

// Helper: Calculate attendance statistics for a student in a class
export const getStudentAttendanceStats = (
  classId: number,
  studentId: number
) => {
  return { total: 0, hadir: 0, tidakHadir: 0, izin: 0, sakit: 0, percentage: 0 };
};

// Helper: Get unique dates with attendance for a class
export const getAttendanceDates = (classId: number): string[] => {
  return [];
};

// ================================================
// SCHOOLS DATA
// ================================================

export interface School {
  id: number;
  name: string;
  city: string;
  type: "SMP" | "SMA" | "SMK" | "MI" | "MTs" | "MA";
}

// Search schools by name
export const searchSchools = (query: string): School[] => {
  return [];
};

// ================================================
// REGISTERED STUDENTS
// ================================================
export type StudentProfile = {
  nisn: string;
  school_place: string;
};
 