"use client";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/utils/context/auth_context";
import {
  BookOpenIcon,
  ClipboardDocumentListIcon,
  ChatBubbleBottomCenterTextIcon,
  ChevronLeftIcon,
  ChatBubbleLeftIcon,
  PhotoIcon,
  VideoCameraIcon,
  XMarkIcon,
  PlusIcon,
  ClockIcon,
  DocumentTextIcon,
  ChevronDownIcon,
  PlayIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolidIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";
import {
  getClassById,
  Material,
  Exercise,
  Discussion,
  getAttendanceDates,
  getAttendanceByClassAndDate,
  AttendanceStatus,
} from "@/constants/student-data";
import Link from "next/link";
import { getImage } from "@/utils/function/function";

// Simple initials avatar component - no external API calls
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

type TabType = "materi" | "latihan" | "diskusi" | "kehadiran";

export default function KelasDetailPage() {
  const normalizeYoutubeEmbed = (url?: string) => {
    if (!url) return null;

    // Sudah embed
    if (url.includes("youtube.com/embed/")) return url;

    // youtube.com/watch?v=
    if (url.includes("youtube.com/watch")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    // youtu.be/
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    // youtube.com/live/
    if (url.includes("youtube.com/live/")) {
      const videoId = url.split("youtube.com/live/")[1]?.split("?")[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    return null;
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

  const { auth } = useAuth();
  const params = useParams();
  const classId = Number(params.id);
  const [classInfo, setClassInfo] = useState<any>(null);
  const [classLoading, setClassLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<TabType>("materi");
  const [newDiscussion, setNewDiscussion] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const [exercises, setExercises] = useState<any[]>([]);
  const [exercisesLoading, setExercisesLoading] = useState(false);

  const [replyText, setReplyText] = useState<{ [key: number]: string }>({});
  const [replying, setReplying] = useState<number | null>(null);

  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0); // detik
  const [timerExpired, setTimerExpired] = useState(false);

  const [resultSummary, setResultSummary] = useState<{
    correct: number;
    total: number;
  } | null>(null);

  const [videoUrl, setVideoUrl] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const gradients = [
    "from-teal-600 to-teal-500",
    "from-blue-600 to-indigo-500",
    "from-emerald-600 to-green-500",
    "from-violet-600 to-purple-500",
    "from-orange-500 to-amber-500",
  ];
  // Materi modal state
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null
  );

  // Latihan/Quiz state
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: number;
  }>({});
  const [showResult, setShowResult] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Discussion replies state - track which discussions have expanded replies
  const [expandedReplies, setExpandedReplies] = useState<{
    [key: number]: boolean;
  }>({});

  const [materials, setMaterials] = useState<any[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);


  const [attendanceSummary, setAttendanceSummary] = useState<any>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const [discussions, setDiscussions] = useState<any[]>([]);
  const [discussionsLoading, setDiscussionsLoading] = useState(false);

  const [posting, setPosting] = useState(false);

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  // Edit/Delete modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDiscussion, setEditingDiscussion] = useState<Discussion | null>(null);
  const [editContent, setEditContent] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  const toggleReplies = (discussionId: number) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [discussionId]: !prev[discussionId],
    }));
  };
  
  // Edit/Delete handlers for discussions
  const handleEditDiscussion = (discussion: Discussion) => {
    setEditingDiscussion(discussion);
    setEditContent(discussion.content);
    setShowEditModal(true);
    setActiveMenuId(null);
  };
  
  const handleSaveEdit = () => {
    if (!editingDiscussion || !editContent.trim()) return;
    setDiscussions(prev => prev.map(d => 
      d.id === editingDiscussion.id ? { ...d, content: editContent } : d
    ));
    setShowEditModal(false);
    setEditingDiscussion(null);
    setEditContent("");
  };
  
  const handleDeleteDiscussion = (discussionId: number) => {
    if (confirm("Hapus diskusi ini?")) {
      setDiscussions(prev => prev.filter(d => d.id !== discussionId));
    }
    setActiveMenuId(null);
  };
  
  const toggleMenu = (discussionId: number) => {
    setActiveMenuId(activeMenuId === discussionId ? null : discussionId);
  };

  useEffect(() => {
    if (activeTab !== "latihan") return;

    const fetchExercises = async () => {
      try {
        setExercisesLoading(true);
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
      } catch (err) {
        console.error(err);
        setExercises([]);
      } finally {
        setExercisesLoading(false);
      }
    };

    fetchExercises();
  }, [activeTab, classId]);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    {
      id: "materi",
      label: "Materi",
      icon: <BookOpenIcon className="size-5" />,
    },
    {
      id: "latihan",
      label: "Latihan",
      icon: <ClipboardDocumentListIcon className="size-5" />,
    },
    {
      id: "diskusi",
      label: "Diskusi",
      icon: <ChatBubbleBottomCenterTextIcon className="size-5" />,
    },
    {
      id: "kehadiran",
      label: "Hadir",
      icon: <CalendarDaysIcon className="size-5" />,
    },
  ];

  // Attendance data for student (fetched from API)
  const attendanceDates = getAttendanceDates(classId);

  const attendanceStats = {
    total: attendanceRecords.length,
    hadir: attendanceRecords.filter((r) => r.status === "hadir").length,
    tidakHadir: attendanceRecords.filter((r) => r.status === "alpa").length,
    izin: attendanceRecords.filter((r) => r.status === "izin").length,
    sakit: attendanceRecords.filter((r) => r.status === "sakit").length,
  };
  const attendancePercentage = attendanceSummary?.percentage ?? 0;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  useEffect(() => {
    if (activeTab !== "diskusi") return;

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

        // pagination laravel
        setDiscussions(json.data || []);
      } catch (err) {
        console.error(err);
        setDiscussions([]);
      } finally {
        setDiscussionsLoading(false);
      }
    };

    fetchDiscussions();
  }, [activeTab, classId]);

  useEffect(() => {
    const fetchClassDetail = async () => {
      try {
        setClassLoading(true);
        const token = localStorage.getItem("access_token");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/classes/${classId}/my`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Gagal fetch detail kelas");

        const json = await res.json();
        setClassInfo(json.data);
      } catch (error) {
        console.error(error);
        setClassInfo(null);
      } finally {
        setClassLoading(false);
      }
    };

    fetchClassDetail();
  }, [classId]);

  useEffect(() => {
    if (activeTab !== "materi") return;

    const fetchMaterials = async () => {
      try {
        setMaterialsLoading(true);
        const token = localStorage.getItem("access_token");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/classes/${classId}/materials/my`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Gagal fetch materi");

        const json = await res.json();
        setMaterials(json.data || []);
      } catch (err) {
        console.error(err);
        setMaterials([]);
      } finally {
        setMaterialsLoading(false);
      }
    };

    fetchMaterials();
  }, [activeTab, classId]);

  useEffect(() => {
    if (activeTab !== "kehadiran") return;

    const fetchAttendance = async () => {
      try {
        setAttendanceLoading(true);
        const token = localStorage.getItem("access_token");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/classes/${classId}/attendance/my`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Gagal fetch kehadiran");

        const json = await res.json();

        setAttendanceSummary(json.summary);
        setAttendanceRecords(json.records || []);
      } catch (err) {
        console.error(err);
        setAttendanceSummary(null);
        setAttendanceRecords([]);
      } finally {
        setAttendanceLoading(false);
      }
    };

    fetchAttendance();
  }, [activeTab, classId]);

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case "hadir":
        return <CheckCircleIcon className="size-5 text-green-500" />;
      case "tidak_hadir":
        return <XCircleIcon className="size-5 text-red-500" />;
      case "izin":
        return <ClockIcon className="size-5 text-blue-500" />;
      case "sakit":
        return <ExclamationTriangleIcon className="size-5 text-orange-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: AttendanceStatus) => {
    switch (status) {
      case "hadir":
        return "Hadir";
      case "tidak_hadir":
        return "Tidak Hadir";
      case "izin":
        return "Izin";
      case "sakit":
        return "Sakit";
      default:
        return "-";
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);

    setSelectedImages((prev) => [...prev, ...fileArray]);

    const previews = fileArray.map((file) => URL.createObjectURL(file));

    setImagePreviews((prev) => [...prev, ...previews]);

    e.target.value = "";
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

      // inject balasan ke state
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

      if (!res.ok) throw new Error("Gagal mengirim diskusi");

      const json = await res.json();

      // prepend ke list diskusi
      setDiscussions((prev) => [json.data, ...prev]);

      // reset modal
      setNewDiscussion("");
      setSelectedImages([]);
      setVideoUrl("");
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
      alert("Gagal mengirim diskusi");
    } finally {
      setPosting(false);
    }
  };

  const handleStartQuiz = async (exercise: any) => {
    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/classedu-exercises/${exercise.id}/start`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Gagal memulai latihan");

      const json = await res.json();

      setAttemptId(json.attempt_id);

      setSelectedExercise({
        ...exercise,
        questions: json.questions,
      });

      setCurrentQuestion(0);
      setSelectedAnswers({});
      setShowResult(false);

      // ⏱️ SET TIMER
      setRemainingTime(exercise.duration * 60);
    } catch (err) {
      alert("Tidak bisa memulai latihan");
    }
  };

  const handleAutoFinish = async () => {
    if (!attemptId) return;

    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/classedu-exercise-attempts/${attemptId}/finish`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();

      setQuizScore(json.score);
      setShowResult(true);
      setTimerExpired(true);
    } catch (err) {
      alert("Gagal menyelesaikan latihan");
    }
  };

  useEffect(() => {
    if (!selectedExercise || showResult) return;
    if (remainingTime <= 0) {
      handleAutoFinish();
      return;
    }

    const interval = setInterval(() => {
      setRemainingTime((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingTime, selectedExercise, showResult]);

  const handleAnswerSelect = async (
    questionId: number,
    answerIndex: number
  ) => {
    if (!attemptId) return;

    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answerIndex }));

    try {
      const token = localStorage.getItem("access_token");

      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/classedu-exercise-attempts/${attemptId}/answer`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question_id: questionId,
            selected_option: answerIndex,
          }),
        }
      );
    } catch (err) {
      console.error("Gagal simpan jawaban");
    }
  };

  const handleSubmitQuiz = async () => {
    if (!attemptId) return;

    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/classedu-exercise-attempts/${attemptId}/finish`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();

      setQuizScore(json.score);
      setResultSummary({
        correct: json.correct,
        total: json.total,
      });
      setShowResult(true);
    } catch (err) {
      alert("Gagal menyelesaikan latihan");
    }
  };

  if (classLoading) {
    return (
      <div className="w-full max-w-[480px] md:max-w-none mx-auto bg-white min-h-screen flex items-center justify-center">
        <p className="text-slate-400">Memuat kelas...</p>
      </div>
    );
  }

  if (!classInfo) {
    return (
      <div className="w-full max-w-[480px] md:max-w-none mx-auto bg-white min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Kelas tidak ditemukan</p>
      </div>
    );
  }
  const headerGradient = gradients[classInfo.id % gradients.length];

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full bg-white md:bg-[#FAFBFC] min-h-screen pb-24 md:pb-12 md:pt-4">
      {/* MOBILE HEADER */}
      <div
        className={clsx("md:hidden bg-gradient-to-br text-white p-5 pt-8 shadow-xl rounded-b-[2.5rem] relative overflow-hidden", headerGradient)}
      >
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-8 -mb-8 blur-xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/kelas" className="p-2 bg-white/20 backdrop-blur-md rounded-xl shadow-sm active:scale-95 transition">
              <ChevronLeftIcon className="size-5 text-white" />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold leading-tight truncate">{classInfo.name}</h1>
              <p className="text-xs text-white/70 font-medium truncate mt-0.5">{classInfo.school_place}</p>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-lg p-2">
                <UserGroupIcon className="size-5 text-white" />
              </div>
              <div>
                <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Siswa</p>
                <p className="text-sm font-bold">{classInfo.total_students} Orang</p>
              </div>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div className="text-right">
              <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Guru</p>
              <p className="text-sm font-bold truncate max-w-[120px]">{classInfo.teacher?.name?.split(',')[0] || "-"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP HERO BANNER */}
      <div className={clsx("hidden md:block relative pt-12 pb-24 px-8 xl:px-12 shadow-md overflow-hidden z-0 bg-gradient-to-r md:rounded-b-3xl md:mx-4 xl:mx-8 mb-6", headerGradient)}>
        <div 
          className="absolute inset-0 opacity-10" 
          style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\\"60\\\" height=\\\"60\\\" viewBox=\\\"0 0 60 60\\\" xmlns=\\\"http://www.w3.org/2000/svg\\\"%3E%3Cg fill=\\\"none\\\" fill-rule=\\\"evenodd\\\"%3E%3Cg fill=\\\"%23ffffff\\\" fill-opacity=\\\"1\\\"%3E%3Cpath d=\\\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2V6h4V4H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}
        ></div>
        <div className="relative z-10 max-w-6xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="text-white flex-1">
            <div className="flex items-center gap-3 mb-4">
               <Link href="/kelas" className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors border border-white/20 backdrop-blur-sm">
                  <ChevronLeftIcon className="size-5 text-white" />
               </Link>
               <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">{classInfo.name}</h1>
            </div>
            <p className="text-white/90 max-w-xl text-lg sm:text-lg leading-relaxed md:pl-12 font-medium">
              {classInfo.school_place}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 flex flex-wrap items-center gap-6 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 rounded-2xl p-4">
                <UserGroupIcon className="size-8 text-white" />
              </div>
              <div>
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Total Siswa</p>
                <p className="text-white font-black text-3xl">
                  {classInfo.total_students} <span className="text-lg font-medium opacity-80">Orang</span>
                </p>
              </div>
            </div>
            <div className="hidden sm:block w-px h-14 bg-white/30"></div>
            <div>
               <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Pengajar</p>
               <p className="text-white font-bold text-xl mt-1">{classInfo.teacher?.name || "-"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="md:max-w-6xl md:mx-auto md:px-8 xl:px-12 md:-mt-14 relative z-20">
         {/* Tabs Nav */}
          <div className="flex bg-white/80 backdrop-blur-xl md:bg-white/50 rounded-2xl shadow-sm md:shadow-xl border border-slate-200/50 p-1.5 mb-6 gap-1 md:gap-2 overflow-x-auto no-scrollbar z-40 sticky top-4 md:static">
             {tabs.map((tab) => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={clsx(
                   "flex-1 min-w-[110px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs md:text-sm font-bold transition-all duration-300",
                   activeTab === tab.id 
                     ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20 scale-[1.02]" 
                     : "text-slate-500 hover:bg-slate-50 hover:text-teal-600"
                 )}
               >
                 <span className={clsx("transition-transform duration-300", activeTab === tab.id ? "scale-110" : "")}>
                   {tab.icon}
                 </span>
                 <span className="whitespace-nowrap tracking-wide">{tab.label}</span>
               </button>
             ))}
          </div>

      {/* Tab Content */}
      <div className="p-4 md:p-8 md:bg-white md:rounded-3xl md:shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:border md:border-slate-100 min-h-[50vh]">
        {/* Materi Tab */}
        {activeTab === "materi" && (
          <div className="space-y-4">
            <h2 className="text-lg md:text-xl font-bold text-slate-700 hidden md:block border-b border-slate-100 pb-4 mb-6">
              Materi Pembelajaran
            </h2>
            <h2 className="text-lg font-semibold text-slate-700 mb-4 md:hidden">
              Materi Pembelajaran
            </h2>
            {materialsLoading && (
              <div className="flex flex-col items-center justify-center py-10">
                 <div className="w-8 h-8 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin"></div>
              </div>
            )}

            {!materialsLoading && materials.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                 <BookOpenIcon className="size-12 text-slate-300 mb-3" />
                 <p className="text-sm font-semibold text-slate-500">Belum ada materi</p>
                 <p className="text-xs text-slate-400 mt-1">Materi akan muncul di sini setelah diunggah oleh guru.</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
              {materials.map((material) => (
                <div
                  key={material.id}
                  onClick={() => setSelectedMaterial(material)}
                  className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:border-teal-100 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={clsx(
                        "p-4 rounded-2xl transition-transform group-hover:scale-110 duration-300",
                        material.type === "pdf" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                      )}
                    >
                      {material.type === "pdf" ? (
                        <DocumentTextIcon className="size-8" />
                      ) : (
                        <PlayIcon className="size-8" />
                      )}
                    </div>
                    <span
                      className={clsx(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                        material.type === "pdf"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      )}
                    >
                      {material.type}
                    </span>
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-teal-600 transition-colors">
                      {material.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {material.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                      <ClockIcon className="size-4" />
                      {material.duration}
                    </div>
                    <div className="text-teal-600 opacity-0 lg:group-hover:opacity-100 transition-opacity font-bold text-xs flex items-center gap-1">
                      Buka Materi 
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Latihan Tab */}
        {activeTab === "latihan" && (
          <div className="space-y-4">
            <h2 className="text-lg md:text-xl font-bold text-slate-700 hidden md:block border-b border-slate-100 pb-4 mb-6">
              Latihan Soal
            </h2>
            <h2 className="text-lg font-semibold text-slate-700 mb-4 md:hidden">
              Latihan Soal
            </h2>
            {exercisesLoading && (
              <div className="flex flex-col items-center justify-center py-10">
                 <div className="w-8 h-8 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin"></div>
              </div>
            )}

            {!exercisesLoading && exercises.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                 <ClipboardDocumentListIcon className="size-12 text-slate-300 mb-3" />
                 <p className="text-sm font-semibold text-slate-500">Belum ada latihan</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
              {exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className={clsx(
                    "group bg-white border rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full",
                    exercise.is_completed
                      ? "border-green-200 bg-green-50/20"
                      : "border-slate-200 hover:border-orange-200"
                  )}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={clsx(
                        "p-4 rounded-2xl transition-transform group-hover:scale-110",
                        exercise.is_completed ? "bg-green-100 text-green-600" : "bg-orange-50 text-orange-600"
                      )}
                    >
                      {exercise.is_completed ? (
                        <CheckCircleSolidIcon className="size-8" />
                      ) : (
                        <ClipboardDocumentListIcon className="size-8" />
                      )}
                    </div>
                    {exercise.is_completed && (
                      <div className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">
                        Selesai
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col">
                    <h3 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-teal-600 transition-colors">
                      {exercise.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {exercise.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-4 text-[11px] font-semibold text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <DocumentTextIcon className="size-4" />
                        {exercise.totalQuestions} soal
                      </span>
                      <span className="flex items-center gap-1.5">
                        <ClockIcon className="size-4" />
                        {exercise.duration} menit
                      </span>
                    </div>
                    <div className="mt-2 text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                      <CalendarDaysIcon className="size-4" />
                      Deadline: {formatDeadline(exercise.deadline)}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    {exercise.is_completed ? (
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Nilai Anda</span>
                        <span className="text-2xl font-black text-green-600 leading-none mt-1">
                          {exercise.result_score}
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartQuiz(exercise)}
                        className="w-full py-3 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 shadow-md hover:shadow-lg transition-all active:scale-95"
                      >
                        Mulai Latihan
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Diskusi Tab */}
        {activeTab === "diskusi" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-2">
              <h2 className="text-lg md:text-xl font-bold text-slate-700">
                Diskusi Kelas
              </h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                <PlusIcon className="w-5 h-5" />
                Buat Topik Baru
              </button>
            </div>

            {/* Discussions List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {discussionsLoading && (
                <div className="col-span-full flex justify-center py-10">
                   <div className="w-8 h-8 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin"></div>
                </div>
              )}

              {!discussionsLoading && discussions.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-16 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                 <ChatBubbleBottomCenterTextIcon className="size-12 text-slate-300 mb-3" />
                 <p className="text-sm font-semibold text-slate-500">Belum ada diskusi</p>
                 <p className="text-xs text-slate-400 mt-1">Jadilah yang pertama memulai diskusi!</p>
                </div>
              )}

              {discussions.map((discussion) => (
                <div
                  key={discussion.id}
                  className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
                >
                  {/* Discussion Header with Menu */}
                  <div className="p-4 pb-3">
                    <div className="flex items-center gap-3">
                      <InitialsAvatar
                        name={discussion.user.name}
                        size="lg"
                        bgColor="teal"
                      />

                      <p className="font-semibold text-slate-700 text-sm">
                        {discussion.user.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(discussion.created_at).toLocaleString(
                          "id-ID"
                        )}
                      </p>
                    </div>
                    <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                      {discussion.content}
                    </p>
                  </div>

                  {/* Media */}
                  {/* Media Image */}
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
                    <div className="flex items-center justify-between">
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
                  </div>

                  {/* Collapsible Replies Section */}
                  {expandedReplies[discussion.id] && (
                    <div className="bg-slate-50 border-t border-slate-100 px-4 py-3 space-y-3">
                      {/* List Balasan */}
                      {discussion.replies?.length > 0 ? (
                        discussion.replies.map((reply: any) => (
                          <div key={reply.id} className="flex gap-3">
                            <InitialsAvatar
                              name={reply.user.name}
                              size="sm"
                              bgColor="slate"
                            />
                            <div>
                              <p className="text-xs font-medium text-slate-700">
                                {reply.user.name}
                              </p>
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

                      {/* Reply Input */}
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

        {/* Kehadiran Tab */}
        {activeTab === "kehadiran" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-700 mb-4">
              Riwayat Kehadiran
            </h2>

            {/* Summary Card */}
            {/* Summary Card */}
            <div
              className={clsx(
                "rounded-2xl p-6 shadow-md border transition-all duration-300",
                attendancePercentage >= 80
                  ? "bg-green-50 border-green-100"
                  : attendancePercentage >= 60
                  ? "bg-yellow-50 border-yellow-100"
                  : "bg-red-50 border-red-100"
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-slate-700 tracking-wide uppercase">
                  Progress Kehadiran
                </span>
                <span
                  className={clsx(
                    "text-3xl font-black",
                    attendancePercentage >= 80
                      ? "text-green-600"
                      : attendancePercentage >= 60
                      ? "text-yellow-600"
                      : "text-red-600"
                  )}
                >
                  {attendancePercentage}%
                </span>
              </div>
              <div className="w-full bg-slate-200/50 rounded-full h-3.5 mb-2">
                <div
                  className={clsx(
                    "h-3.5 rounded-full transition-all duration-1000",
                    attendancePercentage >= 80
                      ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                      : attendancePercentage >= 60
                      ? "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]"
                      : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                  )}
                  style={{ width: `${attendancePercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-bold mt-4 text-slate-400 tracking-wide uppercase">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Hadir {attendanceStats.hadir} / {attendanceStats.total} Hari
                </span>
                <span className="flex gap-3">
                  {attendanceStats.izin > 0 && <span className="text-blue-500">{attendanceStats.izin} Izin</span>}
                  {attendanceStats.sakit > 0 && <span className="text-orange-500">{attendanceStats.sakit} Sakit</span>}
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                   <div className="p-2 bg-green-50 rounded-lg text-green-600 font-bold text-xs">Hdr</div>
                   <CheckCircleIcon className="size-4 text-green-500" />
                </div>
                <p className="text-2xl font-black text-slate-800">{attendanceStats.hadir}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Hari</p>
              </div>
              
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                   <div className="p-2 bg-red-50 rounded-lg text-red-600 font-bold text-xs">Abs</div>
                   <XCircleIcon className="size-4 text-red-500" />
                </div>
                <p className="text-2xl font-black text-slate-800">{attendanceStats.tidakHadir}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Alpa</p>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                   <div className="p-2 bg-blue-50 rounded-lg text-blue-600 font-bold text-xs">Izn</div>
                   <ClockIcon className="size-4 text-blue-500" />
                </div>
                <p className="text-2xl font-black text-slate-800">{attendanceStats.izin}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Izin</p>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                   <div className="p-2 bg-orange-50 rounded-lg text-orange-600 font-bold text-xs">Skt</div>
                   <ExclamationTriangleIcon className="size-4 text-orange-500" />
                </div>
                <p className="text-2xl font-black text-slate-800">{attendanceStats.sakit}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Sakit</p>
              </div>
            </div>

            {/* History List */}
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-3">
                Detail per Tanggal
              </h3>
              <div className="space-y-2">
                {attendanceRecords.length > 0 ? (
                  attendanceRecords.map((record, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(record.status as AttendanceStatus)}
                        <span className="text-sm text-slate-700">
                          {formatDate(record.date)}
                        </span>
                      </div>
                      <span
                        className={clsx(
                          "text-xs font-medium px-2 py-1 rounded-full",
                          record.status === "hadir" &&
                            "bg-green-100 text-green-700",
                          record.status === "tidak_hadir" &&
                            "bg-red-100 text-red-700",
                          record.status === "izin" &&
                            "bg-blue-100 text-blue-700",
                          record.status === "sakit" &&
                            "bg-orange-100 text-orange-700"
                        )}
                      >
                        {getStatusLabel(record.status as AttendanceStatus)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-sm text-slate-500 py-8">
                    Belum ada data kehadiran
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      </div>


      {/* Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] max-w-[480px] mx-auto bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgb(0,0,0,0.05)] rounded-t-2xl">
        <div className="flex items-end justify-around h-16 px-2 pb-1">
          {tabs.slice(0, 2).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2 transition"
            >
              <div
                className={clsx(
                  "transition-colors",
                  activeTab === tab.id ? "text-teal-600" : "text-slate-400"
                )}
              >
                {tab.icon}
              </div>
              <span
                className={clsx(
                  "text-[10px] font-medium",
                  activeTab === tab.id ? "text-teal-600" : "text-slate-400"
                )}
              >
                {tab.label}
              </span>
            </button>
          ))}

          {activeTab === "diskusi" && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex flex-col items-center justify-center -mt-6 px-3"
            >
              <div className="w-14 h-14 bg-teal-500 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                <PlusIcon className="w-7 h-7 text-white" />
              </div>
              <span className="text-[10px] font-medium text-slate-500 mt-1">
                Posting
              </span>
            </button>
          )}

          {tabs.slice(2, 4).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2 transition"
            >
              <div
                className={clsx(
                  "transition-colors",
                  activeTab === tab.id ? "text-teal-600" : "text-slate-400"
                )}
              >
                {tab.icon}
              </div>
              <span
                className={clsx(
                  "text-[10px] font-medium",
                  activeTab === tab.id ? "text-teal-600" : "text-slate-400"
                )}
              >
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Material Detail Modal */}
      {selectedMaterial && (
        <div className="fixed inset-0 z-[200] bg-slate-100 md:bg-black/60 md:backdrop-blur-sm md:flex md:items-center md:justify-center md:p-6">
          <div className="flex flex-col h-full max-w-[480px] w-full md:max-w-5xl md:h-[90vh] md:rounded-3xl mx-auto bg-white shadow-2xl overflow-hidden">
            {/* Modal Header with gradient */}
            <div
              className={clsx(
                "bg-gradient-to-r p-4 pt-6 text-white",
                headerGradient
              )}
            >
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={() => setSelectedMaterial(null)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition"
                >
                  <ChevronLeftIcon className="size-6 text-white" />
                </button>
                <div className="flex-1">
                  <h1 className="font-bold text-lg">
                    {selectedMaterial.title}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={clsx(
                        "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase",
                        selectedMaterial.type === "pdf"
                          ? "bg-red-500/30 text-white"
                          : "bg-blue-500/30 text-white"
                      )}
                    >
                      {selectedMaterial.type}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-white/80">
                      <ClockIcon className="size-3" />
                      {selectedMaterial.duration}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-auto bg-slate-50">
              {/* Media Section */}
              <div className="bg-white border-b border-slate-200">
                {selectedMaterial.type === "video" ? (
                  selectedMaterial.fileUrl || selectedMaterial.file_url ? (
                    <div className="space-y-3">
                      <div className="relative w-full pt-[56.25%] bg-slate-900">
                        <iframe
                          src={
                            (() => {
                              const url = selectedMaterial.fileUrl || selectedMaterial.file_url || "";
                              if (url.includes('youtube.com') || url.includes('youtu.be')) {
                                // Extract video ID
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
                          className="absolute inset-0 w-full h-full"
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
                        className="block w-full px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 text-center"
                      >
                        Tonton di YouTube
                      </a>
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-2xl mb-3">
                        <PlayIcon className="size-10 text-blue-500" />
                      </div>
                      <p className="text-sm font-medium text-slate-700">
                        Video belum tersedia
                      </p>
                      <p className="text-xs text-slate-400 mt-1">Link video belum ditambahkan</p>
                    </div>
                  )
                ) : (
                  selectedMaterial.fileUrl || selectedMaterial.file_url ? (
                    <div className="space-y-3 p-4">
                      <div className="bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                        <iframe
                          src={selectedMaterial.fileUrl || selectedMaterial.file_url}
                          className="w-full h-[400px]"
                          title="PDF Preview"
                          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                          referrerPolicy="no-referrer-when-downgrade"
                          loading="lazy"
                        />
                      </div>
                      <button
                        onClick={() => {
                          const url = selectedMaterial.fileUrl || selectedMaterial.file_url;
                          if (url) {
                            window.open(url, "_blank");
                          }
                        }}
                        className="w-full px-6 py-3 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                      >
                        <DocumentTextIcon className="size-5" />
                        Buka PDF di Tab Baru
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-2xl mb-3">
                        <DocumentTextIcon className="size-10 text-red-500" />
                      </div>
                      <p className="text-sm font-medium text-slate-700">
                        PDF belum tersedia
                      </p>
                      <p className="text-xs text-slate-400 mt-1">File PDF belum ditambahkan</p>
                    </div>
                  )
                )}
              </div>

              {/* Info Cards Section */}
              <div className="p-4 space-y-4">
                {/* Description Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                    <h2 className="font-semibold text-slate-700 text-sm">
                      Deskripsi
                    </h2>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {selectedMaterial.description}
                    </p>
                  </div>
                </div>

                {/* Chapters Card */}
                {selectedMaterial.chapters && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                      <h2 className="font-semibold text-slate-700 text-sm">
                        Materi yang Dipelajari
                      </h2>
                    </div>
                    <div className="p-3">
                      <div className="space-y-2">
                        {selectedMaterial.chapters.map((chapter, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                          >
                            <span className="w-7 h-7 bg-gradient-to-br from-teal-500 to-teal-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                              {idx + 1}
                            </span>
                            <span className="text-sm text-slate-700 font-medium">
                              {chapter}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Info Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                    <h2 className="font-semibold text-slate-700 text-sm">
                      Informasi
                    </h2>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Tipe Materi</span>
                      <span
                        className={clsx(
                          "px-2 py-1 rounded-lg font-medium text-xs",
                          selectedMaterial.type === "pdf"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        )}
                      >
                        {selectedMaterial.type === "pdf"
                          ? "Dokumen PDF"
                          : "Video Pembelajaran"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Durasi</span>
                      <span className="text-slate-700 font-medium">
                        {selectedMaterial.duration}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Tanggal Dibuat</span>
                      <span className="text-slate-700 font-medium">
                        {selectedMaterial.createdAt || selectedMaterial.created_at
                          ? new Date(
                              String(selectedMaterial.createdAt || selectedMaterial.created_at)
                            ).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {selectedExercise && (
        <div className="fixed inset-0 z-[200] bg-white md:bg-black/60 md:backdrop-blur-sm md:flex md:items-center md:justify-center md:p-8">
          <div className="flex flex-col h-full max-w-[480px] w-full md:max-w-4xl md:h-[90vh] md:rounded-3xl mx-auto shadow-2xl overflow-hidden bg-white">
            {/* Quiz Header */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-500 p-4 text-white">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedExercise(null)}
                  className="p-1"
                >
                  <XMarkIcon className="size-6" />
                </button>
                <div className="flex-1">
                  <h1 className="font-semibold">{selectedExercise.title}</h1>
                  <p className="text-xs text-white/80">
                    {selectedExercise.duration} menit
                  </p>
                </div>
              </div>
              {!showResult && (
                <div className="mt-3 bg-white/20 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-white h-full transition-all duration-300"
                    style={{
                      width: `${
                        ((currentQuestion + 1) /
                          (selectedExercise.questions?.length || 1)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              )}
            </div>

            {/* Quiz Content */}
            <div className="flex-1 overflow-auto p-4">
              {showResult ? (
                <div className="text-center py-8">
                  <div
                    className={clsx(
                      "w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-4",
                      quizScore >= 70 ? "bg-green-100" : "bg-orange-100"
                    )}
                  >
                    <span
                      className={clsx(
                        "text-3xl font-bold",
                        quizScore >= 70 ? "text-green-600" : "text-orange-600"
                      )}
                    >
                      {quizScore}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-700 mb-2">
                    {quizScore >= 70 ? "Bagus! 🎉" : "Terus Belajar! 💪"}
                  </h2>
                  <p className="text-sm text-slate-500 mb-6">
                    Kamu menjawab{" "}
                    <span className="font-semibold text-slate-700">
                      {resultSummary?.correct}
                    </span>{" "}
                    dari{" "}
                    <span className="font-semibold text-slate-700">
                      {resultSummary?.total}
                    </span>{" "}
                    soal dengan benar
                  </p>

                  {timerExpired && (
                    <p className="text-sm text-red-500 mb-4">
                      Latihan berakhir karena waktu habis
                    </p>
                  )}
                  <button
                    onClick={() => setSelectedExercise(null)}
                    className="px-6 py-3 bg-teal-600 text-white font-medium rounded-xl"
                  >
                    Kembali ke Latihan
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <span className="text-xs text-slate-400">
                      Soal {currentQuestion + 1} dari{" "}
                      {selectedExercise.questions?.length}
                    </span>
                    <p className="text-xs text-black/80">
                      ⏱️ {formatTime(remainingTime)}
                    </p>
                    {timerExpired && (
                      <p className="text-xs text-red-200 mt-1">Waktu habis</p>
                    )}
                    <h3 className="text-lg font-medium text-slate-700 mt-2">
                      {selectedExercise.questions?.[currentQuestion]?.question}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {selectedExercise.questions?.[currentQuestion]?.options.map(
                      (option, idx) => (
                        <button
                          key={idx}
                          onClick={() =>
                            handleAnswerSelect(
                              selectedExercise.questions![currentQuestion].id,
                              idx
                            )
                          }
                          className={clsx(
                            "w-full p-4 text-left rounded-xl border-2 transition",
                            selectedAnswers[
                              selectedExercise.questions![currentQuestion].id
                            ] === idx
                              ? "border-teal-500 bg-teal-50"
                              : "border-slate-200 hover:border-slate-300"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={clsx(
                                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                                selectedAnswers[
                                  selectedExercise.questions![currentQuestion]
                                    .id
                                ] === idx
                                  ? "bg-teal-500 text-white"
                                  : "bg-slate-100 text-slate-600"
                              )}
                            >
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="text-sm text-slate-700">
                              {option}
                            </span>
                          </div>
                        </button>
                      )
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Quiz Footer */}
            {!showResult && (
              <div className="p-4 border-t border-slate-200 flex gap-3">
                {currentQuestion > 0 && (
                  <button
                    onClick={() => setCurrentQuestion((prev) => prev - 1)}
                    className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 font-medium"
                  >
                    Sebelumnya
                  </button>
                )}
                {timerExpired && (
                  <p className="text-sm text-red-500 mt-2">
                    Latihan berakhir karena waktu habis
                  </p>
                )}
                {currentQuestion <
                (selectedExercise.questions?.length || 0) - 1 ? (
                  <button
                    onClick={() => setCurrentQuestion((prev) => prev + 1)}
                    disabled={
                      selectedAnswers[
                        selectedExercise.questions![currentQuestion].id
                      ] === undefined
                    }
                    className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-medium disabled:opacity-50"
                  >
                    Selanjutnya
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={
                      selectedAnswers[
                        selectedExercise.questions![currentQuestion].id
                      ] === undefined
                    }
                    className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-medium disabled:opacity-50"
                  >
                    Selesai
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Discussion Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative w-full max-w-[480px] md:max-w-xl bg-white rounded-t-2xl md:rounded-2xl p-4 md:p-6 pb-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-700">
                Tambah Diskusi
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
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
                  if (url) {
                    let embedUrl = url;
                    if (url.includes("youtube.com/watch")) {
                      const videoId = url.split("v=")[1]?.split("&")[0];
                      embedUrl = `https://www.youtube.com/embed/${videoId}`;
                    } else if (url.includes("youtu.be/")) {
                      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
                      embedUrl = `https://www.youtube.com/embed/${videoId}`;
                    }
                    setVideoUrl(embedUrl);
                  }
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

      {/* Edit Discussion Modal */}
      {showEditModal && editingDiscussion && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowEditModal(false)} />
          <div className="relative w-full max-w-[440px] mx-4 bg-white rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-700">Edit Diskusi</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-slate-100 rounded-full">
                <XMarkIcon className="size-6 text-slate-500" />
              </button>
            </div>
            
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Isi diskusi..."
              rows={5}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none text-sm"
            />
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-2 border border-slate-300 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editContent.trim()}
                className="flex-1 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
