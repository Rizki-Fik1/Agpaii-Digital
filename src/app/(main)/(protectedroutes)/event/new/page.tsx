"use client";
import { DevTool } from "@hookform/devtools";
import TopBar from "@/components/nav/topbar";
import { XMarkIcon } from "@heroicons/react/16/solid";
import { useEffect, useState } from "react";
import { MobileDateTimePicker } from "@mui/x-date-pickers/MobileDateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import moment from "moment";
import "moment/locale/id";
import Select from "@/components/select/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/utils/api/config";
import "moment/locale/id";
import Loader from "@/components/loader/loader";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronRightIcon, CalendarDaysIcon, PlusIcon } from "@heroicons/react/24/solid";
import FormControl from "@/components/form/form_control";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";

const schema = z.object({
  name: z.string().min(1, { message: "Nama tidak boleh kosong" }),
  description: z.string().min(1, { message: "Deskripsi tidak boleh kosong" }),
  start_at: z.any(),
  end_at: z.any(),
  category_id: z.string(),
  facilities: z.string().min(1, { message: "Harap tambahkan fasilitas" }),
  address: z.string().min(1, { message: "Harap masukkan alamat" }).nullable(),
  link: z.string().min(1, { message: "Harap masukkan link" }).nullable(),
  image: z.any(),
});
type Fields = z.infer<typeof schema>;
const defaultEventValue: Fields = {
  name: "",
  description: "",
  address: null,
  category_id: "",
  end_at: dayjs(new Date().toISOString()),
  start_at: dayjs(new Date().toISOString()),
  facilities: "",
  link: null,
};

export default function CreateEvent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    control,
    handleSubmit,
    formState: { errors },
    register,
    getValues,
    setValue,
    watch,
  } = useForm<Fields>({
    resolver: zodResolver(schema),
    defaultValues: defaultEventValue,
  });

  // Watch image for preview
  const watchImage = watch("image");

  const [sessions, setSessions] = useState([
    {
      id: 1,
      name: "",
      waktu: null,
      keterangan: "",
    },
  ]);
  const [type, setType] = useState<any>(null);
  const { mutate: createEvent, isPending: creatingEvent } = useMutation({
    mutationFn: async (data: Fields) => {
      try {
        const fd = new FormData();
        // Tambahkan semua field biasa
        fd.append("name", data.name);
        fd.append("description", data.description);
        fd.append("facilities", data.facilities);
        fd.append("category_id", data.category_id);
        fd.append("address", data.address ?? "");
        fd.append("link", data.link ?? "");
        fd.append("type", type);
        // Format tanggal tetap seperti sebelumnya
        fd.append(
          "start_at",
          moment(data.start_at).locale("id").format().split(".")[0].replace(/T/g, " ")
        );
        fd.append(
          "end_at",
          moment(data.end_at).locale("id").format().split(".")[0].replace(/T/g, " ")
        );
        // Jika image diupload → kirim
        if (data.image) {
          fd.append("image", data.image);
        }
        // ================
        // TAMBAH SESSIONS (format waktu jika ada)
        // ================
        const formattedSessions = sessions.map((s) => ({
          ...s,
          waktu: s.waktu ? moment(s.waktu).locale("id").format().split(".")[0].replace(/T/g, " ") : null,
        }));
        fd.append("sessions", JSON.stringify(formattedSessions));
        // KIRIM KE API
        const res = await API.post("/event", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.status === 200) return res.data;
      } catch (err: any) {
        if (err.response && err.response.data)
          return new Error(err.response.data.message);
        else throw new Error(err);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      toast.success("Berhasil membuat event");
      router.push("/event?tab=me");
    },
  });

  // Function tambah sesi
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

  // Function remove sesi
  const removeSession = (index: number) => {
    if (sessions.length > 1) {
      setSessions((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Handle change session field
  const handleSessionChange = (index: number, field: string, value: any) => {
    const updatedSessions = [...sessions];
    updatedSessions[index][field] = value;
    setSessions(updatedSessions);
  };

  const categories = [
    { name: "Seminar", value: 1 },
    { name: "Pelatihan", value: 2 },
    { name: "Workshop", value: 3 },
    { name: "Webinar", value: 4 },
    { name: "Lomba", value: 5 },
    { name: "Rapat", value: 6 },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="pt-[4.21rem] pb-20">
        <TopBar withBackButton>Buat Acara</TopBar>
        {/* FORM EVENT Selection */}
        {type === null ? (
          <div className="flex flex-col pt-8 px-4 sm:px-6 gap-3">
             <h2 className="font-semibold text-lg mb-2">Pilih Tipe Acara</h2>
            <div
              onClick={() => setType("Daring")}
              className="border border-slate-300 p-4 pr-6 rounded-xl flex items-center hover:border-[#009788] hover:bg-slate-50 cursor-pointer transition-all"
            >
              <div>
                <h1 className="text-[#009788] font-bold text-lg">Online</h1>
                <p className="text-slate-500 text-sm pr-5">
                  Buat kegiatan anda secara online dengan menggunakan layanan meeting kami
                </p>
              </div>
              <ChevronRightIcon className="size-6 text-slate-400" />
            </div>
            <div
              onClick={() => setType("Luring")}
              className="border border-slate-300 p-4 pr-6 rounded-xl flex items-center hover:border-[#009788] hover:bg-slate-50 cursor-pointer transition-all"
            >
              <div>
                <h1 className="text-[#009788] font-bold text-lg">Offline</h1>
                <p className="text-slate-500 pr-6 text-sm">
                  Buat kegiatan secara langsung dengan bertemu di tempat yang sudah di tetapkan
                </p>
              </div>
              <ChevronRightIcon className="size-6 text-slate-400" />
            </div>
          </div>
        ) : (
          <form
            method="POST"
            onSubmit={handleSubmit(createEvent as any)}
            className="flex flex-col px-4 sm:px-6 pt-6 gap-6"
          >
            {/* Image Upload Section */}
            <div className="flex flex-col gap-2">
                <Controller
                  control={control}
                  name="image"
                  render={({ field: { value, onChange, ref } }) => (
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
                      <label className="self-start px-4 py-2 bg-[#009788] text-white text-sm font-medium rounded-md cursor-pointer hover:bg-[#3b5e59] transition-colors mt-2">
                        {value ? "Ubah Gambar" : "Tambah Gambar"}
                        <input
                           type="file"
                           className="hidden"
                           accept="image/*"
                           onChange={(e) => {
                             if (e.target.files && e.target.files[0]) {
                               onChange(e.target.files[0]);
                             }
                           }}
                           ref={ref}
                        />
                      </label>
                    </>
                  )}
                />
            </div>

            {/* Name & Category Section */}
            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Acara:</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div className="md:col-span-2">
                         <input
                           {...register("name")}
                           placeholder="Masukkan Nama Acara..."
                           className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-[#009788] focus:ring-1 focus:ring-[#009788]"
                         />
                         {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message as string}</p>}
                     </div>
                     <div>
                       <FormControl
                           name="category_id"
                           type="select"
                           placeholder="Kategori"
                           register={register}
                           options={categories}
                           className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-[#009788] focus:ring-1 focus:ring-[#009788] bg-white appearance-none"
                        />
                         {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id.message as string}</p>}
                     </div>
                  </div>
               </div>
            </div>

            {/* Description Section */}
            <div>
               <label className="block text-sm font-semibold text-slate-700 mb-2">Deskripsi Acara:</label>
               <textarea
                 {...register("description")}
                 placeholder="Masukkan Deskripsi Acara..."
                 rows={4}
                 className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-[#009788] focus:ring-1 focus:ring-[#009788] resize-none"
               />
               {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message as string}</p>}
            </div>

             {/* Facilities Section */}
            <div>
               <label className="block text-sm font-semibold text-slate-700 mb-2">Fasilitas Acara:</label>
               <textarea
                 {...register("facilities")}
                 placeholder="Masukkan Fasilitas Acara..."
                 rows={3}
                 className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-[#009788] focus:ring-1 focus:ring-[#009788] resize-none"
               />
               {errors.facilities && <p className="text-red-500 text-xs mt-1">{errors.facilities.message as string}</p>}
            </div>

            {/* Date Time Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Waktu Mulai:</label>
                  <Controller
                     control={control}
                     name="start_at"
                     render={({ field }) => (
                         <div className="w-full">
                           <MobileDateTimePicker
                               {...field}
                               className="w-full bg-white border-slate-300"
                               slotProps={{
                                 textField: {
                                    size: 'small',
                                    fullWidth: true,
                                    sx: {
                                       '& .MuiOutlinedInput-root': {
                                          borderRadius: '0.5rem',
                                          '& fieldset': { borderColor: '#cbd5e1' },
                                          '&:hover fieldset': { borderColor: '#94a3b8' },
                                          '&.Mui-focused fieldset': { borderColor: '#009788' },
                                       }
                                    }
                                 }
                               }}
                           />
                         </div>
                     )}
                  />
               </div>
               <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Waktu Selesai:</label>
                   <Controller
                     control={control}
                     name="end_at"
                     render={({ field }) => (
                         <div className="w-full">
                           <MobileDateTimePicker
                               {...field}
                               className="w-full bg-white border-slate-300"
                               slotProps={{
                                 textField: {
                                    size: 'small',
                                    fullWidth: true,
                                    sx: {
                                       '& .MuiOutlinedInput-root': {
                                          borderRadius: '0.5rem',
                                          '& fieldset': { borderColor: '#cbd5e1' },
                                          '&:hover fieldset': { borderColor: '#94a3b8' },
                                          '&.Mui-focused fieldset': { borderColor: '#009788' },
                                       }
                                    }
                                 }
                               }}
                           />
                         </div>
                     )}
                  />
               </div>
            </div>

            {/* Location / Link Section (Conditional) */}
            {type === "Daring" ? (
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Link Meeting (opsional):</label>
                  <input
                     {...register("link")}
                     placeholder="Masukkan Link Meeting..."
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-[#009788] focus:ring-1 focus:ring-[#009788]"
                  />
               </div>
            ) : (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tempat Acara:</label>
                  <input
                     {...register("address")}
                     placeholder="Masukkan Tempat Acara..."
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-[#009788] focus:ring-1 focus:ring-[#009788]"
                  />
               </div>
            )}


            {/* Sessions Section */}
            <div className="mt-2">
               <h1 className="text-lg font-bold text-slate-800 mb-4">Sesi Acara:</h1>
               <div className="space-y-4">
                  {sessions.map((session, index) => (
                      <div key={index} className="border border-slate-200 rounded-xl p-4 bg-slate-50 relative">
                          <div className="flex justify-between items-center mb-4">
                             <h3 className="font-semibold text-slate-700">
                                {index === 0 ? "Sesi Pertama" : index === 1 ? "Sesi Kedua" : `Sesi Ke-${index + 1}`}
                             </h3>
                             {sessions.length > 1 && (
                                <button type="button" onClick={() => removeSession(index)} className="text-red-500 text-sm hover:underline">Hapus</button>
                             )}
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-3">
                             {/* Session Date - Using a simple input date for now or we can use MobileDateTimePicker again */}
                             {/* Since state is manual, we use manual MobileDateTimePicker */}
                              <MobileDateTimePicker
                                value={session.waktu}
                                onChange={(val) => handleSessionChange(index, "waktu", val)}
                                slotProps={{
                                 textField: {
                                    size: 'small',
                                    placeholder: 'Waktu',
                                    sx: {
                                       '& .MuiOutlinedInput-root': {
                                          bgcolor: 'white',
                                          borderRadius: '0.5rem',
                                          '& fieldset': { borderColor: '#cbd5e1' },
                                       }
                                    }
                                 }
                               }}
                              />
                              {/* If we needed a separate Time picker, we could split it, but DateTimePicker handles both */}
                              {/* The reference had Date and Time separate, but DateTimePicker is more functional for 'waktu'. Keeping it as DateTimePicker. */}
                          </div>

                          <textarea
                              value={session.keterangan}
                              onChange={(e) => handleSessionChange(index, "keterangan", e.target.value)}
                              placeholder="• Peserta tiba, pembagian welcome drink.&#10;• Icebreaking : Sholawat Nariyah"
                              rows={3}
                              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-[#009788] focus:ring-1 focus:ring-[#009788] resize-none text-sm bg-white"
                          />
                      </div>
                  ))}
               </div>

               <button
                  type="button"
                  onClick={addSession}
                  className="w-full py-3 bg-[#009788] text-white rounded-lg mt-4 font-medium hover:bg-[#3b5e59] transition-colors flex items-center justify-center gap-2"
               >
                  Tambahkan Sesi
               </button>
            </div>


            {/* Footer Buttons */}
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
                     className="px-8 py-2.5 bg-[#009788] text-white rounded-full font-semibold hover:bg-[#3b5e59] transition-colors"
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