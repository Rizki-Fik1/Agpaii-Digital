"use client";

import { useParams, useRouter } from "next/navigation";
import API from "@/utils/api/config";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import clsx from "clsx";
import { getImage } from "@/utils/function/function";

export default function AddParticipantPage() {
  const { id: eventId } = useParams();
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedSession, setSelectedSession] = useState<number | null>(null);

  const [modalOpen, setModalOpen] = useState(false);

  // GET ALL USERS
  const getUsers = async () => {
    const res = await API.get("/users?limit=20&search=" + search);
    setUsers(res.data.data);
  };

  useEffect(() => {
    getUsers();
  }, [search]);

  // GET SESSION EVENT
  useEffect(() => {
    (async () => {
      const res = await API.get(`/event/${eventId}`);
      setSessions(res.data.session_detail || []);
    })();
  }, []);

  const addParticipant = async () => {
    try {
      const form = new FormData();
      form.append("event_id", eventId);
      form.append("user_id", selectedUser.id);
      form.append("session_id", selectedSession);

      const res = await API.post("/event/participant/new", form);

      toast.success("Peserta berhasil ditambahkan!");
      router.back();
    } catch (e) {
      toast.error("Gagal menambahkan peserta");
    }
  };

  return (
    <div className="pt-[4.21rem] px-4 pb-20">
      <h1 className="font-semibold text-lg mt-4">Tambah Peserta</h1>

      {/* Search */}
      <input
        className="w-full border px-4 py-3 bg-slate-100 rounded-full mt-4"
        placeholder="Cari peserta..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* USER LIST */}
      <div className="mt-6">
        {users?.map((u) => (
          <div
            key={u.id}
            onClick={() => {
              setSelectedUser(u);
              setModalOpen(true);
            }}
            className="flex items-center gap-3 border-b py-3 cursor-pointer"
          >
            <img
              src={getImage(u.avatar) || "/img/default-user.png"}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <div className="font-medium">{u.name}</div>
              <div className="text-xs text-slate-500">{u.email}</div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL KONFIRMASI */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] max-w-md shadow-lg">
            <h2 className="font-semibold text-lg text-center">
              Tambah Peserta
            </h2>

            <div className="flex items-center gap-3 mt-4">
              <img
                src={getImage(selectedUser?.avatar) || "/img/default-user.png"}
                className="w-14 h-14 rounded-full"
              />
              <div>
                <div className="font-semibold">{selectedUser?.name}</div>
                <div className="text-xs text-slate-500">
                  {selectedUser?.email}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-slate-600 mb-2">Pilih Sesi:</p>
              <div className="flex gap-2 flex-wrap">
                {sessions.map((s) => (
                  <button
                    key={s.id}
                    className={clsx(
                      "px-4 py-2 rounded-full text-sm border",
                      selectedSession === s.id
                        ? "bg-[#009788] text-white"
                        : "border-slate-300"
                    )}
                    onClick={() => setSelectedSession(s.id)}
                  >
                    {s.session_name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                className="w-1/2 py-2 border border-slate-400 rounded-md"
                onClick={() => setModalOpen(false)}
              >
                Batal
              </button>
              <button
                className="w-1/2 py-2 bg-[#009788] text-white rounded-md"
                onClick={addParticipant}
              >
                Tambah
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
