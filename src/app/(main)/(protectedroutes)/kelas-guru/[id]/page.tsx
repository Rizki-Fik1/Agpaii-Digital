"use client";
import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  ChevronLeftIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  ChevronDownIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  PlusIcon,
  XMarkIcon,
  DocumentTextIcon,
  PlayIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolidIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";
import Link from "next/link";
import {
  getClassById,
  getStudentsInClass,
  getAttendanceByClassAndDate,
  getAttendanceDates,
  AttendanceStatus,
  MOCK_MATERIALS,
  MOCK_EXERCISES,
  Material,
  Exercise,
  Question,
  searchRegisteredStudents,
  RegisteredStudent,
  StudentInClass,
} from "@/constants/student-data";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

type TabType = "siswa" | "presensi" | "materi" | "latihan";

// Status options for attendance
const STATUS_OPTIONS: { value: AttendanceStatus; label: string; color: string; icon: React.ReactNode }[] = [
  { value: "hadir", label: "Hadir", color: "text-green-600", icon: <CheckCircleIcon className="size-4" /> },
  { value: "tidak_hadir", label: "Tidak", color: "text-red-600", icon: <XCircleIcon className="size-4" /> },
  { value: "izin", label: "Izin", color: "text-blue-600", icon: <ClockIcon className="size-4" /> },
  { value: "sakit", label: "Sakit", color: "text-orange-600", icon: <ExclamationTriangleIcon className="size-4" /> },
];

export default function KelasGuruDetailPage() {
  const params = useParams();
  const classId = Number(params.id);
  const classInfo = getClassById(classId);
  const students = getStudentsInClass(classId);
  
  const [activeTab, setActiveTab] = useState<TabType>("siswa");
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Local attendance state
  const [attendanceData, setAttendanceData] = useState<{ [studentId: number]: AttendanceStatus }>(() => {
    const initial: { [studentId: number]: AttendanceStatus } = {};
    const records = getAttendanceByClassAndDate(classId, selectedDate);
    records.forEach((record) => {
      initial[record.studentId] = record.status;
    });
    return initial;
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Local materials & exercises state (for demo)
  const [materials, setMaterials] = useState<Material[]>(MOCK_MATERIALS);
  const [exercises, setExercises] = useState<Exercise[]>(MOCK_EXERCISES);
  
  // Student management state
  const [classStudents, setClassStudents] = useState<RegisteredStudent[]>([]);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentSearchResults, setStudentSearchResults] = useState<RegisteredStudent[]>([]);
  
  // Search students handler - filter by class school
  const handleStudentSearch = (query: string) => {
    setStudentSearch(query);
    if (query.length >= 2 && classInfo) {
      const excludeIds = classStudents.map((s) => s.id);
      const results = searchRegisteredStudents(query, classInfo.school, excludeIds);
      setStudentSearchResults(results);
    } else {
      setStudentSearchResults([]);
    }
  };
  
  const addStudentToClass = (student: RegisteredStudent) => {
    setClassStudents([...classStudents, student]);
    setStudentSearch("");
    setStudentSearchResults([]);
  };
  
  const removeStudentFromClass = (studentId: number) => {
    setClassStudents(classStudents.filter((s) => s.id !== studentId));
  };
  
  // Modal states
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  
  // New material form state
  const [newMaterial, setNewMaterial] = useState({
    title: "",
    description: "",
    content: "",
    type: "pdf" as "pdf" | "video",
    fileUrl: "",
    duration: "",
  });
  
  // New exercise form state
  const [newExercise, setNewExercise] = useState({
    title: "",
    description: "",
    duration: 10,
    deadline: "",
  });
  
  // Questions for new exercise
  const [newQuestions, setNewQuestions] = useState<{
    question: string;
    options: string[];
    correctAnswer: number;
  }[]>([]);
  
  const addQuestion = () => {
    setNewQuestions([
      ...newQuestions,
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
      },
    ]);
  };
  
  const removeQuestion = (index: number) => {
    setNewQuestions(newQuestions.filter((_, i) => i !== index));
  };
  
  const updateQuestion = (index: number, field: string, value: string | number) => {
    const updated = [...newQuestions];
    if (field === "question") {
      updated[index].question = value as string;
    } else if (field === "correctAnswer") {
      updated[index].correctAnswer = value as number;
    }
    setNewQuestions(updated);
  };
  
  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...newQuestions];
    updated[questionIndex].options[optionIndex] = value;
    setNewQuestions(updated);
  };
  
  // Handlers
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    setShowDatePicker(false);
    setSaveSuccess(false);
    
    const records = getAttendanceByClassAndDate(classId, newDate);
    const newData: { [studentId: number]: AttendanceStatus } = {};
    records.forEach((record) => {
      newData[record.studentId] = record.status;
    });
    setAttendanceData(newData);
  };
  
  const handleStatusChange = (studentId: number, status: AttendanceStatus) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: status,
    }));
    setSaveSuccess(false);
  };
  
  const handleSaveAttendance = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaveSuccess(true);
  };
  
  const handleAddMaterial = () => {
    if (!newMaterial.title || !newMaterial.description) return;
    
    const material: Material = {
      id: Date.now(),
      title: newMaterial.title,
      description: newMaterial.description,
      content: newMaterial.content || newMaterial.description,
      type: newMaterial.type,
      fileUrl: newMaterial.fileUrl || (newMaterial.type === "pdf" ? "/materials/new.pdf" : "https://www.youtube.com/embed/example"),
      duration: newMaterial.duration || "15 menit",
      createdAt: new Date().toISOString().split("T")[0],
    };
    
    setMaterials([material, ...materials]);
    setNewMaterial({ title: "", description: "", content: "", type: "pdf", fileUrl: "", duration: "" });
    setShowAddMaterialModal(false);
  };
  
  const handleDeleteMaterial = (id: number) => {
    setMaterials(materials.filter((m) => m.id !== id));
  };
  
  const handleAddExercise = () => {
    if (!newExercise.title || !newExercise.description || !newExercise.deadline) return;
    if (newQuestions.length === 0) {
      alert("Tambahkan minimal 1 soal");
      return;
    }
    
    // Validate all questions have content
    const hasEmptyQuestion = newQuestions.some(
      (q) => !q.question.trim() || q.options.some((opt) => !opt.trim())
    );
    if (hasEmptyQuestion) {
      alert("Lengkapi semua soal dan pilihan jawaban");
      return;
    }
    
    const questions: Question[] = newQuestions.map((q, idx) => ({
      id: idx + 1,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
    }));
    
    const exercise: Exercise = {
      id: Date.now(),
      title: newExercise.title,
      description: newExercise.description,
      totalQuestions: newQuestions.length,
      duration: newExercise.duration,
      deadline: newExercise.deadline,
      isCompleted: false,
      questions: questions,
    };
    
    setExercises([exercise, ...exercises]);
    setNewExercise({ title: "", description: "", duration: 10, deadline: "" });
    setNewQuestions([]);
    setShowAddExerciseModal(false);
  };
  
  const handleDeleteExercise = (id: number) => {
    setExercises(exercises.filter((e) => e.id !== id));
  };
  
  // Stats
  const stats = useMemo(() => {
    const values = Object.values(attendanceData);
    return {
      hadir: values.filter((v) => v === "hadir").length,
      tidakHadir: values.filter((v) => v === "tidak_hadir").length,
      izin: values.filter((v) => v === "izin").length,
      sakit: values.filter((v) => v === "sakit").length,
      total: students.length,
      filled: values.length,
    };
  }, [attendanceData, students.length]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (!classInfo) {
    return (
      <div className="w-full max-w-[480px] mx-auto bg-white min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Kelas tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[480px] mx-auto bg-white min-h-screen pb-24">
      {/* Header */}
      <div className={clsx("bg-gradient-to-r text-white p-4 pt-6", classInfo.color)}>
        <div className="flex items-center gap-3 mb-4">
          <Link href="/kelas-guru" className="p-1">
            <ChevronLeftIcon className="size-6" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold">{classInfo.name}</h1>
            <p className="text-xs text-white/80">{classInfo.school}</p>
          </div>
        </div>
        
        <div className="bg-white/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserGroupIcon className="size-5" />
              <span className="text-sm">{students.length} Siswa</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <BookOpenIcon className="size-4" />
                {materials.length} Materi
              </span>
              <span className="flex items-center gap-1">
                <ClipboardDocumentListIcon className="size-4" />
                {exercises.length} Latihan
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto">
        {[
          { id: "siswa" as TabType, label: "Siswa" },
          { id: "presensi" as TabType, label: "Presensi" },
          { id: "materi" as TabType, label: "Materi" },
          { id: "latihan" as TabType, label: "Latihan" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "flex-1 py-3 text-sm font-medium transition whitespace-nowrap px-2",
              activeTab === tab.id
                ? "text-teal-600 border-b-2 border-teal-600"
                : "text-slate-500"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Siswa Tab */}
        {activeTab === "siswa" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-slate-700">Daftar Siswa ({classStudents.length + students.length})</h3>
              <button
                onClick={() => setShowAddStudentModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white text-xs font-medium rounded-lg hover:bg-teal-700 transition"
              >
                <PlusIcon className="size-4" />
                Tambah Siswa
              </button>
            </div>
            
            {/* Combined students list */}
            {(classStudents.length + students.length) === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                <UserGroupIcon className="size-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Belum ada siswa terdaftar</p>
                <p className="text-xs text-slate-400">Klik "Tambah Siswa" untuk menambahkan</p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Existing students from mock data */}
                {students.map((student, index) => (
                  <div key={`existing-${student.id}`} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-slate-700">{student.name}</p>
                          <p className="text-xs text-slate-400">NISN: {student.nisn}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Added students */}
                {classStudents.map((student, index) => (
                  <div key={`added-${student.id}`} className="bg-green-50 border border-green-200 rounded-xl p-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">
                          {students.length + index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-slate-700">{student.name}</p>
                          <p className="text-xs text-slate-400">NISN: {student.nisn} • {student.school}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeStudentFromClass(student.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <TrashIcon className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Presensi Tab */}
        {activeTab === "presensi" && (
          <>
            <div className="mb-4">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="w-full flex items-center justify-between bg-slate-100 rounded-lg px-4 py-3 text-left"
              >
                <div className="flex items-center gap-2">
                  <CalendarDaysIcon className="size-5 text-teal-600" />
                  <div>
                    <p className="text-xs text-slate-500">Tanggal</p>
                    <p className="font-medium text-slate-700">{formatDate(selectedDate)}</p>
                  </div>
                </div>
                <ChevronDownIcon className={clsx("size-5 text-slate-400 transition", showDatePicker && "rotate-180")} />
              </button>
              
              {showDatePicker && (
                <div className="mt-2 p-2 bg-white border border-slate-200 rounded-lg shadow-lg">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-slate-700">Daftar Siswa</h3>
                <span className="text-xs text-slate-500">{stats.filled}/{stats.total} terisi</span>
              </div>
              
              {/* Scrollable student list */}
              <div className="max-h-[400px] overflow-y-auto space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                {students.map((student, index) => (
                  <div key={student.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-7 h-7 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-slate-700">{student.name}</p>
                        <p className="text-xs text-slate-400">NISN: {student.nisn}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2">
                      {STATUS_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleStatusChange(student.id, option.value)}
                          className={clsx(
                            "flex flex-col items-center gap-1 py-2 px-1 rounded-lg border-2 transition text-xs",
                            attendanceData[student.id] === option.value
                              ? option.value === "hadir"
                                ? "border-green-500 bg-green-50"
                                : option.value === "tidak_hadir"
                                ? "border-red-500 bg-red-50"
                                : option.value === "izin"
                                ? "border-blue-500 bg-blue-50"
                                : "border-orange-500 bg-orange-50"
                              : "border-slate-200 hover:border-slate-300"
                          )}
                        >
                          <span className={option.color}>{option.icon}</span>
                          <span className={clsx("font-medium", attendanceData[student.id] === option.value ? option.color : "text-slate-500")}>
                            {option.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Rekap Kehadiran */}
            <div className="mt-6 bg-slate-50 rounded-xl p-4 border border-slate-200">
              <h4 className="font-medium text-slate-700 mb-3">Rekap Kehadiran</h4>
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-green-100 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.hadir}</p>
                  <p className="text-[10px] text-green-700">Hadir</p>
                </div>
                <div className="bg-red-100 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-red-600">{stats.tidakHadir}</p>
                  <p className="text-[10px] text-red-700">Tidak Hadir</p>
                </div>
                <div className="bg-blue-100 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-blue-600">{stats.izin}</p>
                  <p className="text-[10px] text-blue-700">Izin</p>
                </div>
                <div className="bg-orange-100 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-orange-600">{stats.sakit}</p>
                  <p className="text-[10px] text-orange-700">Sakit</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 text-center mt-3">
                {stats.filled} dari {stats.total} siswa tercatat
              </p>
            </div>
          </>
        )}

        {/* Materi Tab */}
        {activeTab === "materi" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-slate-700">Daftar Materi</h3>
              <button
                onClick={() => setShowAddMaterialModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white text-xs font-medium rounded-lg hover:bg-teal-700 transition"
              >
                <PlusIcon className="size-4" />
                Tambah
              </button>
            </div>
            
            {materials.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                Belum ada materi. Klik tombol Tambah untuk menambahkan materi baru.
              </div>
            ) : (
              <div className="space-y-3">
                {materials.map((material) => (
                  <div key={material.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className={clsx("p-3 rounded-xl", material.type === "pdf" ? "bg-red-100" : "bg-blue-100")}>
                        {material.type === "pdf" ? (
                          <DocumentTextIcon className="size-6 text-red-600" />
                        ) : (
                          <PlayIcon className="size-6 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-700">{material.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{material.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <ClockIcon className="size-3" />
                            {material.duration}
                          </span>
                          <span className={clsx(
                            "px-2 py-0.5 rounded-full text-[10px] font-medium uppercase",
                            material.type === "pdf" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                          )}>
                            {material.type}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteMaterial(material.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <TrashIcon className="size-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Latihan Tab */}
        {activeTab === "latihan" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-slate-700">Daftar Latihan Soal</h3>
              <button
                onClick={() => setShowAddExerciseModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white text-xs font-medium rounded-lg hover:bg-teal-700 transition"
              >
                <PlusIcon className="size-4" />
                Tambah
              </button>
            </div>
            
            {exercises.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                Belum ada latihan soal. Klik tombol Tambah untuk menambahkan latihan baru.
              </div>
            ) : (
              <div className="space-y-3">
                {exercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className={clsx(
                      "bg-white border rounded-xl p-4 shadow-sm",
                      exercise.isCompleted ? "border-green-300 bg-green-50/50" : "border-slate-200"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={clsx("p-3 rounded-xl", exercise.isCompleted ? "bg-green-100" : "bg-orange-100")}>
                        {exercise.isCompleted ? (
                          <CheckCircleSolidIcon className="size-6 text-green-600" />
                        ) : (
                          <ClipboardDocumentListIcon className="size-6 text-orange-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-700">{exercise.title}</h4>
                        <p className="text-xs text-slate-500 mt-1">{exercise.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                          <span>{exercise.totalQuestions} soal</span>
                          <span>•</span>
                          <span>{exercise.duration} menit</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Deadline: {exercise.deadline}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteExercise(exercise.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <TrashIcon className="size-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Save Button - Presensi Tab */}
      {activeTab === "presensi" && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 max-w-[480px] mx-auto">
          <button
            onClick={handleSaveAttendance}
            disabled={isSaving}
            className={clsx(
              "w-full py-3 rounded-xl font-semibold text-white transition flex items-center justify-center gap-2",
              saveSuccess ? "bg-green-500" : isSaving ? "bg-teal-400" : "bg-teal-600 hover:bg-teal-700"
            )}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin size-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Menyimpan...
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircleSolidIcon className="size-5" />
                Tersimpan!
              </>
            ) : (
              "Simpan Presensi"
            )}
          </button>
        </div>
      )}

      {/* Add Material Modal */}
      {showAddMaterialModal && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddMaterialModal(false)} />
          <div className="relative w-full max-w-[480px] bg-white rounded-t-2xl p-4 pb-6 max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-700">Tambah Materi</h3>
              <button onClick={() => setShowAddMaterialModal(false)} className="p-1 hover:bg-slate-100 rounded-full">
                <XMarkIcon className="size-6 text-slate-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Judul Materi *</label>
                <input
                  type="text"
                  value={newMaterial.title}
                  onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                  placeholder="Contoh: Pengenalan Al-Quran"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi *</label>
                <textarea
                  value={newMaterial.description}
                  onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                  placeholder="Deskripsi singkat tentang materi ini..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipe Materi</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setNewMaterial({ ...newMaterial, type: "pdf" })}
                    className={clsx(
                      "flex-1 py-2 rounded-lg border-2 text-sm font-medium transition",
                      newMaterial.type === "pdf"
                        ? "border-red-500 bg-red-50 text-red-600"
                        : "border-slate-200 text-slate-500"
                    )}
                  >
                    <DocumentTextIcon className="size-4 inline mr-1" /> PDF
                  </button>
                  <button
                    onClick={() => setNewMaterial({ ...newMaterial, type: "video" })}
                    className={clsx(
                      "flex-1 py-2 rounded-lg border-2 text-sm font-medium transition",
                      newMaterial.type === "video"
                        ? "border-blue-500 bg-blue-50 text-blue-600"
                        : "border-slate-200 text-slate-500"
                    )}
                  >
                    <PlayIcon className="size-4 inline mr-1" /> Video
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {newMaterial.type === "pdf" ? "URL File PDF" : "URL Video (YouTube)"}
                </label>
                <input
                  type="text"
                  value={newMaterial.fileUrl}
                  onChange={(e) => setNewMaterial({ ...newMaterial, fileUrl: e.target.value })}
                  placeholder={newMaterial.type === "pdf" ? "/materials/filename.pdf" : "https://www.youtube.com/watch?v=..."}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Durasi</label>
                <input
                  type="text"
                  value={newMaterial.duration}
                  onChange={(e) => setNewMaterial({ ...newMaterial, duration: e.target.value })}
                  placeholder="Contoh: 30 menit"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
              
              <button
                onClick={handleAddMaterial}
                disabled={!newMaterial.title || !newMaterial.description}
                className="w-full py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Simpan Materi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Exercise Modal */}
      {showAddExerciseModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddExerciseModal(false)} />
          <div className="relative w-full max-w-[480px] bg-white rounded-2xl p-4 pb-6 max-h-[90vh] overflow-auto mx-4">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white pb-2 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-700">Tambah Latihan Soal</h3>
              <button onClick={() => setShowAddExerciseModal(false)} className="p-1 hover:bg-slate-100 rounded-full">
                <XMarkIcon className="size-6 text-slate-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Judul Latihan *</label>
                <input
                  type="text"
                  value={newExercise.title}
                  onChange={(e) => setNewExercise({ ...newExercise, title: e.target.value })}
                  placeholder="Contoh: Latihan Tajwid Dasar"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi *</label>
                <textarea
                  value={newExercise.description}
                  onChange={(e) => setNewExercise({ ...newExercise, description: e.target.value })}
                  placeholder="Deskripsi singkat tentang latihan ini..."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Durasi (menit)</label>
                  <input
                    type="number"
                    value={newExercise.duration}
                    onChange={(e) => setNewExercise({ ...newExercise, duration: parseInt(e.target.value) || 10 })}
                    min={1}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Deadline *</label>
                  <input
                    type="date"
                    value={newExercise.deadline}
                    onChange={(e) => setNewExercise({ ...newExercise, deadline: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>
              
              {/* Questions Section */}
              <div className="border-t border-slate-200 pt-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-slate-700">Daftar Soal ({newQuestions.length})</h4>
                  <button
                    onClick={addQuestion}
                    className="flex items-center gap-1 px-3 py-1.5 bg-teal-100 text-teal-700 text-xs font-medium rounded-lg hover:bg-teal-200 transition"
                  >
                    <PlusIcon className="size-4" />
                    Tambah Soal
                  </button>
                </div>
                
                {newQuestions.length === 0 ? (
                  <div className="text-center py-6 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                    <ClipboardDocumentListIcon className="size-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Belum ada soal</p>
                    <p className="text-xs text-slate-400">Klik "Tambah Soal" untuk membuat soal</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {newQuestions.map((q, qIndex) => (
                      <div key={qIndex} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs font-bold text-teal-600 bg-teal-100 px-2 py-0.5 rounded-full">
                            Soal {qIndex + 1}
                          </span>
                          <button
                            onClick={() => removeQuestion(qIndex)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <TrashIcon className="size-4" />
                          </button>
                        </div>
                        
                        <textarea
                          value={q.question}
                          onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                          placeholder="Tulis pertanyaan di sini..."
                          rows={2}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none mb-3"
                        />
                        
                        <p className="text-xs font-medium text-slate-500 mb-2">Pilihan Jawaban (klik untuk pilih jawaban benar)</p>
                        <div className="space-y-2">
                          {q.options.map((opt, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuestion(qIndex, "correctAnswer", optIndex)}
                                className={clsx(
                                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition flex-shrink-0",
                                  q.correctAnswer === optIndex
                                    ? "bg-green-500 text-white"
                                    : "bg-white border-2 border-slate-300 text-slate-500 hover:border-green-400"
                                )}
                              >
                                {String.fromCharCode(65 + optIndex)}
                              </button>
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                                placeholder={`Pilihan ${String.fromCharCode(65 + optIndex)}`}
                                className={clsx(
                                  "flex-1 px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20",
                                  q.correctAnswer === optIndex
                                    ? "border-green-400 bg-green-50"
                                    : "border-slate-300"
                                )}
                              />
                              {q.correctAnswer === optIndex && (
                                <CheckCircleSolidIcon className="size-5 text-green-500 flex-shrink-0" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                onClick={handleAddExercise}
                disabled={!newExercise.title || !newExercise.description || !newExercise.deadline || newQuestions.length === 0}
                className="w-full py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Simpan Latihan ({newQuestions.length} soal)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => {
            setShowAddStudentModal(false);
            setStudentSearch("");
            setStudentSearchResults([]);
          }} />
          <div className="relative w-full max-w-[480px] bg-white rounded-2xl p-4 pb-6 max-h-[80vh] overflow-auto mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-700">Tambah Siswa</h3>
              <button 
                onClick={() => {
                  setShowAddStudentModal(false);
                  setStudentSearch("");
                  setStudentSearchResults([]);
                }} 
                className="p-1 hover:bg-slate-100 rounded-full"
              >
                <XMarkIcon className="size-6 text-slate-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Search Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cari Siswa
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => handleStudentSearch(e.target.value)}
                    placeholder="Cari nama atau NISN siswa..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 placeholder-slate-400"
                    autoFocus
                  />
                </div>
                {studentSearch.length > 0 && studentSearch.length < 2 && (
                  <p className="text-xs text-slate-400 mt-1">Ketik minimal 2 karakter</p>
                )}
              </div>
              
              {/* Search Results */}
              {studentSearchResults.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">Hasil Pencarian ({studentSearchResults.length})</p>
                  {studentSearchResults.map((student) => (
                    <div 
                      key={student.id}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                          <span className="text-teal-600 font-bold text-lg">
                            {student.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-700">{student.name}</p>
                          <p className="text-xs text-slate-400">NISN: {student.nisn}</p>
                          <p className="text-xs text-slate-400">{student.school}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => addStudentToClass(student)}
                        className="px-3 py-1.5 bg-teal-600 text-white text-xs font-medium rounded-lg hover:bg-teal-700 transition"
                      >
                        Tambah
                      </button>
                    </div>
                  ))}
                </div>
              ) : studentSearch.length >= 2 ? (
                <div className="text-center py-6 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">Tidak ada siswa dengan nama tersebut di {classInfo?.school}</p>
                  <p className="text-xs text-slate-400 mt-1">Pastikan siswa sudah mendaftar dan memilih sekolah yang sama</p>
                </div>
              ) : null}
              
              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-xs text-blue-700">
                  <strong>Tips:</strong> Cari berdasarkan nama lengkap atau NISN siswa. Siswa harus mendaftar terlebih dahulu melalui aplikasi.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
