"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";

const API_BASE = "https://admin.agpaiidigital.org";

import CountdownTimer from "@/components/cbt/CountdownTimer";

type Soal = {
  id: number;
  pertanyaan: string;
  opsi: Record<string, string>;
};

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const latihanId = params.id as string;
  const urlPaketId = searchParams.get("paket_id");

  const [soalList, setSoalList] = useState<Soal[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [jawaban, setJawaban] = useState<Record<number, string>>({});
  const [durasi, setDurasi] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // MODAL STATE
  const [showExitModal, setShowExitModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const currentSoal = soalList[currentIndex];

  // Bump version to force clear old caches (v1 -> v2)
  const SESSION_KEY = `cbt_session_v2_${latihanId}`;

  /* FETCH SOAL & RESTORE SESSION */
  useEffect(() => {
    const initExam = async () => {
      let isRestored = false;

      // 1. Cek LocalStorage
      const savedSession = localStorage.getItem(SESSION_KEY);
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          if (parsed.soalList && parsed.soalList.length > 0) {
            console.log("Restoring session from LocalStorage...");
            // Force sort by ID on restore
            const sortedList = (parsed.soalList || []).sort((a: Soal, b: Soal) => a.id - b.id);
            setSoalList(sortedList);
            setJawaban(parsed.jawaban || {});
            
            // Hitung sisa waktu
            const elapsedSeconds = Math.floor((Date.now() - parsed.timestamp) / 1000);
            const remaining = parsed.originalDuration - elapsedSeconds;
            
            setDurasi(remaining > 0 ? remaining : 0);
            setLoading(false);
            
            isRestored = true;
            // REMOVED 'return' to allow background fetch for updates
          }
        } catch (e) {
          console.error("Error parsing session:", e);
          localStorage.removeItem(SESSION_KEY);
        }
      }

      // 2. Fetch API (Always run to get latest questions)
      try {
        const res = await fetch(`${API_BASE}/api/cbt/latihan/${latihanId}`);
        const json = await res.json();

        if (json.success) {
          // Force sort by ID
          const fetchedSoal = (json.soal || []).sort((a: Soal, b: Soal) => a.id - b.id);
          const fetchedDurasi = (json.durasi || 0) * 60;
          const fetchedPaketId = json.paket_id || (json.paket && json.paket.id);

          // Update State with latest questions
          setSoalList(fetchedSoal);
          
          if (!isRestored) {
            // Initial Load (One time setup)
            setDurasi(fetchedDurasi);
            localStorage.setItem(SESSION_KEY, JSON.stringify({
              soalList: fetchedSoal,
              jawaban: {},
              originalDuration: fetchedDurasi,
              timestamp: Date.now(), // Start time
              paketId: fetchedPaketId
            }));
          } else {
            // Background Update (Merge)
            // Update SoalList in cache, but KEEP original timestamp/answers
            const currentCache = localStorage.getItem(SESSION_KEY);
            if (currentCache) {
               const parsed = JSON.parse(currentCache);
               parsed.soalList = fetchedSoal; // Update questions
               // parsed.jawaban is kept from local state (via auto-save effect)
               // parsed.timestamp is kept
               localStorage.setItem(SESSION_KEY, JSON.stringify(parsed));
               console.log("Updated question list from server");
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (latihanId) initExam();
  }, [latihanId]);

  /* AUTO-SAVE JAWABAN TO LOCALSTORAGE */
  useEffect(() => {
    if (soalList.length === 0) return;

    // Kita hanya update field 'jawaban' di localStorage agar tidak overwrite timestamp
    const savedSession = localStorage.getItem(SESSION_KEY);
    if (savedSession) {
      const parsed = JSON.parse(savedSession);
      parsed.jawaban = jawaban;
      localStorage.setItem(SESSION_KEY, JSON.stringify(parsed));
    }
  }, [jawaban, soalList.length, SESSION_KEY]);

  /* TIMER logic moved to CountdownTimer component */

  /* SIMPAN SATU JAWABAN (Background Sync) */
  const simpanJawaban = async () => {
    if (!currentSoal) return;
    
    // Return the promise so we can await it if needed
    return fetch(`${API_BASE}/api/cbt/latihan/${latihanId}/jawab`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        soal_id: currentSoal.id,
        jawaban: jawaban[currentSoal.id] || "",
      }),
    }).catch(err => console.error("Gagal sync jawaban:", err));
  };

  /* SYNC SEMUA JAWABAN (Force Sync on Submit) */
  const syncAllAnswers = async () => {
    console.log("Syncing all answers before submit...");
    const promises = Object.entries(jawaban).map(([id, val]) => {
      return fetch(`${API_BASE}/api/cbt/latihan/${latihanId}/jawab`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          soal_id: Number(id),
          jawaban: val,
        }),
      }).catch(e => console.error(`Failed to sync soal ${id}:`, e));
    });
    
    await Promise.all(promises);
  };

  const handleNext = () => {
    simpanJawaban(); // Fire and forget
    if (currentIndex < soalList.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  /* SELESAI */
  const handleSelesai = async () => {
    try {
      setSubmitting(true);
      
      // Force sync semua jawaban yang ada di local state/storage
      // untuk memastikan server menerima data terbaru
      await syncAllAnswers();

      const res = await fetch(
        `${API_BASE}/api/cbt/latihan/${latihanId}/selesai`,
        { method: "POST" },
      );

      const json = await res.json();

      if (json.success) {
        // Clear Mapping Resume jika ada
        const savedSession = localStorage.getItem(SESSION_KEY);
        let paketIdToClear = urlPaketId;

        if (savedSession) {
            try {
                const parsed = JSON.parse(savedSession);
                if (parsed.paketId) {
                    paketIdToClear = parsed.paketId;
                }
            } catch(e) { console.error(e); }
        }
        
        if (paketIdToClear) {
            localStorage.removeItem(`cbt_mapper_${paketIdToClear}`);
        }

        // Hapus sesi lokal setelah berhasil submit
        localStorage.removeItem(SESSION_KEY);
        router.push(`/cbt/result/${latihanId}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Memuat soal...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100" style={{ overflowAnchor: "none" }}>
      {/* HEADER */}
      <div className="bg-teal-700 text-white px-4 py-4 flex justify-between items-center">
        <button onClick={() => setShowExitModal(true)}>←</button>
        <span className="font-semibold">Latihan Soal</span>
        <div />
      </div>

      {/* TIMER */}
      <div className="flex justify-center mt-4">
        {durasi > 0 && (
          <CountdownTimer
            initialSeconds={durasi}
            onTimeUp={handleSelesai}
          />
        )}
      </div>

      {/* NOMOR SOAL */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-xl shadow p-3 flex gap-2 overflow-x-auto">
          {soalList.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={clsx(
                "w-10 h-10 rounded-lg text-sm font-semibold",
                i === currentIndex
                  ? "bg-teal-700 text-white"
                  : jawaban[soalList[i].id]
                    ? "bg-teal-200"
                    : "bg-gray-200",
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* SOAL */}
      <div className="px-4 mt-6">
        <div className="bg-white rounded-xl p-6 shadow">
          <div
            dangerouslySetInnerHTML={{
              __html: currentSoal?.pertanyaan || "",
            }}
          />

          <div className="mt-6 space-y-3">
            {Object.entries(currentSoal?.opsi || {}).map(
              ([key, value]) =>
                value && (
                  <label
                    key={key}
                    className={clsx(
                      "flex items-center p-4 border rounded-xl cursor-pointer",
                      jawaban[currentSoal.id] === key
                        ? "border-orange-400 bg-orange-50"
                        : "border-gray-200",
                    )}
                  >
                    <input
                      type="radio"
                      name={`soal-${currentSoal.id}`}
                      value={key}
                      checked={jawaban[currentSoal.id] === key}
                      onChange={(e) =>
                        setJawaban({
                          ...jawaban,
                          [currentSoal.id]: e.target.value,
                        })
                      }
                      className="mr-3"
                    />
                    <span>
                      <strong>{key}.</strong>{" "}
                      <span dangerouslySetInnerHTML={{ __html: value }} />
                    </span>
                  </label>
                ),
            )}
          </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <div className="px-4 mt-6 pb-10">
        <div className="flex justify-between items-center">
          <button onClick={handlePrev}>◀</button>
          <div>
            {currentIndex + 1}/{soalList.length}
          </div>
          <button onClick={handleNext}>▶</button>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          disabled={submitting}
          className="mt-6 w-full bg-green-600 text-white py-3 rounded-xl"
        >
          {submitting ? "Memproses..." : "Submit"}
        </button>
      </div>

      {/* ================= MODAL KELUAR ================= */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-11/12 max-w-sm text-center">
            <h3 className="text-lg font-bold mb-3">Keluar dari Pengerjaan?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Waktu pengerjaan tetap berjalan. Kamu bisa melanjutkan selama
              waktu masih tersedia.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => router.back()}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl"
              >
                Keluar
              </button>
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 bg-gray-200 py-3 rounded-xl"
              >
                Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL SUBMIT ================= */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-11/12 max-w-sm text-center">
            <h3 className="text-lg font-bold mb-3">
              {Object.keys(jawaban).length}/{soalList.length} Soal terisi
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Periksa kembali jawaban sebelum mengirim.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  handleSelesai();
                }}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl"
              >
                Submit
              </button>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 bg-gray-200 py-3 rounded-xl"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
