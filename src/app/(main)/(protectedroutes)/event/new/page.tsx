"use client";

import TopBar from "@/components/nav/topbar";
import { XMarkIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { MobileDateTimePicker } from "@mui/x-date-pickers/MobileDateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import Select from "@/components/select/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import API from "@/utils/api/config";
import Loader from "@/components/loader/loader";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import FormControl from "@/components/form/form_control";
import { Controller, useForm, watch, useWatch } from "react-hook-form";
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
    image: z.any(), // bisa diperketat lagi nanti dengan instanceof(File)
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

const defaultEventValue: Fields = {
  name: "",
  description: "",
  address: null,
  category_id: "",
  end_at: dayjs(),
  start_at: dayjs(),
  facilities: "",
  link: null,
  image: null,
  event_type: "",
  province_id: null,
  city_id: null,
};

const eventTypeOptions = [
  { name: "Semua Wilayah (ALL)", value: "ALL" },
  { name: "DPP (Pusat)", value: "DPP" },
  { name: "DPW (Provinsi)", value: "DPW" },
  { name: "DPD (Kota/Kabupaten)", value: "DPD" },
];

const categories = [
  { name: "Seminar", value: "1" },
  { name: "Pelatihan", value: "2" },
  { name: "Workshop", value: "3" },
  { name: "Webinar", value: "4" },
  { name: "Lomba", value: "5" },
  { name: "Rapat", value: "6" },
];

export default function CreateEvent() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Fields>({
    resolver: zodResolver(schema),
    defaultValues: defaultEventValue,
  });

  const watchImage = watch("image");
  const eventType = watch("event_type");
  const selectedProvince = watch("province_id");

  const [sessions, setSessions] = useState([
    {
      id: 1,
      name: "",
      waktu: null as dayjs.Dayjs | null,
      keterangan: "",
    },
  ]);
  const [type, setType] = useState<"Daring" | "Luring" | null>(null);

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

  // Fetch cities (only when DPD and province selected)
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

  // Reset dependent fields when event_type changes
  useEffect(() => {
    if (!["DPW", "DPD"].includes(eventType)) {
      setValue("province_id", null);
      setValue("city_id", null);
    }
    if (eventType !== "DPD") {
      setValue("city_id", null);
    }
  }, [eventType, setValue]);

  const { mutate: createEvent, isPending: creatingEvent } = useMutation({
    mutationFn: async (data: Fields) => {
      const fd = new FormData();
      fd.append("name", data.name);
      fd.append("description", data.description);
      fd.append("facilities", data.facilities);
      fd.append("category_id", data.category_id);
      fd.append("address", data.address ?? "");
      fd.append("link", data.link ?? "");
      fd.append("type", type!); // pasti sudah dipilih karena form muncul setelah pilih type
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

      const res = await API.post("/event", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("Berhasil membuat event");
      router.push("/event?tab=me");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal membuat event");
    },
  });

  const addSession = () => {
    setSessions((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        name: "",
        waktu: null,
        keterangan: "",
      },
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

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="min-h-screen bg-gray-50 pt-[4.21rem] pb-20">
        <TopBar withBackButton>Buat Acara</TopBar>

        {/* Pilih Tipe Acara */}
        {type === null ? (
          <div className="flex flex-col pt-8 px-4 sm:px-6 gap-3">
            <h2 className="font-semibold text-lg mb-2">Pilih Tipe Acara</h2>
            <div
              onClick={() => setType("Daring")}
              className="border border-slate-300 p-4 pr-6 rounded-xl flex items-center hover:border-[#009788] hover:bg-slate-50 cursor-pointer transition-all"
            >
              <div className="flex-1">
                <h1 className="text-[#009788] font-bold text-lg">Online</h1>
                <p className="text-slate-500 text-sm pr-5">
                  Buat kegiatan anda secara online dengan menggunakan layanan
                  meeting kami
                </p>
              </div>
              <ChevronRightIcon className="size-6 text-slate-400" />
            </div>
            <div
              onClick={() => setType("Luring")}
              className="border border-slate-300 p-4 pr-6 rounded-xl flex items-center hover:border-[#009788] hover:bg-slate-50 cursor-pointer transition-all"
            >
              <div className="flex-1">
                <h1 className="text-[#009788] font-bold text-lg">Offline</h1>
                <p className="text-slate-500 pr-6 text-sm">
                  Buat kegiatan secara langsung dengan bertemu di tempat yang
                  sudah ditetapkan
                </p>
              </div>
              <ChevronRightIcon className="size-6 text-slate-400" />
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(createEvent as any)}
            className="flex flex-col px-4 sm:px-6 pt-6 gap-6"
          >
            {/* Banner Upload */}
            <div className="flex flex-col gap-2">
              <Controller
                control={control}
                name="image"
                render={({ field: { value, onChange } }) => (
                  <>
                    <div className="w-full aspect-video bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative">
                      {value ? (
                        <img
                          src={URL.createObjectURL(value)}
                          className="w-full h-full object-cover"
                          alt="Preview"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                          <span className="text-sm">Belum ada gambar</span>
                        </div>
                      )}
                    </div>
                    <label className="self-start px-4 py-2 bg-[#009788] text-white text-sm font-medium rounded-md cursor-pointer hover:bg-[#007a6e] transition-colors mt-2">
                      {value ? "Ubah Gambar" : "Tambah Gambar"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          e.target.files?.[0] && onChange(e.target.files[0])
                        }
                      />
                    </label>
                  </>
                )}
              />
            </div>

            {/* Nama & Kategori */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nama Acara:
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <input
                      {...register("name")}
                      placeholder="Masukkan Nama Acara..."
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-[#009788] focus:ring-1 focus:ring-[#009788]"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <FormControl
                      name="category_id"
                      type="select"
                      placeholder="Kategori"
                      register={register}
                      options={categories}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-[#009788] focus:ring-1 focus:ring-[#009788] bg-white"
                    />
                    {errors.category_id && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.category_id.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Deskripsi & Fasilitas */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Deskripsi Acara:
              </label>
              <textarea
                {...register("description")}
                placeholder="Masukkan Deskripsi Acara..."
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-[#009788] focus:ring-1 focus:ring-[#009788] resize-none"
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Fasilitas Acara:
              </label>
              <textarea
                {...register("facilities")}
                placeholder="Masukkan Fasilitas Acara..."
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-[#009788] focus:ring-1 focus:ring-[#009788] resize-none"
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
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  Waktu Mulai:
                </label>
                <Controller
                  control={control}
                  name="start_at"
                  render={({ field }) => (
                    <MobileDateTimePicker
                      {...field}
                      className="w-full"
                      slotProps={{
                        textField: {
                          size: "small",
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
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  Waktu Selesai:
                </label>
                <Controller
                  control={control}
                  name="end_at"
                  render={({ field }) => (
                    <MobileDateTimePicker
                      {...field}
                      className="w-full"
                      slotProps={{
                        textField: {
                          size: "small",
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

            {/* Jangkauan Event + Provinsi + Kota */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Jangkauan Acara:
              </label>
              <Controller
                control={control}
                name="event_type"
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-[#009788] focus:ring-1 focus:ring-[#009788] bg-white"
                  >
                    <option value="">Pilih jangkauan acara...</option>
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

            {["DPW", "DPD"].includes(eventType) && (
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  Provinsi:
                </label>
                <Controller
                  control={control}
                  name="province_id"
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-[#009788] focus:ring-1 focus:ring-[#009788] bg-white"
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

            {eventType === "DPD" && (
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  Kota/Kabupaten:
                </label>
                <Controller
                  control={control}
                  name="city_id"
                  render={({ field }) => (
                    <select
                      {...field}
                      disabled={!selectedProvince}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-[#009788] focus:ring-1 focus:ring-[#009788] bg-white disabled:bg-slate-100"
                    >
                      <option value="">Pilih kota/kabupaten...</option>
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

            {/* Lokasi / Link */}
            {type === "Daring" ? (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Link Meeting (opsional):
                </label>
                <input
                  {...register("link")}
                  placeholder="Masukkan Link Meeting..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-[#009788] focus:ring-1 focus:ring-[#009788]"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Tempat Acara:
                </label>
                <input
                  {...register("address")}
                  placeholder="Masukkan Tempat Acara..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-[#009788] focus:ring-1 focus:ring-[#009788]"
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.address.message}
                  </p>
                )}
              </div>
            )}

            {/* Sesi Acara */}
            <div className="mt-2">
              <h1 className="text-lg font-bold text-slate-800 mb-4">
                Sesi Acara:
              </h1>
              <div className="space-y-4">
                {sessions.map((session, index) => (
                  <div
                    key={index}
                    className="border border-slate-200 rounded-xl p-4 bg-slate-50 relative"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-slate-700">
                        {index === 0 ? "Sesi Pertama" : `Sesi Ke-${index + 1}`}
                      </h3>
                      {sessions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSession(index)}
                          className="text-red-500 text-sm hover:underline"
                        >
                          Hapus
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={session.name}
                      onChange={(e) =>
                        handleSessionChange(index, "name", e.target.value)
                      }
                      placeholder="Nama Sesi"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg mb-3 focus:outline-none focus:border-[#009788]"
                    />

                    <MobileDateTimePicker
                      value={session.waktu}
                      onChange={(val) =>
                        handleSessionChange(index, "waktu", val)
                      }
                      slotProps={{
                        textField: {
                          size: "small",
                          fullWidth: true,
                          placeholder: "Waktu Sesi",
                          sx: {
                            "& .MuiOutlinedInput-root": {
                              bgcolor: "white",
                              borderRadius: "0.5rem",
                              "& fieldset": { borderColor: "#cbd5e1" },
                            },
                          },
                        },
                      }}
                      className="mb-3"
                    />

                    <textarea
                      value={session.keterangan}
                      onChange={(e) =>
                        handleSessionChange(index, "keterangan", e.target.value)
                      }
                      placeholder="Keterangan sesi..."
                      rows={3}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-[#009788] resize-none text-sm bg-white"
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addSession}
                className="w-full py-3 bg-[#009788] text-white rounded-lg mt-4 font-medium hover:bg-[#007a6e] transition-colors"
              >
                Tambahkan Sesi
              </button>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-6 pb-10">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2.5 bg-gray-100 text-slate-700 rounded-full font-semibold hover:bg-gray-200 transition-colors"
              >
                Batalkan
              </button>
              {creatingEvent ? (
                <div className="px-8 py-2.5 flex items-center justify-center">
                  <Loader className="size-6 text-[#009788]" />
                </div>
              ) : (
                <button
                  type="submit"
                  className="px-8 py-2.5 bg-[#009788] text-white rounded-full font-semibold hover:bg-[#007a6e] transition-colors"
                >
                  Simpan
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </LocalizationProvider>
  );
}
