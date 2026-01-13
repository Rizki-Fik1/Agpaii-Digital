"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronLeftIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon,
  CheckCircleIcon as CheckCircleSolidIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/solid";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  subject: string;
  difficulty: "mudah" | "sedang" | "sulit";
  score: number;
  explanation?: string;
  createdAt: string;
}

interface Exercise {
  id: number;
  title: string;
  description: string;
  className: string;
  totalQuestions: number;
  deadline: string;
}

export default function BankSoalPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const [searchQuery, setSearchQuery] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("semua");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showAddToExerciseModal, setShowAddToExerciseModal] = useState(false);
  const [selectedQuestionForExercise, setSelectedQuestionForExercise] =
    useState<Question | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const params = new URLSearchParams();

      if (searchQuery) params.append("search", searchQuery);
      if (filterDifficulty !== "semua")
        params.append("difficulty", filterDifficulty);

      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/classedu-questions?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();

      const mappedQuestions: Question[] = (json.data || []).map(
        (item: any) => ({
          id: String(item.id),
          question: item.question,
          options: item.options,
          correctAnswer: item.correct_answer,
          subject: item.subject,
          difficulty: item.difficulty,
          score: Number(item.score ?? 1),
          explanation: item.explanation,
          createdAt: item.created_at?.split("T")[0],
        })
      );

      setQuestions(mappedQuestions);
    } catch (err) {
      console.error("Gagal fetch soal", err);
    }
  };

  // Mock data latihan - nanti ambil dari API/context
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(false);

  // Form state for new/edit question
  const [formData, setFormData] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: -1,
    subject: "Pendidikan Agama Islam",
    difficulty: "sedang" as "mudah" | "sedang" | "sulit",
    score: 1,
    explanation: "",
  });

  const fetchExercises = async () => {
    try {
      setLoadingExercises(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/classedu-exercises`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();
      setAvailableExercises(json.data || []);
    } catch (e) {
      console.error("Gagal fetch latihan", e);
    } finally {
      setLoadingExercises(false);
    }
  };

  // Filter questions
  const filteredQuestions = questions.filter((q) => {
    const matchSearch = q.question
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchDifficulty =
      filterDifficulty === "semua" || q.difficulty === filterDifficulty;
    return matchSearch && matchDifficulty;
  });

  const handleAddQuestion = async () => {
    if (!formData.question.trim() || formData.correctAnswer === -1) {
      alert("Lengkapi pertanyaan dan jawaban benar");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/classedu-questions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            question: formData.question,
            options: formData.options,
            correct_answer: formData.correctAnswer,
            subject: formData.subject,
            difficulty: formData.difficulty,
            score: formData.score,
            explanation: formData.explanation,
          }),
        }
      );

      if (!res.ok) throw new Error("Gagal simpan soal");

      closeModal();
      fetchQuestions();
    } catch (e) {
      alert("Gagal menyimpan soal");
    }
  };

  const handleEditQuestion = async () => {
    if (!editingQuestion) return;

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/classedu-questions/${editingQuestion.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            question: formData.question,
            options: formData.options,
            correct_answer: formData.correctAnswer,
            subject: formData.subject,
            difficulty: formData.difficulty,
            score: formData.score,
            explanation: formData.explanation,
          }),
        }
      );

      closeModal();
      fetchQuestions();
    } catch (e) {
      alert("Gagal update soal");
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Yakin ingin menghapus soal ini?")) return;

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/classedu-questions/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchQuestions();
    } catch (e) {
      alert("Gagal menghapus soal");
    }
  };

  const openEditModal = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      question: question.question,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
      subject: question.subject,
      difficulty: question.difficulty,
      score: question.score,
      explanation: question.explanation || "",
    });
  };

  const resetForm = () => {
    setFormData({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: -1,
      subject: "Pendidikan Agama Islam",
      difficulty: "sedang",
      score: 1,
      explanation: "",
    });
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingQuestion(null);
    resetForm();
  };

  const openAddToExerciseModal = (question: Question) => {
    setSelectedQuestionForExercise(question);
    setShowAddToExerciseModal(true);
    fetchExercises(); // ✅ AMBIL LATIHAN REAL
  };

  const handleAddToExercise = async (exerciseId: number) => {
    if (!selectedQuestionForExercise) return;

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/classedu-exercises/${exerciseId}/questions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            question_ids: [Number(selectedQuestionForExercise.id)],
          }),
        }
      );

      setSuccessMessage("Soal berhasil ditambahkan ke latihan");
      setShowSuccessToast(true);
      setShowAddToExerciseModal(false);
      setSelectedQuestionForExercise(null);

      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (e) {
      alert("Gagal menambahkan soal ke latihan");
    }
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

  return (
    <div className="w-full max-w-[480px] mx-auto bg-slate-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 pt-6 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/kelas-guru" className="p-1">
            <ChevronLeftIcon className="size-6" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold">Bank Soal</h1>
            <p className="text-xs text-blue-100">Kelola koleksi soal Anda</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <MagnifyingGlassIcon className="size-5 text-blue-300 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari soal..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/20 text-white placeholder-blue-200 border border-white/30 focus:outline-none focus:bg-white/30"
          />
        </div>
      </div>

      {/* Filter & Stats */}
      <div className="p-4 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Filter:</span>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="text-sm px-3 py-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="semua">Semua</option>
              <option value="mudah">Mudah</option>
              <option value="sedang">Sedang</option>
              <option value="sulit">Sulit</option>
            </select>
          </div>
          <div className="text-sm text-slate-600">
            <span className="font-semibold text-blue-600">
              {filteredQuestions.length}
            </span>{" "}
            soal
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
        >
          <PlusIcon className="size-5" />
          Tambah Soal Baru
        </button>
      </div>

      {/* Questions List */}
      <div className="p-4 space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-200">
            <ClipboardDocumentListIcon className="size-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">
              {searchQuery ? "Tidak ada soal yang cocok" : "Belum ada soal"}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              {searchQuery
                ? "Coba kata kunci lain"
                : "Klik tombol di atas untuk menambah soal"}
            </p>
          </div>
        ) : (
          filteredQuestions.map((question, index) => (
            <div
              key={question.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-slate-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
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
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(question)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                  >
                    <PencilIcon className="size-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(question.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                  >
                    <TrashIcon className="size-4" />
                  </button>
                </div>
              </div>

              <p className="text-slate-800 font-medium mb-3">
                {question.question}
              </p>

              <div className="space-y-2 mb-3">
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

              {/* Button Tambah ke Latihan */}
              <button
                onClick={() => openAddToExerciseModal(question)}
                className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition"
              >
                <PlusCircleIcon className="size-4" />
                Tambah ke Latihan
              </button>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{question.subject}</span>
                <span>{question.createdAt}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add to Exercise Modal */}
      {showAddToExerciseModal && selectedQuestionForExercise && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-[480px] bg-white rounded-2xl p-4 pb-6 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white pb-2 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-700">
                Tambah ke Latihan
              </h3>
              <button
                onClick={() => {
                  setShowAddToExerciseModal(false);
                  setSelectedQuestionForExercise(null);
                }}
                className="p-1 hover:bg-slate-100 rounded-full"
              >
                <XMarkIcon className="size-6 text-slate-500" />
              </button>
            </div>

            {/* Preview Soal */}
            <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">
                Soal yang akan ditambahkan:
              </p>
              <p className="text-sm font-medium text-slate-700">
                {selectedQuestionForExercise.question}
              </p>
            </div>

            {/* List Latihan */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700 mb-3">
                Pilih Latihan:
              </p>
              {loadingExercises ? (
                <p className="text-center text-sm text-slate-500 py-6">
                  Memuat latihan...
                </p>
              ) : availableExercises.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  <ClipboardDocumentListIcon className="size-12 text-slate-300 mx-auto mb-2" />
                  <p>Belum ada latihan di kelas ini</p>
                  <Link
                    href="/kelas-guru"
                    className="text-blue-600 hover:underline text-xs mt-2 inline-block"
                  >
                    Buat latihan baru
                  </Link>
                </div>
              ) : (
                availableExercises.map((exercise) => (
                  <button
                    key={exercise.id}
                    onClick={() => handleAddToExercise(exercise.id)}
                    className="w-full text-left p-3 border border-slate-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-700 text-sm">
                          {exercise.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {exercise.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                          <span>{exercise.className}</span>
                          <span>•</span>
                          <span>{exercise.totalQuestions} soal</span>
                          <span>•</span>
                          <span>Deadline: {exercise.deadline}</span>
                        </div>
                      </div>
                      <PlusCircleIcon className="size-5 text-teal-600 flex-shrink-0 ml-2" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingQuestion) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-[480px] bg-white rounded-2xl p-4 pb-6 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white pb-2 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-700">
                {editingQuestion ? "Edit Soal" : "Tambah Soal Baru"}
              </h3>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-slate-100 rounded-full"
              >
                <XMarkIcon className="size-6 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Question */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Pertanyaan
                </label>
                <textarea
                  value={formData.question}
                  onChange={(e) =>
                    setFormData({ ...formData, question: e.target.value })
                  }
                  placeholder="Tulis pertanyaan di sini..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tingkat Kesulitan
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      difficulty: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="mudah">Mudah</option>
                  <option value="sedang">Sedang</option>
                  <option value="sulit">Sulit</option>
                </select>
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Pilihan Jawaban (klik huruf untuk pilih jawaban benar)
                </label>
                <div className="space-y-2">
                  {formData.options.map((opt, optIndex) => (
                    <div key={optIndex} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, correctAnswer: optIndex })
                        }
                        className={clsx(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition flex-shrink-0",
                          formData.correctAnswer === optIndex
                            ? "bg-green-500 text-white"
                            : "bg-white border-2 border-slate-300 text-slate-500 hover:border-green-400"
                        )}
                      >
                        {String.fromCharCode(65 + optIndex)}
                      </button>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOptions = [...formData.options];
                          newOptions[optIndex] = e.target.value;
                          setFormData({ ...formData, options: newOptions });
                        }}
                        placeholder={`Pilihan ${String.fromCharCode(
                          65 + optIndex
                        )}`}
                        className={clsx(
                          "flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                          formData.correctAnswer === optIndex
                            ? "border-green-400 bg-green-50"
                            : "border-slate-300"
                        )}
                      />

                      {formData.correctAnswer === optIndex && (
                        <CheckCircleSolidIcon className="size-5 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {/* Score */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Skor Soal
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  value={formData.score}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      score: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Skor yang diperoleh jika soal dijawab benar
                </p>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Pembahasan Jawaban
                </label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      explanation: e.target.value,
                    })
                  }
                  rows={3}
                  placeholder="Jelaskan alasan jawaban yang benar..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none"
                />
              </div>
              {/* Buttons */}
              <div className="flex gap-2 pt-4">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  onClick={
                    editingQuestion ? handleEditQuestion : handleAddQuestion
                  }
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                >
                  {editingQuestion ? "Simpan Perubahan" : "Tambah Soal"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] animate-slide-down">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <CheckCircleSolidIcon className="size-6 flex-shrink-0" />
            <p className="font-medium">{successMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
