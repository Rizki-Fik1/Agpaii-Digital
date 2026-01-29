"use client";
import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
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
  PencilIcon,
  ChatBubbleLeftIcon,
  PhotoIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolidIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";
import Link from "next/link";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
  getClassById,
  getStudentsInClass,
  getAttendanceByClassAndDate,
  getAttendanceDates,
  AttendanceStatus,
  Material,
  Exercise,
  Question,
  StudentInClass,
} from "@/constants/student-data";

type TabType = "siswa" | "presensi" | "materi" | "latihan" | "diskusi";

const STATUS_OPTIONS: {
  value: AttendanceStatus;
  label: string;
  color: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "hadir",
    label: "Hadir",
    color: "text-green-600",
    icon: <CheckCircleIcon className="size-4" />,
  },
  {
    value: "tidak_hadir",
    label: "Alpa",
    color: "text-red-600",
    icon: <XCircleIcon className="size-4" />,
  },
  {
    value: "izin",
    label: "Izin",
    color: "text-blue-600",
    icon: <ClockIcon className="size-4" />,
  },
  {
    value: "sakit",
    label: "Sakit",
    color: "text-orange-600",
    icon: <ExclamationTriangleIcon className="size-4" />,
  },
];

type StudentProfile = {
  nisn: string;
  school_place: string;
};

type Student = {
  id: number;
  name: string;
  email?: string;
  profile: StudentProfile | null;
};

type ClassDetail = {
  id: number;
  name: string;
  subject: string;
  school_place: string;
  total_students: number;
  is_active: boolean;
};
type RepostableExercise = {
  id: number;
  title: string;
  description: string;
  duration: number;
  deadline: string;
  totalQuestions: number;
  author: {
    teacher_id: number;
    teacher_name: string;
    class_id: number;
    class_name: string;
  };
};

export default function KelasGuruDetailPage() {
  const params = useParams();
  const router = useRouter();
  const classId = Number(params.id);

  // States

  const [repostExercises, setRepostExercises] = useState<RepostableExercise[]>(
    []
  );
  const [loadingRepostExercises, setLoadingRepostExercises] = useState(false);
  const [classInfo, setClassInfo] = useState<ClassDetail | null>(null);
  const [loadingClass, setLoadingClass] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("siswa");
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [attendanceData, setAttendanceData] = useState<{
    [studentId: number]: AttendanceStatus;
  }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [discussionsLoading, setDiscussionsLoading] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [showAddDiscussionModal, setShowAddDiscussionModal] = useState(false);
  const [posting, setPosting] = useState(false);
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({});
  const [replying, setReplying] = useState<number | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<{
    [key: number]: boolean;
  }>({});
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentSearchResults, setStudentSearchResults] = useState<
    RegisteredStudent[]
  >([]);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [showExerciseDetailModal, setShowExerciseDetailModal] = useState(false);
  const [showRepostExerciseModal, setShowRepostExerciseModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<number | null>(null);
  const [showEditExerciseModal, setShowEditExerciseModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [editExerciseData, setEditExerciseData] = useState({
    title: "",
    description: "",
    deadline: "",
  });
  const [newMaterial, setNewMaterial] = useState({
    title: "",
    description: "",
    content: "",
    type: "pdf" as "pdf" | "video",
    fileUrl: "",
    duration: "",
  });
  const [newExercise, setNewExercise] = useState({
    title: "",
    description: "",
    duration: 10,
    deadline: "",
  });
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [showSelectQuestionModal, setShowSelectQuestionModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [bankQuestions, setBankQuestions] = useState<Question[]>([]);
  const [loadingBankQuestions, setLoadingBankQuestions] = useState(false);
  const [showEditMaterialModal, setShowEditMaterialModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [showMaterialDetailModal, setShowMaterialDetailModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [loadingMaterialDetail, setLoadingMaterialDetail] = useState(false);
  const [showDeleteMaterialModal, setShowDeleteMaterialModal] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<number | null>(null);
  const [editMaterialData, setEditMaterialData] = useState({
    title: "",
    description: "",
    type: "pdf" as "pdf" | "video",
    duration: "",
    fileUrl: "",
  });
  const [urlError, setUrlError] = useState("");
  const [editUrlError, setEditUrlError] = useState("");

  // Helper Functions
  const validateMaterialUrl = (url: string, type: "pdf" | "video"): string => {
    if (!url.trim()) return "";
    
    if (type === "video") {
      // Validasi YouTube URL
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/).+/;
      if (!youtubeRegex.test(url)) {
        return "URL harus berupa link YouTube yang valid";
      }
    } else if (type === "pdf") {
      // Validasi PDF/PPT URL
      const docRegex = /\.(pdf|ppt|pptx)(\?.*)?$/i;
      if (!docRegex.test(url) && !url.includes('drive.google.com') && !url.includes('docs.google.com')) {
        return "URL harus berupa link file PDF atau PowerPoint (.pdf, .ppt, .pptx)";
      }
    }
    
    return "";
  };

  const normalizeQuestion = (q: any) => ({
    id: String(q.id),
    question: q.question,
    options: q.options,
    correctAnswer: q.correct_answer,
    difficulty: q.difficulty,
    subject: q.subject,
  });

  const normalizeYoutubeEmbed = (url: string) => {
    if (!url) return null;
    let videoId =
      url.split("v=")[1]?.split("&")[0] ||
      url.split("youtu.be/")[1]?.split("?")[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const toggleReplies = (discussionId: number) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [discussionId]: !prev[discussionId],
    }));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "mudah":
        return "bg-green-100 text-green-700";
      case "sedang":
        return "bg-yellow-100 text-yellow-700";
      case "sulit":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDeadline = (dateStr: string) => {
    if (!dateStr) return "-";
    // Handle both date-only (YYYY-MM-DD) and datetime formats
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Fetch Functions
  const fetchExerciseQuestions = async (exerciseId: number) => {
    const token = localStorage.getItem("access_token");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/classedu-exercises/${exerciseId}/questions`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) throw new Error("Gagal fetch soal latihan");

    const json = await res.json();
    return (json.data || []).map(normalizeQuestion);
  };
  const fetchRepostableExercises = async () => {
    try {
      setLoadingRepostExercises(true);
      const token = localStorage.getItem("access_token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/exercises/repostable`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Gagal fetch latihan repost");

      const json = await res.json();
      setRepostExercises(json.data || []);
    } catch (e) {
      console.error("Fetch repostable exercises gagal", e);
      setRepostExercises([]);
    } finally {
      setLoadingRepostExercises(false);
    }
  };
  const fetchClassDetail = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/classes/${classId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Gagal fetch kelas");
      const json = await res.json();
      setClassInfo(json.data);
    } catch (e) {
      console.error("Gagal fetch detail kelas", e);
      setClassInfo(null);
    } finally {
      setLoadingClass(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/classes/${classId}/students`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const json = await res.json();
      setStudents(json.data || []);
    } catch (e) {
      console.error("Gagal fetch siswa", e);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchAttendance = async (date: string) => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/classes/${classId}/attendance?date=${date}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Gagal fetch absensi");
      const json = await res.json();
      const newData: { [studentId: number]: AttendanceStatus } = {};
      Object.values(json.data || {}).forEach((item: any) => {
        if (item.student_id && item.status) {
          newData[item.student_id] = item.status;
        }
      });
      setAttendanceData(newData);
    } catch (e) {
      console.error("Fetch absensi gagal", e);
      setAttendanceData({});
    }
  };

  const fetchMaterials = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/classes/${classId}/materials`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Gagal fetch materi");
      const json = await res.json();
      setMaterials(json.data || []);
    } catch (e) {
      console.error("Fetch materi gagal", e);
      setMaterials([]);
    }
  };

  const fetchMaterialDetail = async (materialId: number) => {
    setLoadingMaterialDetail(true);
    setShowMaterialDetailModal(true);
    try {
      const token = localStorage.getItem("access_token");
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/classes/materials/${materialId}`;
      
      console.log("[MATERIAL DETAIL] Fetching from:", url);
      
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log("[MATERIAL DETAIL] Response status:", res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("[MATERIAL DETAIL] Error response:", errorText);
        throw new Error("Gagal fetch detail materi");
      }
      
      const json = await res.json();
      console.log("[MATERIAL DETAIL] Response data:", json);
      
      // Normalize data - handle both snake_case and camelCase
      const materialData = json.data;
      const normalizedMaterial = {
        ...materialData,
        fileUrl: materialData.fileUrl || materialData.file_url || "",
      };
      
      console.log("[MATERIAL DETAIL] Normalized material:", normalizedMaterial);
      setSelectedMaterial(normalizedMaterial);
    } catch (e) {
      console.error("[MATERIAL DETAIL] Fetch error:", e);
      toast.error("Gagal memuat detail materi");
      setShowMaterialDetailModal(false);
    } finally {
      setLoadingMaterialDetail(false);
    }
  };

  const fetchExercises = async () => {
    try {
      setLoadingExercises(true);
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/classes/${classId}/exercises`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Gagal fetch latihan");
      const json = await res.json();
      setExercises(json.data || []);
    } catch (e) {
      console.error("Fetch latihan gagal", e);
      setExercises([]);
    } finally {
      setLoadingExercises(false);
    }
  };

  const fetchDiscussions = async () => {
    try {
      setDiscussionsLoading(true);
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/discussions?class_id=${classId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Gagal fetch diskusi");
      const json = await res.json();
      setDiscussions(json.data || []);
    } catch (err) {
      console.error(err);
      setDiscussions([]);
    } finally {
      setDiscussionsLoading(false);
    }
  };

  const fetchBankQuestions = async () => {
    try {
      setLoadingBankQuestions(true);
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/classedu-questions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const json = await res.json();
      const mapped = (json.data || []).map((item: any) => ({
        id: String(item.id),
        question: item.question,
        options: item.options,
        correctAnswer: item.correct_answer,
        difficulty: item.difficulty,
        subject: item.subject,
      }));
      setBankQuestions(mapped);
    } catch (e) {
      console.error("Gagal fetch bank soal", e);
      setBankQuestions([]);
    } finally {
      setLoadingBankQuestions(false);
    }
  };

  // Handler Functions
  const handleAddDiscussion = async () => {
    if (!newDiscussion.trim() && selectedImages.length === 0 && !videoUrl)
      return;
    try {
      setPosting(true);
      const token = localStorage.getItem("access_token");
      const formData = new FormData();
      formData.append("class_id", String(classId));
      formData.append("content", newDiscussion);
      if (videoUrl) {
        formData.append("youtube_url", videoUrl);
      }
      if (selectedImages.length > 0) {
        formData.append("image", selectedImages[0]);
      }
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/discussions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("API Error:", errorData);
        throw new Error(errorData.message || "Gagal mengirim diskusi");
      }
      const json = await res.json();
      setDiscussions((prev) => [json.data, ...prev]);
      setNewDiscussion("");
      setSelectedImages([]);
      setImagePreviews([]);
      setVideoUrl("");
      setShowAddDiscussionModal(false);
    } catch (err: any) {
      console.error("Error detail:", err);
      alert(err.message || "Gagal mengirim diskusi");
    } finally {
      setPosting(false);
    }
  };

  const handleSendReply = async (discussionId: number) => {
    if (!replyText[discussionId]?.trim()) return;
    try {
      setReplying(discussionId);
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/discussions/${discussionId}/reply`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: replyText[discussionId],
          }),
        }
      );
      if (!res.ok) throw new Error("Gagal kirim balasan");
      const json = await res.json();
      setDiscussions((prev) =>
        prev.map((d) =>
          d.id === discussionId
            ? { ...d, replies: [...(d.replies || []), json.data] }
            : d
        )
      );
      setReplyText((prev) => ({ ...prev, [discussionId]: "" }));
    } catch (err) {
      alert("Gagal mengirim balasan");
    } finally {
      setReplying(null);
    }
  };

  const handleRepostExercise = async (exerciseId: number) => {
    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/classes/${classId}/exercises/${exerciseId}/repost`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}), // deadline optional
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Gagal repost latihan");
      }

      // refresh latihan kelas
      await fetchExercises();

      setShowRepostExerciseModal(false);
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Gagal repost latihan");
    }
  };

  const handleEditMaterial = (material: Material) => {
    setEditingMaterial(material);
    setEditMaterialData({
      title: material.title,
      description: material.description,
      type: material.type,
      duration: material.duration,
      fileUrl: material.fileUrl || material.file_url || "",
    });
    setShowEditMaterialModal(true);
  };

  const handleSaveEditMaterial = async () => {
    if (
      !editingMaterial ||
      !editMaterialData.title ||
      !editMaterialData.description
    )
      return;
    
    // Validate URL
    const error = validateMaterialUrl(editMaterialData.fileUrl, editMaterialData.type);
    if (error) {
      setEditUrlError(error);
      toast.error(error);
      return;
    }
    
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/classes/materials/${editingMaterial.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: editMaterialData.title,
            description: editMaterialData.description,
            type: editMaterialData.type,
            duration: editMaterialData.duration,
            file_url: editMaterialData.fileUrl,
          }),
        }
      );
      
      if (!res.ok) throw new Error("Gagal update materi");
      
      const json = await res.json();
      
      // Update local state
      setMaterials((prev) =>
        prev.map((m) =>
          m.id === editingMaterial.id ? json.data : m
        )
      );
      
      toast.success("Materi berhasil diperbarui");
      setShowEditMaterialModal(false);
      setEditingMaterial(null);
      setEditUrlError("");
    } catch (e) {
      console.error("Gagal update materi", e);
      toast.error("Gagal memperbarui materi");
    }
  };



  const handleStudentSearch = async (query: string) => {
    setStudentSearch(query);
    if (query.length < 2) {
      setStudentSearchResults([]);
      return;
    }
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/classes/students/search?q=${query}&class_id=${classId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const json = await res.json();
      setStudentSearchResults(json.data || []);
    } catch (e) {
      console.error("Search siswa gagal", e);
    }
  };

  const addStudentToClass = async (student: Student) => {
    try {
      const token = localStorage.getItem("access_token");
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/classes/${classId}/students`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            student_id: student.id,
          }),
        }
      );
      setStudents((prev) => [...prev, student]);
      setStudentSearch("");
      setStudentSearchResults([]);
    } catch (e) {
      console.error("Gagal menambah siswa", e);
    }
  };

  const removeStudentFromClass = async (studentId: number) => {
    if (!confirm("Hapus siswa dari kelas?")) return;
    try {
      const token = localStorage.getItem("access_token");
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/classes/${classId}/students/${studentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
    } catch (e) {
      console.error("Gagal hapus siswa", e);
    }
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    setShowDatePicker(false);
    setSaveSuccess(false);
    fetchAttendance(newDate);
  };

  const handleStatusChange = (studentId: number, status: AttendanceStatus) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: status,
    }));
    setSaveSuccess(false);
  };

  const handleSaveAttendance = async () => {
    try {
      setIsSaving(true);
      setSaveSuccess(false);
      const token = localStorage.getItem("access_token");
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/classes/${classId}/attendance`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            date: selectedDate,
            records: attendanceData,
          }),
        }
      );
      setSaveSuccess(true);
    } catch (e) {
      console.error("Gagal simpan presensi", e);
      alert("Gagal menyimpan presensi");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddMaterial = async () => {
    if (!newMaterial.title || !newMaterial.description) return;
    
    // Validate URL
    const error = validateMaterialUrl(newMaterial.fileUrl, newMaterial.type);
    if (error) {
      setUrlError(error);
      toast.error(error);
      return;
    }
    
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/classes/${classId}/materials`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: newMaterial.title,
            description: newMaterial.description,
            type: newMaterial.type,
            file_url: newMaterial.fileUrl,
            duration: newMaterial.duration,
          }),
        }
      );
      if (!res.ok) throw new Error("Gagal simpan materi");
      await fetchMaterials();
      toast.success("Materi berhasil ditambahkan");
      setShowAddMaterialModal(false);
      setNewMaterial({
        title: "",
        description: "",
        content: "",
        type: "pdf",
        fileUrl: "",
        duration: "",
      });
      setUrlError("");
    } catch (e) {
      console.error(e);
      toast.error("Gagal menyimpan materi");
    }
  };

  const handleDeleteMaterial = (id: number) => {
    setMaterialToDelete(id);
    setShowDeleteMaterialModal(true);
  };

  const confirmDeleteMaterial = async () => {
    if (!materialToDelete) return;
    
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/classes/materials/${materialToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (!res.ok) throw new Error("Gagal hapus materi");
      
      // Update local state
      setMaterials((prev) => prev.filter((m) => m.id !== materialToDelete));
      
      toast.success("Materi berhasil dihapus");
      setShowDeleteMaterialModal(false);
      setMaterialToDelete(null);
      
      // Close detail modal if it's open
      if (showMaterialDetailModal && selectedMaterial?.id === materialToDelete) {
        setShowMaterialDetailModal(false);
        setSelectedMaterial(null);
      }
    } catch (e) {
      console.error("Gagal hapus materi", e);
      toast.error("Gagal menghapus materi");
    }
  };

  const handleAddExercise = async () => {
    if (!newExercise.title || !newExercise.description || !newExercise.deadline)
      return;
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/classes/${classId}/exercises`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: newExercise.title,
            description: newExercise.description,
            duration: newExercise.duration,
            deadline: newExercise.deadline,
          }),
        }
      );
      if (!res.ok) throw new Error("Gagal menambah latihan");
      setShowAddExerciseModal(false);
      setNewExercise({
        title: "",
        description: "",
        duration: 10,
        deadline: "",
      });
      await fetchExercises();
    } catch (e) {
      console.error(e);
      alert("Gagal menambahkan latihan");
    }
  };

  const handleDeleteExercise = async (exerciseId: number) => {
    setExerciseToDelete(exerciseId);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteExercise = async () => {
    if (!exerciseToDelete) return;
    
    try {
      const token = localStorage.getItem("access_token");
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/classes/${classId}/exercises/${exerciseToDelete}`;
      
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!res.ok) {
        throw new Error("Gagal hapus latihan");
      }
      
      // Update state lokal tanpa reload
      setExercises((prev) => prev.filter((ex) => ex.id !== exerciseToDelete));
      toast.success("Latihan berhasil dihapus");
      setShowDeleteConfirmModal(false);
      setExerciseToDelete(null);
    } catch (e) {
      console.error("Gagal hapus latihan", e);
      toast.error("Gagal menghapus latihan");
    }
  };

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setEditExerciseData({
      title: exercise.title,
      description: exercise.description || "",
      deadline: exercise.deadline || "",
    });
    setShowEditExerciseModal(true);
  };

  const handleUpdateExercise = async () => {
    if (!editingExercise) return;
    
    if (!editExerciseData.title.trim()) {
      toast.error("Judul latihan tidak boleh kosong");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/classes/${classId}/exercises/${editingExercise.id}`;
      
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editExerciseData.title,
          description: editExerciseData.description,
          deadline: editExerciseData.deadline,
        }),
      });
      
      if (!res.ok) {
        throw new Error("Gagal update latihan");
      }

      const json = await res.json();
      
      // Update state lokal
      setExercises((prev) =>
        prev.map((ex) => (ex.id === editingExercise.id ? json.data : ex))
      );
      
      toast.success("Latihan berhasil diperbarui");
      setShowEditExerciseModal(false);
      setEditingExercise(null);
      setEditExerciseData({ title: "", description: "", deadline: "" });
    } catch (e) {
      console.error("Gagal update latihan", e);
      toast.error("Gagal memperbarui latihan");
    }
  };

  const handleOpenExerciseDetail = async (exercise: Exercise) => {
    // Open modal first for better UX
    setSelectedExercise({
      ...exercise,
      questions: [],
    });
    setSelectedQuestions([]);
    setShowExerciseDetailModal(true);
    
    try {
      // Try to fetch questions for this exercise from API
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/classedu-exercises/${exercise.id}/questions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (res.ok) {
        const json = await res.json();
        const questions = (json.data || []).map(normalizeQuestion);
        
        setSelectedExercise({
          ...exercise,
          questions: questions,
        });
        setSelectedQuestions(questions.map((q: any) => String(q.id)));
      } else {
        console.log("API returned error, using empty questions");
      }
    } catch (e) {
      console.error("Gagal fetch soal latihan", e);
      // Modal already open with empty questions, no need to do anything
    }
  };

  const handleToggleQuestion = (questionId: string) => {
    const question = bankQuestions.find((q) => q.id === questionId);
    if (!question || !selectedExercise) return;

    // Tambah ke selectedQuestions (ID)
    setSelectedQuestions((prev) =>
      prev.includes(questionId) ? prev : [...prev, questionId]
    );

    // Tambah ke daftar soal latihan (UI)
    setSelectedExercise((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        questions: [...(prev.questions || []), question],
      };
    });
  };

  const handleRemoveQuestion = async (questionId: string) => {
    if (!selectedExercise) return;  
    
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/classedu-exercises/${selectedExercise.id}/questions/${questionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (!res.ok) throw new Error("Gagal hapus soal");
      
      // Update local state
      setSelectedQuestions(selectedQuestions.filter((id) => id !== questionId));
      setSelectedExercise({
        ...selectedExercise,
        questions: selectedExercise.questions?.filter((q) => String(q.id) !== questionId) || [],
      });
      
      toast.success("Soal berhasil dihapus");
    } catch (e) {
      console.error("Gagal hapus soal", e);
      toast.error("Gagal menghapus soal");
    }
  };

  const handleSaveExerciseQuestions = async () => {
    if (!selectedExercise) return;
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/classedu-exercises/${selectedExercise.id}/questions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            question_ids: selectedQuestions.map(Number),
          }),
        }
      );
      if (!res.ok) throw new Error("Gagal menyimpan soal latihan");
      
      toast.success("Soal berhasil disimpan");
      setShowExerciseDetailModal(false);
      setSelectedExercise(null);
      setSelectedQuestions([]);
      await fetchExercises();
    } catch (e) {
      console.error(e);
      toast.error("Gagal menyimpan soal ke latihan");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  // UseEffects
  useEffect(() => {
    if (!classId) return;
    fetchClassDetail();
    fetchStudents();
  }, [classId]);

  useEffect(() => {
    if (activeTab === "presensi") {
      fetchAttendance(selectedDate);
    }
  }, [activeTab, selectedDate]);

  useEffect(() => {
    if (activeTab === "materi") {
      fetchMaterials();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "latihan") {
      fetchExercises();
    }
  }, [activeTab, classId]);

  useEffect(() => {
    if (activeTab === "diskusi") {
      fetchDiscussions();
    }
  }, [activeTab, classId]);

  useEffect(() => {
    if (showSelectQuestionModal) {
      fetchBankQuestions();
    }
  }, [showSelectQuestionModal]);

  // Memoized values
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

  const filteredBankQuestions = bankQuestions.filter((q) =>
    q.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exerciseQuestions = selectedExercise?.questions || [];

  const availableQuestions = filteredBankQuestions.filter(
    (q) => !selectedQuestions.includes(q.id)
  );

  // InitialsAvatar Component
  const InitialsAvatar = ({
    name,
    size = "md",
    bgColor = "teal",
  }: {
    name: string;
    size?: "sm" | "md" | "lg";
    bgColor?: "teal" | "slate";
  }) => {
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    const sizeClasses = {
      sm: "size-7 text-[10px]",
      md: "size-8 text-xs",
      lg: "size-10 text-sm",
    };
    const bgClasses = {
      teal: "bg-teal-600",
      slate: "bg-slate-500",
    };
    return (
      <div
        className={clsx(
          "rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0",
          sizeClasses[size],
          bgClasses[bgColor]
        )}
      >
        {initials}
      </div>
    );
  };

  if (loadingClass) {
    return (
      <div className="w-full max-w-[480px] mx-auto min-h-screen flex items-center justify-center">
        <p className="text-slate-400">Memuat kelas...</p>
      </div>
    );
  }

  if (!classInfo) {
    return (
      <div className="w-full max-w-[480px] mx-auto min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Kelas tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[480px] mx-auto bg-white min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white p-4 pt-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => router.back()} className="p-1">
            <ChevronLeftIcon className="size-6 text-white" />
          </button>
          <div>
            <h1 className="text-lg font-semibold">{classInfo.name}</h1>
            <p className="text-xs text-white/80">{classInfo.school_place}</p>
          </div>
        </div>
        <div className="bg-white/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserGroupIcon className="size-5" />
              <span className="text-sm">
                {classInfo.total_students ?? students.length} Siswa
              </span>
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
          { id: "diskusi" as TabType, label: "Diskusi" },
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
              <h3 className="font-medium text-slate-700">
                Daftar Siswa ({students.length})
              </h3>
              <button
                onClick={() => setShowAddStudentModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white text-xs font-medium rounded-lg hover:bg-teal-700 transition"
              >
                <PlusIcon className="size-4" />
                Tambah Siswa
              </button>
            </div>
            {loadingStudents ? (
              <p className="text-sm text-slate-400">Memuat siswa...</p>
            ) : students.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed">
                <UserGroupIcon className="size-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Belum ada siswa</p>
              </div>
            ) : (
              students.map((student, index) => (
                <div
                  key={student.id}
                  className="bg-white border rounded-xl p-3 flex justify-between"
                >
                  <div className="flex gap-3">
                    <span className="w-8 h-8 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-xs text-slate-400">
                        NISN: {student.profile?.nisn ?? "-"}
                      </p>
                      <p className="text-xs text-slate-400">
                        Nama Sekolah: {student.profile?.school_place ?? "-"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeStudentFromClass(student.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <TrashIcon className="size-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
        {/* Presensi Tab */}
        {activeTab === "presensi" && (
          <div className="space-y-4">
            <div className="mb-4">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="w-full flex items-center justify-between bg-slate-100 rounded-lg px-4 py-3 text-left"
              >
                <div className="flex items-center gap-2">
                  <CalendarDaysIcon className="size-5 text-teal-600" />
                  <div>
                    <p className="text-xs text-slate-500">Tanggal</p>
                    <p className="font-medium text-slate-700">
                      {formatDate(selectedDate)}
                    </p>
                  </div>
                </div>
                <ChevronDownIcon
                  className={clsx(
                    "size-5 text-slate-400 transition",
                    showDatePicker && "rotate-180"
                  )}
                />
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
                <span className="text-xs text-slate-500">
                  {stats.filled}/{stats.total} terisi
                </span>
              </div>
              <div className="max-h-[400px] overflow-y-auto space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                {students.map((student, index) => (
                  <div
                    key={student.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-7 h-7 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-slate-700">
                          {student.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          NISN: {student.profile?.nisn ?? "-"}
                        </p>
                        <p className="text-xs text-slate-400">
                          Nama Sekolah: {student.profile?.school_place ?? "-"}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {STATUS_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() =>
                            handleStatusChange(student.id, option.value)
                          }
                          className={clsx(
                            "flex flex-col items-center gap-1 py-2 px-1 rounded-lg border-2 transition text-xs",
                            attendanceData[student.id] === option.value
                              ? option.value === "hadir"
                                ? "border-green-500 bg-green-50"
                                : option.value === "alpa"
                                ? "border-red-500 bg-red-50"
                                : option.value === "izin"
                                ? "border-blue-500 bg-blue-50"
                                : "border-orange-500 bg-orange-50"
                              : "border-slate-200 hover:border-slate-300"
                          )}
                        >
                          <span className={option.color}>{option.icon}</span>
                          <span
                            className={clsx(
                              "font-medium",
                              attendanceData[student.id] === option.value
                                ? option.color
                                : "text-slate-500"
                            )}
                          >
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
              <h4 className="font-medium text-slate-700 mb-3">
                Rekap Kehadiran
              </h4>
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-green-100 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {stats.hadir}
                  </p>
                  <p className="text-[10px] text-green-700">Hadir</p>
                </div>
                <div className="bg-red-100 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {stats.tidakHadir}
                  </p>
                  <p className="text-[10px] text-red-700">Tidak Hadir</p>
                </div>
                <div className="bg-blue-100 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.izin}
                  </p>
                  <p className="text-[10px] text-blue-700">Izin</p>
                </div>
                <div className="bg-orange-100 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.sakit}
                  </p>
                  <p className="text-[10px] text-orange-700">Sakit</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 text-center mt-3">
                {stats.filled} dari {stats.total} siswa tercatat
              </p>
            </div>
          </div>
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
                Belum ada materi. Klik tombol Tambah untuk menambahkan materi
                baru.
              </div>
            ) : (
              <div className="space-y-3">
                {materials.map((material) => (
                  <div
                    key={material.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => fetchMaterialDetail(material.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={clsx(
                          "p-3 rounded-xl",
                          material.type === "pdf" ? "bg-red-100" : "bg-blue-100"
                        )}
                      >
                        {material.type === "pdf" ? (
                          <DocumentTextIcon className="size-6 text-red-600" />
                        ) : (
                          <PlayIcon className="size-6 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-700">
                          {material.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {material.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <ClockIcon className="size-3" />
                            {material.duration}
                          </span>
                          <span
                            className={clsx(
                              "px-2 py-0.5 rounded-full text-[10px] font-medium uppercase",
                              material.type === "pdf"
                                ? "bg-red-100 text-red-600"
                                : "bg-blue-100 text-blue-600"
                            )}
                          >
                            {material.type}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleEditMaterial(material)}
                          className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition"
                        >
                          <PencilIcon className="size-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMaterial(material.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <TrashIcon className="size-5" />
                        </button>
                      </div>
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
              <h3 className="font-medium text-slate-700">
                Daftar Latihan Soal
              </h3>
              <div className="flex items-center gap-2">
                <Link
                  href="/bank-soal"
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition"
                >
                  <svg
                    className="size-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  Bank Soal
                </Link>
                <button
                  onClick={() => {
                    setShowRepostExerciseModal(true);
                    fetchRepostableExercises();
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition"
                >
                  <svg
                    className="size-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Repost
                </button>
                <button
                  onClick={() => setShowAddExerciseModal(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white text-xs font-medium rounded-lg hover:bg-teal-700 transition"
                >
                  <PlusIcon className="size-4" />
                  Tambah
                </button>
              </div>
            </div>
            {loadingExercises ? (
              <p className="text-sm text-slate-400">Memuat latihan...</p>
            ) : exercises.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                Belum ada latihan soal. Klik tombol Tambah untuk menambahkan
                latihan baru.
              </div>
            ) : (
              <div className="space-y-3">
                {exercises.map((exercise) => (
                  <button
                    key={exercise.id}
                    onClick={() => handleOpenExerciseDetail(exercise)}
                    className={clsx(
                      "w-full bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition text-left",
                      exercise.isCompleted
                        ? "border-green-300 bg-green-50/50"
                        : "border-slate-200"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={clsx(
                          "p-3 rounded-xl",
                          exercise.isCompleted
                            ? "bg-green-100"
                            : "bg-orange-100"
                        )}
                      >
                        {exercise.isCompleted ? (
                          <CheckCircleSolidIcon className="size-6 text-green-600" />
                        ) : (
                          <ClipboardDocumentListIcon className="size-6 text-orange-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-700">
                            {exercise.title}
                          </h4>

                          {exercise.is_repost && (
                            <span
                              className="px-2 py-0.5 text-[10px] font-semibold rounded-full 
                     bg-purple-100 text-purple-700 border border-purple-200"
                            >
                              Repost
                            </span>
                          )}
                        </div>
                        {exercise.is_repost && exercise.reposted_from && (
                          <p className="text-[10px] text-purple-600 mt-1">
                            Repost dari{" "}
                            <strong>
                              {exercise.reposted_from.teacher.name}
                            </strong>{" "}
                            • {exercise.reposted_from.class.name}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                          <span>{exercise.totalQuestions} soal</span>
                          <span>•</span>
                          <span>{exercise.duration} menit</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Deadline: {formatDeadline(exercise.deadline)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditExercise(exercise);
                          }}
                          className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition"
                        >
                          <PencilIcon className="size-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteExercise(exercise.id);
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <TrashIcon className="size-5" />
                        </button>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Diskusi Tab */}
        {activeTab === "diskusi" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-700">
                Diskusi Kelas
              </h2>
              <button
                onClick={() => setShowAddDiscussionModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white text-xs font-medium rounded-lg hover:bg-teal-700 transition"
              >
                <PlusIcon className="w-4 h-4" />
                Baru
              </button>
            </div>
            <div className="space-y-4">
              {discussionsLoading && (
                <p className="text-sm text-slate-400">Memuat diskusi...</p>
              )}
              {!discussionsLoading && discussions.length === 0 && (
                <p className="text-sm text-slate-400">Belum ada diskusi</p>
              )}
              {discussions.map((discussion) => (
                <div
                  key={discussion.id}
                  className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
                >
                  <div className="p-4 pb-3">
                    <div className="flex items-center gap-3">
                      <InitialsAvatar
                        name={discussion.user.name}
                        size="lg"
                        bgColor="teal"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-700 text-sm">
                            {discussion.user.name}
                          </p>
                          <span
                            className={clsx(
                              "px-2 py-0.5 rounded-full text-xs font-medium",
                              discussion.user.role_id === 2 // Asumsi role_id 2 untuk guru; sesuaikan dengan data backend Anda
                                ? "bg-blue-100 text-blue-700"
                                : "bg-green-100 text-green-700"
                            )}
                          >
                            {discussion.user.role_id === 2 ? "Guru" : "Siswa"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          {new Date(discussion.created_at).toLocaleString(
                            "id-ID"
                          )}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                      {discussion.content}
                    </p>
                  </div>
                  {discussion.image_url && (
                    <div className="w-full">
                      <img
                        src={discussion.image_url}
                        alt="Diskusi"
                        className="w-full max-h-64 object-cover cursor-pointer"
                        onClick={() =>
                          window.open(discussion.image_url, "_blank")
                        }
                      />
                    </div>
                  )}
                  {normalizeYoutubeEmbed(discussion.youtube_url) && (
                    <div className="relative w-full pt-[56.25%] bg-black">
                      <iframe
                        src={normalizeYoutubeEmbed(discussion.youtube_url)!}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                  <div className="px-4 py-3 bg-white border-t border-slate-100">
                    <button
                      onClick={() => toggleReplies(discussion.id)}
                      className="flex items-center gap-1.5 text-xs font-medium text-teal-600 hover:text-teal-700"
                    >
                      <ChatBubbleLeftIcon className="w-4 h-4" />
                      {expandedReplies[discussion.id]
                        ? "Tutup balasan"
                        : discussion.replies?.length > 0
                        ? `Lihat ${discussion.replies.length} balasan`
                        : "Tulis balasan"}
                    </button>
                  </div>
                  {expandedReplies[discussion.id] && (
                    <div className="bg-slate-50 border-t border-slate-100 px-4 py-3 space-y-3">
                      {discussion.replies?.length > 0 ? (
                        discussion.replies.map((reply: any) => (
                          <div key={reply.id} className="flex gap-3">
                            <InitialsAvatar
                              name={reply.user.name}
                              size="sm"
                              bgColor="slate"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-medium text-slate-700">
                                  {reply.user.name}
                                </p>
                                <span
                                  className={clsx(
                                    "px-2 py-0.5 rounded-full text-[10px] font-medium",
                                    reply.user.role_id === 2
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-green-100 text-green-700"
                                  )}
                                >
                                  {reply.user.role_id === 2 ? "Guru" : "Siswa"}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600">
                                {reply.content}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400">
                          Belum ada balasan
                        </p>
                      )}
                      <div className="flex gap-2 pt-2">
                        <input
                          type="text"
                          placeholder="Tulis balasan..."
                          value={replyText[discussion.id] || ""}
                          onChange={(e) =>
                            setReplyText((prev) => ({
                              ...prev,
                              [discussion.id]: e.target.value,
                            }))
                          }
                          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-teal-500"
                        />
                        <button
                          onClick={() => handleSendReply(discussion.id)}
                          disabled={replying === discussion.id}
                          className="px-4 py-2 bg-teal-600 text-white text-xs rounded-lg disabled:opacity-50"
                        >
                          Kirim
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
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
              saveSuccess
                ? "bg-green-500"
                : isSaving
                ? "bg-teal-400"
                : "bg-teal-600 hover:bg-teal-700"
            )}
          >
            {isSaving ? (
              <>
                <svg
                  className="animate-spin size-5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
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
      {/* Modals */}
      {showAddMaterialModal && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowAddMaterialModal(false)}
          />
          <div className="relative w-full max-w-[480px] bg-white rounded-t-2xl p-4 pb-6 max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-700">
                Tambah Materi
              </h3>
              <button
                onClick={() => setShowAddMaterialModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full"
              >
                <XMarkIcon className="size-6 text-slate-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Judul Materi *
                </label>
                <input
                  type="text"
                  value={newMaterial.title}
                  onChange={(e) =>
                    setNewMaterial({ ...newMaterial, title: e.target.value })
                  }
                  placeholder="Contoh: Pengenalan Al-Quran"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Deskripsi *
                </label>
                <textarea
                  value={newMaterial.description}
                  onChange={(e) =>
                    setNewMaterial({
                      ...newMaterial,
                      description: e.target.value,
                    })
                  }
                  placeholder="Deskripsi singkat tentang materi ini..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tipe Materi
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      setNewMaterial({ ...newMaterial, type: "pdf" })
                    }
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
                    onClick={() =>
                      setNewMaterial({ ...newMaterial, type: "video" })
                    }
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
                  {newMaterial.type === "pdf"
                    ? "URL File PDF"
                    : "URL Video (YouTube)"}
                </label>
                <input
                  type="text"
                  value={newMaterial.fileUrl}
                  onChange={(e) =>
                    setNewMaterial({ ...newMaterial, fileUrl: e.target.value })
                  }
                  placeholder={
                    newMaterial.type === "pdf"
                      ? "/materials/filename.pdf"
                      : "https://www.youtube.com/watch?v=..."
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Durasi
                </label>
                <input
                  type="text"
                  value={newMaterial.duration}
                  onChange={(e) =>
                    setNewMaterial({ ...newMaterial, duration: e.target.value })
                  }
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
      {showAddExerciseModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowAddExerciseModal(false)}
          />
          <div className="relative w-full max-w-[480px] bg-white rounded-2xl p-4 pb-6 max-h-[90vh] overflow-auto mx-4">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white pb-2 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-700">
                Tambah Latihan Soal
              </h3>
              <button
                onClick={() => setShowAddExerciseModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full"
              >
                <XMarkIcon className="size-6 text-slate-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Judul Latihan *
                </label>
                <input
                  type="text"
                  value={newExercise.title}
                  onChange={(e) =>
                    setNewExercise({ ...newExercise, title: e.target.value })
                  }
                  placeholder="Contoh: Latihan Tajwid Dasar"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Deskripsi *
                </label>
                <textarea
                  value={newExercise.description}
                  onChange={(e) =>
                    setNewExercise({
                      ...newExercise,
                      description: e.target.value,
                    })
                  }
                  placeholder="Deskripsi singkat tentang latihan ini..."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Durasi (menit)
                  </label>
                  <input
                    type="number"
                    value={newExercise.duration}
                    onChange={(e) =>
                      setNewExercise({
                        ...newExercise,
                        duration: parseInt(e.target.value) || 10,
                      })
                    }
                    min={1}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Deadline *
                  </label>
                  <input
                    type="date"
                    value={newExercise.deadline}
                    onChange={(e) =>
                      setNewExercise({
                        ...newExercise,
                        deadline: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>
              <button
                onClick={handleAddExercise}
                disabled={
                  !newExercise.title ||
                  !newExercise.description ||
                  !newExercise.deadline
                }
                className="w-full py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Simpan Latihan
              </button>
            </div>
          </div>
        </div>
      )}
      {showExerciseDetailModal && selectedExercise && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setShowExerciseDetailModal(false);
              setSelectedExercise(null);
              setSearchQuery("");
            }}
          />
          <div className="relative w-full max-w-[480px] bg-white rounded-2xl max-h-[90vh] overflow-hidden flex flex-col mx-4">
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white p-4 pt-6">
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={() => {
                    setShowExerciseDetailModal(false);
                    setSelectedExercise(null);
                    setSearchQuery("");
                  }}
                  className="p-1"
                >
                  <ChevronLeftIcon className="size-6" />
                </button>
                <div className="flex-1">
                  <h1 className="text-lg font-semibold">
                    {selectedExercise.title}
                  </h1>
                  <p className="text-xs text-teal-100">
                    {selectedExercise.description}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/20 rounded-lg p-2 text-center">
                  <p className="text-xs text-teal-100">Soal</p>
                  <p className="text-lg font-bold">
                    {selectedQuestions.length}
                  </p>
                </div>
                <div className="bg-white/20 rounded-lg p-2 text-center">
                  <p className="text-xs text-teal-100">Durasi</p>
                  <p className="text-lg font-bold">
                    {selectedExercise.duration} min
                  </p>
                </div>
                <div className="bg-white/20 rounded-lg p-2 text-center">
                  <p className="text-xs text-teal-100">Deadline</p>
                  <p className="text-[10px] font-bold">
                    {selectedExercise.deadline}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white border-b border-slate-200">
              <button
                onClick={() => setShowSelectQuestionModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition"
              >
                <PlusIcon className="size-5" />
                Pilih Soal dari Bank Soal
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <h2 className="text-lg font-semibold text-slate-700 mb-3">
                Daftar Soal ({selectedQuestions.length})
              </h2>
              {exerciseQuestions.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-200">
                  <ClipboardDocumentListIcon className="size-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">Belum ada soal</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Klik tombol di atas untuk memilih soal dari bank soal
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {exerciseQuestions.map((question, index) => (
                    <div
                      key={question.id}
                      className="bg-white rounded-xl p-4 shadow-sm border border-slate-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-teal-600 bg-teal-100 px-2 py-0.5 rounded-full">
                            #{index + 1}
                          </span>
                          <span
                            className={clsx(
                              "text-xs font-medium px-2 py-0.5 rounded-full",
                              getDifficultyColor(question.difficulty)
                            )}
                          >
                            {question.difficulty.charAt(0).toUpperCase() +
                              question.difficulty.slice(1)}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveQuestion(question.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                        >
                          <TrashIcon className="size-4" />
                        </button>
                      </div>
                      <p className="text-slate-800 font-medium mb-3">
                        {question.question}
                      </p>
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={clsx(
                              "flex items-center gap-2 p-2 rounded-lg text-sm",
                              question.correctAnswer === optIndex
                                ? "bg-green-50 border border-green-300"
                                : "bg-slate-50 border border-slate-200"
                            )}
                          >
                            <span
                              className={clsx(
                                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                                question.correctAnswer === optIndex
                                  ? "bg-green-500 text-white"
                                  : "bg-slate-300 text-slate-600"
                              )}
                            >
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            <span
                              className={
                                question.correctAnswer === optIndex
                                  ? "text-green-700 font-medium"
                                  : "text-slate-600"
                              }
                            >
                              {option}
                            </span>
                            {question.correctAnswer === optIndex && (
                              <CheckCircleSolidIcon className="size-5 text-green-500 ml-auto" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-200 bg-white">
              <button
                onClick={handleSaveExerciseQuestions}
                className="w-full px-4 py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
      {showSelectQuestionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[400] p-4">
          <div className="relative w-full max-w-[480px] bg-white rounded-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-lg font-semibold text-slate-700">
                  Pilih Soal
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedQuestions.length} soal dipilih
                </p>
              </div>
              <button
                onClick={() => {
                  setShowSelectQuestionModal(false);
                  setSearchQuery("");
                }}
                className="p-1 hover:bg-slate-100 rounded-full"
              >
                <XMarkIcon className="size-6 text-slate-500" />
              </button>
            </div>
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari soal..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {loadingBankQuestions ? (
                <p className="text-sm text-slate-400">Memuat soal...</p>
              ) : availableQuestions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500">
                    {searchQuery
                      ? "Tidak ada soal yang cocok"
                      : "Semua soal sudah dipilih"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableQuestions.map((question) => (
                    <button
                      key={question.id}
                      onClick={() => handleToggleQuestion(question.id)}
                      className="w-full text-left bg-slate-50 hover:bg-slate-100 rounded-xl p-3 border border-slate-200 transition"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <span
                          className={clsx(
                            "text-xs font-medium px-2 py-0.5 rounded-full",
                            getDifficultyColor(question.difficulty)
                          )}
                        >
                          {question.difficulty.charAt(0).toUpperCase() +
                            question.difficulty.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 font-medium">
                        {question.question}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {question.options.length} pilihan jawaban
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-200 bg-white">
              <button
                onClick={() => {
                  setShowSelectQuestionModal(false);
                  setSearchQuery("");
                }}
                className="w-full px-4 py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition"
              >
                Selesai ({selectedQuestions.length} soal dipilih)
              </button>
            </div>
          </div>
        </div>
      )}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setShowAddStudentModal(false);
              setStudentSearch("");
              setStudentSearchResults([]);
            }}
          />
          <div className="relative w-full max-w-[480px] bg-white rounded-2xl p-4 pb-6 max-h-[80vh] overflow-auto mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-700">
                Tambah Siswa
              </h3>
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
                  <p className="text-xs text-slate-400 mt-1">
                    Ketik minimal 2 karakter
                  </p>
                )}
              </div>
              {studentSearchResults.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">
                    Hasil Pencarian ({studentSearchResults.length})
                  </p>
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
                          <p className="font-medium text-slate-700">
                            {student.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            NISN: {student.profile?.nisn ?? "-"}
                          </p>
                          <p className="text-xs text-slate-400">
                            {student.profile?.school_place ??
                              "Sekolah tidak diketahui"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => addStudentToClass(student as any)}
                        className="px-3 py-1.5 bg-teal-600 text-white text-xs font-medium rounded-lg hover:bg-teal-700 transition"
                      >
                        Tambah
                      </button>
                    </div>
                  ))}
                </div>
              ) : studentSearch.length >= 2 ? (
                <div className="text-center py-6 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">
                    Tidak ada siswa dengan nama tersebut di{" "}
                    {classInfo?.school_place}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Pastikan siswa sudah mendaftar dan memilih sekolah yang sama
                  </p>
                </div>
              ) : null}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-xs text-blue-700">
                  <strong>Tips:</strong> Cari berdasarkan nama lengkap atau NISN
                  siswa. Siswa harus mendaftar terlebih dahulu melalui aplikasi.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {showEditMaterialModal && editingMaterial && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowEditMaterialModal(false)}
          />
          <div className="relative w-full max-w-[480px] bg-white rounded-2xl p-4 pb-6 max-h-[80vh] overflow-auto mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-700">
                Edit Materi
              </h3>
              <button
                onClick={() => setShowEditMaterialModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full"
              >
                <XMarkIcon className="size-6 text-slate-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Judul Materi *
                </label>
                <input
                  type="text"
                  value={editMaterialData.title}
                  onChange={(e) =>
                    setEditMaterialData({
                      ...editMaterialData,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Deskripsi *
                </label>
                <textarea
                  value={editMaterialData.description}
                  onChange={(e) =>
                    setEditMaterialData({
                      ...editMaterialData,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tipe Materi
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      setEditMaterialData({ ...editMaterialData, type: "pdf" })
                    }
                    className={clsx(
                      "flex-1 py-2 rounded-lg border-2 text-sm font-medium transition",
                      editMaterialData.type === "pdf"
                        ? "border-red-500 bg-red-50 text-red-600"
                        : "border-slate-200 text-slate-500"
                    )}
                  >
                    PDF
                  </button>
                  <button
                    onClick={() =>
                      setEditMaterialData({
                        ...editMaterialData,
                        type: "video",
                      })
                    }
                    className={clsx(
                      "flex-1 py-2 rounded-lg border-2 text-sm font-medium transition",
                      editMaterialData.type === "video"
                        ? "border-blue-500 bg-blue-50 text-blue-600"
                        : "border-slate-200 text-slate-500"
                    )}
                  >
                    Video
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Durasi
                </label>
                <input
                  type="text"
                  value={editMaterialData.duration}
                  onChange={(e) =>
                    setEditMaterialData({
                      ...editMaterialData,
                      duration: e.target.value,
                    })
                  }
                  placeholder="Contoh: 30 menit"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {editMaterialData.type === "pdf" ? "URL PDF/PowerPoint" : "URL Video YouTube"} *
                </label>
                <input
                  type="url"
                  value={editMaterialData.fileUrl}
                  onChange={(e) => {
                    setEditMaterialData({
                      ...editMaterialData,
                      fileUrl: e.target.value,
                    });
                    // Clear error when user types
                    if (editUrlError) {
                      const error = validateMaterialUrl(e.target.value, editMaterialData.type);
                      setEditUrlError(error);
                    }
                  }}
                  onBlur={(e) => {
                    // Validate on blur
                    const error = validateMaterialUrl(e.target.value, editMaterialData.type);
                    setEditUrlError(error);
                  }}
                  placeholder={
                    editMaterialData.type === "pdf"
                      ? "https://example.com/file.pdf"
                      : "https://www.youtube.com/watch?v=..."
                  }
                  className={clsx(
                    "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20",
                    editUrlError
                      ? "border-red-500 focus:border-red-500"
                      : "border-slate-300 focus:border-teal-500"
                  )}
                />
                {editUrlError ? (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <svg className="size-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {editUrlError}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 mt-1">
                    {editMaterialData.type === "pdf"
                      ? "Masukkan link PDF, PowerPoint, atau Google Drive yang dapat diakses"
                      : "Masukkan link video YouTube (youtube.com atau youtu.be)"}
                  </p>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowEditMaterialModal(false)}
                  className="flex-1 py-3 border border-slate-300 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveEditMaterial}
                  disabled={
                    !editMaterialData.title || !editMaterialData.description
                  }
                  className="flex-1 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition disabled:opacity-50"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRepostExerciseModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowRepostExerciseModal(false)}
          />
          <div className="relative w-full max-w-[480px] bg-white rounded-2xl p-4 pb-6 max-h-[85vh] overflow-auto mx-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-700">
                  Repost Latihan
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pilih latihan dari guru lain untuk direpost ke kelas Anda
                </p>
              </div>
              <button
                onClick={() => setShowRepostExerciseModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full"
              >
                <XMarkIcon className="size-6 text-slate-500" />
              </button>
            </div>
            <div className="space-y-3">
              {loadingRepostExercises ? (
                <p className="text-sm text-slate-400">Memuat latihan...</p>
              ) : repostExercises.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  Tidak ada latihan yang bisa direpost
                </div>
              ) : (
                repostExercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="border border-slate-200 rounded-xl p-4 hover:border-purple-300 hover:bg-purple-50/30 transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <ClipboardDocumentListIcon className="size-5 text-purple-600" />
                      </div>

                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-700 text-sm">
                          {exercise.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {exercise.description}
                        </p>

                        <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                          <span>{exercise.totalQuestions} soal</span>
                          <span>•</span>
                          <span>{exercise.duration} menit</span>
                        </div>

                        <div className="flex items-center gap-1 mt-2">
                          <div className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center">
                            <span className="text-[8px] font-bold text-slate-600">
                              {exercise.author.teacher_name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-[10px] font-medium text-slate-600">
                              {exercise.author.teacher_name}
                            </p>
                            <p className="text-[9px] text-slate-400">
                              {exercise.author.class_name}
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRepostExercise(exercise.id)}
                        className="px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition"
                      >
                        Repost
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {PUBLIC_EXERCISES.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">
                Tidak ada latihan publik yang tersedia untuk direpost.
              </div>
            )}
          </div>
        </div>
      )}
      {showAddDiscussionModal && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowAddDiscussionModal(false)}
          />
          <div className="relative w-full max-w-[480px] bg-white rounded-t-2xl p-4 pb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-700">
                Tambah Diskusi
              </h3>
              <button
                onClick={() => setShowAddDiscussionModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full"
              >
                <XMarkIcon className="w-6 h-6 text-slate-500" />
              </button>
            </div>
            <textarea
              value={newDiscussion}
              onChange={(e) => setNewDiscussion(e.target.value)}
              placeholder="Tulis pertanyaan atau diskusi baru..."
              className="w-full border border-slate-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-teal-500"
              rows={4}
              autoFocus
            />
            {(selectedImages.length > 0 || videoUrl) && (
              <div className="mt-3 space-y-2">
                {selectedImages.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {imagePreviews.map((src, idx) => (
                      <div key={src} className="relative">
                        <img
                          src={src}
                          alt="Preview"
                          className="w-16 h-16 object-cover rounded-lg border"
                        />
                        <button
                          onClick={() => {
                            setSelectedImages((prev) =>
                              prev.filter((_, i) => i !== idx)
                            );
                            setImagePreviews((prev) =>
                              prev.filter((_, i) => i !== idx)
                            );
                          }}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {videoUrl && (
                  <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-lg">
                    <span className="text-xs text-slate-600 truncate flex-1">
                      {videoUrl}
                    </span>
                    <button
                      onClick={() => setVideoUrl("")}
                      className="text-red-500 text-xs font-medium"
                    >
                      Hapus
                    </button>
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center gap-2 mt-3">
              <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium rounded-lg cursor-pointer transition">
                <PhotoIcon className="w-5 h-5" />
                Foto
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
              <button
                onClick={() => {
                  const url = prompt("Masukkan URL video YouTube:");
                  if (url) setVideoUrl(url);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium rounded-lg transition"
              >
                <VideoCameraIcon className="w-5 h-5" />
                Video
              </button>
              <div className="flex-1" />
              <button
                onClick={handleAddDiscussion}
                disabled={posting}
                className="px-5 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
              >
                {posting ? "Mengirim..." : "Kirim"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => {
              setShowDeleteConfirmModal(false);
              setExerciseToDelete(null);
            }}
          />
          <div className="relative w-full max-w-[400px] mx-4 bg-white rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              Hapus Latihan?
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Latihan yang dihapus tidak dapat dikembalikan. Apakah Anda yakin ingin menghapus latihan ini?
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                  setExerciseToDelete(null);
                }}
                className="flex-1 py-2.5 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                onClick={confirmDeleteExercise}
                className="flex-1 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Exercise Modal */}
      {showEditExerciseModal && editingExercise && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => {
              setShowEditExerciseModal(false);
              setEditingExercise(null);
            }}
          />
          <div className="relative w-full max-w-[440px] mx-4 bg-white rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">
              Edit Latihan
            </h3>
            
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Judul Latihan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editExerciseData.title}
                  onChange={(e) =>
                    setEditExerciseData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Contoh: Latihan Bab 1"
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 transition"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={editExerciseData.description}
                  onChange={(e) =>
                    setEditExerciseData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Deskripsi latihan (opsional)"
                  rows={3}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 transition resize-none"
                />
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Deadline
                </label>
                <input
                  type="date"
                  value={editExerciseData.deadline}
                  onChange={(e) =>
                    setEditExerciseData((prev) => ({
                      ...prev,
                      deadline: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 transition"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditExerciseModal(false);
                  setEditingExercise(null);
                }}
                className="flex-1 py-2.5 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleUpdateExercise}
                className="flex-1 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Material Detail Modal */}
      {showMaterialDetailModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setShowMaterialDetailModal(false);
              setSelectedMaterial(null);
            }}
          />
          <div className="relative w-full max-w-[480px] bg-white rounded-2xl max-h-[90vh] overflow-hidden flex flex-col mx-4">
            {loadingMaterialDetail ? (
              /* Loading State */
              <div className="flex items-center justify-center p-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                  <p className="text-sm text-slate-500">Memuat detail materi...</p>
                </div>
              </div>
            ) : selectedMaterial ? (
              <>
                {/* Header */}
                <div className={clsx(
                  "p-6 text-white",
                  selectedMaterial.type === "pdf" 
                    ? "bg-gradient-to-r from-red-600 to-red-500" 
                    : "bg-gradient-to-r from-blue-600 to-blue-500"
                )}>
                  <div className="flex items-center gap-3 mb-3">
                    <button
                      onClick={() => {
                        setShowMaterialDetailModal(false);
                        setSelectedMaterial(null);
                      }}
                      className="p-1 hover:bg-white/10 rounded-lg transition"
                    >
                      <ChevronLeftIcon className="size-6" />
                    </button>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold">{selectedMaterial.title}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1 text-sm opacity-90">
                          <ClockIcon className="size-4" />
                          {selectedMaterial.duration}
                        </span>
                        <span className="text-sm opacity-75">•</span>
                        <span className="text-sm opacity-90 uppercase font-medium">
                          {selectedMaterial.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Description */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Deskripsi</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {selectedMaterial.description}
                    </p>
                  </div>

                  {/* Duration */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Durasi</h3>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <div className="flex items-center gap-2">
                        <ClockIcon className="size-5 text-slate-500" />
                        <p className="text-sm text-slate-700 font-medium">
                          {selectedMaterial.duration || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* File/Video Preview */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">
                      {selectedMaterial.type === "pdf" ? "Preview PDF" : "Video"}
                    </h3>
                    
                    {selectedMaterial.type === "pdf" ? (
                      /* PDF Preview */
                      (selectedMaterial.fileUrl || selectedMaterial.file_url) ? (
                        <div className="space-y-3">
                          <div className="bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                            <iframe
                              src={selectedMaterial.fileUrl || selectedMaterial.file_url}
                              className="w-full h-[400px]"
                              title="PDF Preview"
                            />
                          </div>
                          <a
                            href={selectedMaterial.fileUrl || selectedMaterial.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 hover:bg-red-100 transition-all text-red-700 font-medium text-sm"
                          >
                            <DocumentTextIcon className="size-5" />
                            Buka PDF di Tab Baru
                            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      ) : (
                        <div className="bg-slate-50 rounded-xl p-8 border border-slate-200 text-center">
                          <DocumentTextIcon className="size-12 text-slate-300 mx-auto mb-2" />
                          <p className="text-sm text-slate-500">File PDF belum tersedia</p>
                        </div>
                      )
                    ) : (
                      /* YouTube Embed */
                      (selectedMaterial.fileUrl || selectedMaterial.file_url) ? (
                        <div className="space-y-3">
                          <div className="bg-black rounded-xl overflow-hidden border-2 border-blue-200">
                            <iframe
                              src={
                                (() => {
                                  const url = selectedMaterial.fileUrl || selectedMaterial.file_url || "";
                                  if (url.includes('youtube.com') || url.includes('youtu.be')) {
                                    // Extract video ID properly
                                    let videoId = '';
                                    if (url.includes('youtu.be/')) {
                                      videoId = url.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0];
                                    } else if (url.includes('watch?v=')) {
                                      videoId = url.split('watch?v=')[1]?.split('&')[0];
                                    } else if (url.includes('embed/')) {
                                      videoId = url.split('embed/')[1]?.split('?')[0];
                                    }
                                    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
                                  }
                                  return url;
                                })()
                              }
                              className="w-full aspect-video"
                              title="Video Preview"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                              referrerPolicy="strict-origin-when-cross-origin"
                            />
                          </div>
                          <a
                            href={selectedMaterial.fileUrl || selectedMaterial.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-all text-blue-700 font-medium text-sm"
                          >
                            <PlayIcon className="size-5" />
                            Tonton di YouTube
                            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      ) : (
                        <div className="bg-slate-50 rounded-xl p-8 border border-slate-200 text-center">
                          <PlayIcon className="size-12 text-slate-300 mx-auto mb-2" />
                          <p className="text-sm text-slate-500">Link video belum tersedia</p>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-200 bg-white flex gap-2">
                  <button
                    onClick={() => {
                      setShowMaterialDetailModal(false);
                      handleEditMaterial(selectedMaterial);
                    }}
                    className="flex-1 px-4 py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition flex items-center justify-center gap-2"
                  >
                    <PencilIcon className="size-4" />
                    Edit Materi
                  </button>
                  <button
                    onClick={() => {
                      setShowMaterialDetailModal(false);
                      handleDeleteMaterial(selectedMaterial.id);
                    }}
                    className="px-4 py-2.5 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition flex items-center justify-center gap-2"
                  >
                    <TrashIcon className="size-4" />
                    Hapus
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Delete Material Confirmation Modal */}
      {showDeleteMaterialModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => {
              setShowDeleteMaterialModal(false);
              setMaterialToDelete(null);
            }}
          />
          <div className="relative w-full max-w-[400px] mx-4 bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <TrashIcon className="size-6 text-red-600" />
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-slate-700 mb-2 text-center">
              Hapus Materi?
            </h3>
            <p className="text-sm text-slate-600 mb-6 text-center">
              Materi yang dihapus tidak dapat dikembalikan. Apakah Anda yakin ingin menghapus materi ini?
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteMaterialModal(false);
                  setMaterialToDelete(null);
                }}
                className="flex-1 py-2.5 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                onClick={confirmDeleteMaterial}
                className="flex-1 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
