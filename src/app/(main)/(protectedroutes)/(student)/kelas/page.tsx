"use client";
import { useAuth } from "@/utils/context/auth_context";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  AcademicCapIcon,
  UserGroupIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { MOCK_CLASSES, getAttendanceDates, getAttendanceByClassAndDate, MOCK_STUDENTS_BY_CLASS } from "@/constants/student-data";
import clsx from "clsx";

// Calculate attendance stats for a student in a class (using first student ID as demo)
const getClassAttendanceForStudent = (classId: number) => {
  // For demo, we'll calculate based on all attendance records for the class
  // In real app, this would filter by the logged-in student's ID
  const dates = getAttendanceDates(classId);
  const students = MOCK_STUDENTS_BY_CLASS[classId] || [];
  
  // Use first student as demo (in real app, use auth.id)
  const studentId = students[0]?.id;
  if (!studentId) return { hadir: 0, total: 0, percentage: 0 };
  
  let hadir = 0;
  let total = 0;
  
  dates.forEach((date) => {
    const records = getAttendanceByClassAndDate(classId, date);
    const studentRecord = records.find((r) => r.studentId === studentId);
    if (studentRecord) {
      total++;
      if (studentRecord.status === "hadir") hadir++;
    }
  });
  
  const percentage = total > 0 ? Math.round((hadir / total) * 100) : 0;
  return { hadir, total, percentage };
};

export default function KelasListPage() {
  const { auth } = useAuth();

  return (
    <div className="w-full max-w-[480px] mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white p-4 pt-6">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/beranda" className="p-1">
            <ChevronLeftIcon className="size-6" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold">Kelas Saya</h1>
            <p className="text-xs text-teal-100">Pilih kelas untuk memulai</p>
          </div>
        </div>
        
        {/* Summary Card */}
        <div className="bg-white/20 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-lg p-2">
              <AcademicCapIcon className="size-6 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-xs">Total Kelas Terdaftar</p>
              <p className="text-white font-semibold text-lg">{MOCK_CLASSES.length} Kelas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Classes List */}
      <div className="p-4 space-y-3">
        <h2 className="text-sm font-medium text-slate-500 mb-2">Daftar Kelas</h2>
        
        {MOCK_CLASSES.map((kelas) => {
          const attendance = getClassAttendanceForStudent(kelas.id);
          
          return (
            <Link href={`/kelas/${kelas.id}`} key={kelas.id} className="block">
              <div className={clsx(
                "bg-gradient-to-r rounded-xl p-4 shadow-md hover:shadow-lg transition",
                kelas.color
              )}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <span className="inline-block px-2 py-0.5 bg-white/20 text-white text-[10px] font-medium rounded-full mb-2">
                      {kelas.subject}
                    </span>
                    <h3 className="text-white font-bold text-lg">{kelas.name}</h3>
                    <p className="text-white/80 text-sm mt-1">
                      {kelas.teacher.name}
                    </p>
                    <div className="flex items-center gap-1 text-white/70 text-xs mt-2">
                      <UserGroupIcon className="size-4" />
                      <span>{kelas.totalStudents} siswa</span>
                    </div>
                  </div>
                  <div className="bg-white/20 rounded-full p-2">
                    <ChevronRightIcon className="size-5 text-white" />
                  </div>
                </div>
                
                {/* Attendance Status Bar */}
                {attendance.total > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 text-white/90 text-xs">
                        <CheckCircleIcon className="size-4" />
                        <span>Kehadiran: {attendance.hadir}/{attendance.total} hari</span>
                      </div>
                      <span className={clsx(
                        "text-xs font-bold px-2 py-0.5 rounded-full",
                        attendance.percentage >= 80 
                          ? "bg-green-500/30 text-green-100"
                          : attendance.percentage >= 60
                          ? "bg-yellow-500/30 text-yellow-100"
                          : "bg-red-500/30 text-red-100"
                      )}>
                        {attendance.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className={clsx(
                          "h-2 rounded-full transition-all",
                          attendance.percentage >= 80 
                            ? "bg-green-400"
                            : attendance.percentage >= 60
                            ? "bg-yellow-400"
                            : "bg-red-400"
                        )}
                        style={{ width: `${attendance.percentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
