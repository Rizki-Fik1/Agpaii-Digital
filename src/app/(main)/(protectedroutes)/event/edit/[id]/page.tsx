"use client";

import TopBar from "@/components/nav/topbar";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { MobileDateTimePicker } from "@mui/x-date-pickers/MobileDateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import API from "@/utils/api/config";
import Loader from "@/components/loader/loader";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import FormControl from "@/components/form/form_control";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z
  .object({
    name: z.string().min(1, { message: "Nama tidak boleh kosong" }),
    description: z.string().min(1, { message: "Deskripsi tidak boleh kosong" }),
    start_at: z.any(),
    end_at: z.any(),
    category_id: z.string().min(1, { message: "Kategori wajib dipilih" }),
    facilities: z.string().min(1, { message: "Harap tambahkan fasilitas" }),
    address: z.string().nullable(),
    link: z.string().nullable(),
    image: z.any().optional(),
    event_type: z.string().min(1, { message: "Jenis event wajib dipilih" }),
    province_id: z.string().nullable(),
    city_id: z.string().nullable(),
  })
  .refine(
    (data) =>
      (data.event_type !== "DPW" && data.event_type !== "DPD") ||
      !!data.province_id,
    {
      message: "Provinsi wajib dipilih untuk DPW atau DPD",
      path: ["province_id"],
    }
  )
  .refine((data) => data.event_type !== "DPD" || !!data.city_id, {
    message: "Kota/Kabupaten wajib dipilih untuk DPD",
    path: ["city_id"],
  });

type Fields = z.infer<typeof schema>;

const eventTypeOptions = [
  { name: "Semua Wilayah (ALL)", value: "ALL" },
  { name: "DPP (Pusat)", value: "DPP" },
  { name: "DPW (Provinsi)", value: "DPW" },
  { name: "DPD (Kota/Kabupaten)", value: "DPD" },
];

const categoryOptions = [
  { name: "Seminar", value: "1" },
  { name: "Pelatihan", value: "2" },
  { name: "Workshop", value: "3" },
  { name: "Webinar", value: "4" },
  { name: "Lomba", value: "5" },
  { name: "Rapat", value: "6" },
];

export default function EditEvent() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const queryClient = useQueryClient();

  const [sessions, setSessions] = useState<
    Array<{
      id: number;
      name: string;
      waktu: dayjs.Dayjs | null;
      keterangan: string;
    }>
  >([]);

  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<Fields>({
    resolver: zodResolver(schema),
  });

  const watchImage = watch("image");
  const eventType = watch("event_type");
  const selectedProvince = watch("province_id");

  // Fetch event detail
  const { data: eventData, isLoading: loadingEvent } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const res = await API.get(`/event/${id}`);
      return res.data;
    },
  });

  // Fetch provinces
  const { data: provincesData } = useQuery({
    queryKey: ["provinces"],
    queryFn: async () => {
      const res = await API.get("/province");
      return res.data.data || res.data;
    },
  });

  const provinceOptions =
    provincesData?.map((p: any) => ({
      name: p.name,
      value: String(p.id),
    })) || [];

  // Fetch cities
  const { data: citiesData } = useQuery({
    queryKey: ["cities", selectedProvince],
    queryFn: async () => {
      if (!selectedProvince) return [];
      const res = await API.get(`/province/${selectedProvince}/city`);
      return res.data.data || res.data;
    },
    enabled: !!selectedProvince && eventType === "DPD",
  });

  const cityOptions =
    citiesData?.map((c: any) => ({
      name: c.name,
      value: String(c.id),
    })) || [];

  // Populate form saat data event loaded
  useEffect(() => {
    if (eventData) {
      reset({
        name: eventData.name || "",
        description: eventData.description || "",
        facilities: eventData.facilities || "",
        address: eventData.address || null,
        link: eventData.link || null,
        category_id: String(eventData.category_id) || "",
        start_at: dayjs(eventData.start_at),
        end_at: dayjs(eventData.end_at),
        event_type: eventData.event_type || "",
        province_id: eventData.province_id
          ? String(eventData.province_id)
          : null,
        city_id: eventData.city_id ? String(eventData.city_id) : null,
        image: null,
      });

      // Load sessions
      const loadedSessions =
        eventData.session_detail?.map((s: any, idx: number) => ({
          id: idx + 1,
          name: s.session_name || "",
          waktu: s.session_time ? dayjs(s.session_time) : null,
          keterangan: s.session_keterangan || "",
        })) || [];

      if (loadedSessions.length === 0) {
        loadedSessions.push({ id: 1, name: "", waktu: null, keterangan: "" });
      }
      setSessions(loadedSessions);
    }
  }, [eventData, reset]);

  // Reset province/city jika event_type berubah
  useEffect(() => {
    if (!["DPW", "DPD"].includes(eventType || "")) {
      setValue("province_id", null);
      setValue("city_id", null);
    }
    if (eventType !== "DPD") {
      setValue("city_id", null);
    }
  }, [eventType, setValue]);

  const { mutate: updateEvent, isPending: updating } = useMutation({
    mutationFn: async (data: Fields) => {
      const fd = new FormData();

      fd.append("name", data.name);
      fd.append("description", data.description);
      fd.append("facilities", data.facilities);
      fd.append("category_id", data.category_id);
      fd.append("address", data.address ?? "");
      fd.append("link", data.link ?? "");
      fd.append("type", eventData.type); // type Daring/Luring tidak diubah di edit
      fd.append("event_type", data.event_type);
      fd.append("province_id", data.province_id ?? "");
      fd.append("city_id", data.city_id ?? "");

      fd.append("start_at", dayjs(data.start_at).format("YYYY-MM-DD HH:mm:ss"));
      fd.append("end_at", dayjs(data.end_at).format("YYYY-MM-DD HH:mm:ss"));

      if (data.image) {
        fd.append("image", data.image);
      }

      const formattedSessions = sessions.map((s) => ({
        ...s,
        waktu: s.waktu ? dayjs(s.waktu).format("YYYY-MM-DD HH:mm:ss") : null,
      }));
      fd.append("sessions", JSON.stringify(formattedSessions));

      const res = await API.post(`/event/${id}/update`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event berhasil diperbarui");
      router.push("/event?tab=me");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal memperbarui event");
    },
  });

  const addSession = () => {
    setSessions((prev) => [
      ...prev,
      { id: prev.length + 1, name: "", waktu: null, keterangan: "" },
    ]);
  };

  const removeSession = (index: number) => {
    if (sessions.length > 1) {
      setSessions((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSessionChange = (
    index: number,
    field: "name" | "waktu" | "keterangan",
    value: any
  ) => {
    setSessions((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  if (loadingEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="size-10 text-[#009788]" />
      </div>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="min-h-screen bg-gray-50 pt-[4.21rem] pb-20">
        <TopBar withBackButton>Edit Acara</TopBar>

        <form
          onSubmit={handleSubmit(updateEvent as any)}
          className="flex flex-col px-4 sm:px-6 pt-6 gap-6 max-w-xl mx-auto"
        >
          {/* Banner */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-800">
              Banner Acara
            </label>
            <Controller
              control={control}
              name="image"
              render={({ field: { value, onChange } }) => {
                const currentImageUrl = value
                  ? URL.createObjectURL(value)
                  : eventData?.image
                  ? `${process.env.NEXT_PUBLIC_STORAGE_URL}/${eventData.image}`
                  : null;

                return (
                  <div className="flex flex-col items-start gap-4">
                    {currentImageUrl ? (
                      <div className="w-full aspect-video rounded-xl overflow-hidden shadow-sm border border-slate-200">
                        <img
                          src={currentImageUrl}
                          alt="Banner"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full aspect-video rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                        <span className="text-sm">Belum ada gambar</span>
                      </div>
                    )}

                    <label className="px-4 py-2 bg-[#009788] text-white text-sm font-medium rounded-md cursor-pointer hover:bg-[#007a6e] transition-colors">
                      {currentImageUrl ? "Ganti Gambar" : "Tambah Gambar"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          e.target.files?.[0] && onChange(e.target.files[0])
                        }
                      />
                    </label>
                  </div>
                );
              }}
            />
          </div>

          {/* Nama & Kategori */}
          <div>
            <label className="text-sm font-semibold text-slate-800">
              Nama Acara:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div className="md:col-span-2">
                <input
                  {...register("name")}
                  placeholder="Masukkan nama acara..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-[#009788] focus:ring-1 focus:ring-[#009788]"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <select
                  {...register("category_id")}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-[#009788] focus:ring-1 focus:ring-[#009788] bg-white"
                >
                  <option value="">Pilih kategori</option>
                  {categoryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.category_id.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="text-sm font-semibold text-slate-800">
              Deskripsi Acara:
            </label>
            <textarea
              {...register("description")}
              rows={4}
              placeholder="Masukkan deskripsi acara..."
              className="w-full px-4 py-3 mt-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#009788] resize-none"
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Fasilitas */}
          <div>
            <label className="text-sm font-semibold text-slate-800">
              Fasilitas Acara:
            </label>
            <textarea
              {...register("facilities")}
              rows={3}
              placeholder="Masukkan fasilitas yang disediakan..."
              className="w-full px-4 py-3 mt-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#009788] resize-none"
            />
            {errors.facilities && (
              <p className="text-red-500 text-xs mt-1">
                {errors.facilities.message}
              </p>
            )}
          </div>

          {/* Waktu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-slate-800">
                Waktu Mulai:
              </label>
              <Controller
                control={control}
                name="start_at"
                render={({ field }) => (
                  <MobileDateTimePicker
                    {...field}
                    className="w-full mt-2"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        sx: {
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "0.5rem",
                            "& fieldset": { borderColor: "#cbd5e1" },
                            "&:hover fieldset": { borderColor: "#94a3b8" },
                            "&.Mui-focused fieldset": {
                              borderColor: "#009788",
                            },
                          },
                        },
                      },
                    }}
                  />
                )}
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-800">
                Waktu Selesai:
              </label>
              <Controller
                control={control}
                name="end_at"
                render={({ field }) => (
                  <MobileDateTimePicker
                    {...field}
                    className="w-full mt-2"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        sx: {
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "0.5rem",
                            "& fieldset": { borderColor: "#cbd5e1" },
                            "&:hover fieldset": { borderColor: "#94a3b8" },
                            "&.Mui-focused fieldset": {
                              borderColor: "#009788",
                            },
                          },
                        },
                      },
                    }}
                  />
                )}
              />
            </div>
          </div>

          {/* Jangkauan Acara */}
          <div>
            <label className="text-sm font-bold text-slate-800">
              Jangkauan Acara:
            </label>
            <Controller
              control={control}
              name="event_type"
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full px-4 py-3 mt-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#009788] bg-white"
                >
                  <option value="">Pilih jangkauan...</option>
                  {eventTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.event_type && (
              <p className="text-red-500 text-xs mt-1">
                {errors.event_type.message}
              </p>
            )}
          </div>

          {/* Provinsi */}
          {["DPW", "DPD"].includes(eventType || "") && (
            <div>
              <label className="text-sm font-bold text-slate-800">
                Provinsi:
              </label>
              <Controller
                control={control}
                name="province_id"
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full px-4 py-3 mt-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#009788] bg-white"
                  >
                    <option value="">Pilih provinsi...</option>
                    {provinceOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.province_id && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.province_id.message}
                </p>
              )}
            </div>
          )}

          {/* Kota/Kabupaten */}
          {eventType === "DPD" && (
            <div>
              <label className="text-sm font-bold text-slate-800">
                Kota/Kabupaten:
              </label>
              <Controller
                control={control}
                name="city_id"
                render={({ field }) => (
                  <select
                    {...field}
                    disabled={!selectedProvince}
                    className="w-full px-4 py-3 mt-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#009788] bg-white disabled:bg-slate-100"
                  >
                    <option value="">Pilih kota...</option>
                    {cityOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.city_id && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.city_id.message}
                </p>
              )}
            </div>
          )}

          {/* Link / Address */}
          {eventData?.type === "Daring" && (
            <div>
              <label className="text-sm font-semibold text-slate-800">
                Link Meeting (opsional):
              </label>
              <input
                {...register("link")}
                placeholder="Masukkan link meeting..."
                className="w-full px-4 py-3 mt-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#009788]"
              />
            </div>
          )}

          {eventData?.type === "Luring" && (
            <div>
              <label className="text-sm font-semibold text-slate-800">
                Tempat Acara:
              </label>
              <input
                {...register("address")}
                placeholder="Masukkan tempat acara..."
                className="w-full px-4 py-3 mt-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#009788]"
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.address.message}
                </p>
              )}
            </div>
          )}

          {/* Sessions */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-slate-800">Sesi Acara:</h2>
            {sessions.map((session, index) => (
              <div
                key={index}
                className="border border-slate-200 rounded-xl p-4 bg-slate-50 relative space-y-3"
              >
                {sessions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSession(index)}
                    className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1 rounded-full"
                  >
                    <XMarkIcon className="size-5" />
                  </button>
                )}

                <p className="font-medium text-slate-700">
                  Sesi {index === 0 ? "Pertama" : `Ke-${index + 1}`}
                </p>

                <input
                  type="text"
                  value={session.name}
                  onChange={(e) =>
                    handleSessionChange(index, "name", e.target.value)
                  }
                  placeholder="Nama Sesi / Kegiatan..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-[#009788]"
                />

                <MobileDateTimePicker
                  value={session.waktu}
                  onChange={(val) => handleSessionChange(index, "waktu", val)}
                  className="w-full"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "0.5rem",
                          bgcolor: "white",
                        },
                      },
                    },
                  }}
                />

                <textarea
                  value={session.keterangan}
                  onChange={(e) =>
                    handleSessionChange(index, "keterangan", e.target.value)
                  }
                  placeholder="Keterangan sesi (agenda, pembicara, dll)..."
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-[#009788] resize-none text-sm bg-white"
                />
              </div>
            ))}

            <button
              type="button"
              onClick={addSession}
              className="w-full py-3 bg-[#009788] text-white rounded-lg font-medium hover:bg-[#007a6e] transition-colors"
            >
              Tambahkan Sesi
            </button>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6 pb-10">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 bg-slate-100 text-slate-700 font-medium rounded-full hover:bg-slate-200 transition-colors"
            >
              Batalkan
            </button>
            <button
              type="submit"
              disabled={updating}
              className="flex-1 py-3 bg-[#009788] text-white font-medium rounded-full hover:bg-[#007a6e] transition-colors flex items-center justify-center gap-2"
            >
              {updating ? <Loader className="size-5" /> : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </LocalizationProvider>
  );
}
