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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import API from "@/utils/api/config";
import "moment/locale/id";
import Loader from "@/components/loader/loader";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
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

export default function EditEvent() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [replaceImage, setReplaceImage] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    register,
    getValues,
    setValue,
    reset,
  } = useForm<Fields>({
    resolver: zodResolver(schema),
  });
  const forms = [
    {
      label: "Banner",
      type: "input",
      inputType: "file",
      placeholder: "Tambahkan Banner",
      name: "image",
    },
    {
      label: "Nama Acara",
      type: "input",
      inputType: "text",
      name: "name",
      placeholder: "Masukkan nama acara",
    },
    {
      type: "select",
      label: "Kategori Acara",
      options: [
        { name: "Seminar", value: 1 },
        { name: "Pelatihan", value: 2 },
        { name: "Workshop", value: 3 },
        { name: "Webinar", value: 4 },
        { name: "Lomba", value: 5 },
        { name: "Rapat", value: 6 },
      ],
      name: "category_id",
      placeholder: "Kategori acara",
    },
    {
      label: "Deskripsi Acara",
      type: "textarea",
      inputType: "text",
      name: "description",
      placeholder: "Masukkan deskripsi acara",
    },
    {
      label: "Fasilitas Acara",
      type: "textarea",
      inputType: "text",
      name: "facilities",
      placeholder: "Fasilitas Acara",
    },
    {
      type: "input",
      label: "Tempat Acara",
      inputType: "text",
      name: "address",
      placeholder: "Tempat Acara",
    },
    {
      label: "Link",
      inputType: "text",
      type: "input",
      name: "link",
      placeholder: "Link Meeting",
    },
    {
      label: "Mulai",
      inputType: "date",
      type: "input",
      name: "start_at",
      placeholder: "Waktu Mulai ",
    },
    {
      label: "Selesai",
      inputType: "date",
      type: "input",
      name: "end_at",
      placeholder: "Waktu Selesai",
    },
  ];
  const [sessions, setSessions] = useState([
    {
      id: 1,
      name: "",
      waktu: null,
      keterangan: "",
    },
  ]);
  const [type, setType] = useState<any>(null); // Asumsi type bisa diedit, atau load dari data

  // Fetch event data
  const { data: eventData, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const res = await API.get(`/event/${id}`);
      return res.data;
    },
  });

  // Populate form dan sessions
  useEffect(() => {
    if (eventData) {
      reset({
        name: eventData.name || "",
        description: eventData.description || "",
        address: eventData.address || null,
        category_id: eventData.category_id || "",
        end_at: dayjs(eventData.end_at),
        start_at: dayjs(eventData.start_at),
        facilities: eventData.facilities || "",
        link: eventData.link || null,
        image: null, // Image existing bisa ditampilkan terpisah
      });
      setType(eventData.type || null);
      // Sessions dari session_detail (asumsi array [{id, session_name, session_time, session_keterangan}])
      const loadedSessions = eventData.session_detail?.map((s: any, index: number) => ({
        id: index + 1, // Atau s.id jika ada
        name: s.session_name || "",
        waktu: dayjs(s.session_time) || null,
        keterangan: s.session_keterangan || "",
      })) || [{
        id: 1,
        name: "",
        waktu: null,
        keterangan: "",
      }];
      setSessions(loadedSessions);
    }
  }, [eventData, reset]);

  const { mutate: updateEvent, isPending: updatingEvent } = useMutation({
    mutationFn: async (data: Fields) => {
      try {
        const fd = new FormData();
        fd.append("name", data.name);
        fd.append("description", data.description);
        fd.append("facilities", data.facilities);
        fd.append("category_id", data.category_id);
        fd.append("address", data.address ?? "");
        fd.append("link", data.link ?? "");
        fd.append("type", type);
        fd.append(
          "start_at",
          moment(data.start_at).locale("id").format().split(".")[0].replace(/T/g, " ")
        );
        fd.append(
          "end_at",
          moment(data.end_at).locale("id").format().split(".")[0].replace(/T/g, " ")
        );
        if (data.image) {
          fd.append("image", data.image);
        }
        const formattedSessions = sessions.map((s) => ({
          ...s,
          waktu: s.waktu ? moment(s.waktu).locale("id").format().split(".")[0].replace(/T/g, " ") : null,
        }));
        fd.append("sessions", JSON.stringify(formattedSessions));
        const res = await API.post(`/event/${id}/update`, fd, {
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

  if (isLoading) return <Loader className="size-8 mx-auto mt-20" />;

  const categoryOptions = [
    { name: "Seminar", value: 1 },
    { name: "Pelatihan", value: 2 },
    { name: "Workshop", value: 3 },
    { name: "Webinar", value: 4 },
    { name: "Lomba", value: 5 },
    { name: "Rapat", value: 6 },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="pt-[4.21rem] pb-24 bg-white min-h-screen">
        <TopBar withBackButton>Edit Acara</TopBar>
        <form
          method="POST"
          onSubmit={handleSubmit(updateEvent as any)}
          className="flex flex-col px-4 sm:px-6 pt-6 gap-6 max-w-xl mx-auto"
        >
          {/* Image Upload Section */}
          <div className="flex flex-col gap-2">
            <Controller
              control={control}
              name="image"
              render={({ field: { value, onChange } }) => {
                const imageUrl = value
                  ? URL.createObjectURL(value)
                  : !replaceImage && eventData?.image
                  ? process.env.NEXT_PUBLIC_STORAGE_URL + "/" + eventData.image
                  : "/img/placeholder_image.svg"; // Fallback placeholder if available or handle empty

                const hasImage = value || (!replaceImage && eventData?.image);

                return (
                  <div className="flex flex-col items-start gap-4">
                     {hasImage ? (
                        <div className="w-full aspect-video rounded-xl overflow-hidden shadow-sm border border-slate-200">
                          <img
                            src={imageUrl}
                            className="w-full h-full object-cover"
                            alt="Preview"
                          />
                        </div>
                     ) : (
                        <div className="w-full aspect-video rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                           <span className="text-sm">Belum ada gambar</span>
                        </div>
                     )}
                    
                    <FormControl
                        className="hidden"
                        inputType="file"
                        type="input"
                        name="image"
                        id="image-upload"
                        onChange={(e: any) => {
                            setReplaceImage(true);
                            onChange(e.target.files?.[0] || null);
                        }}
                    />
                    <label
                      htmlFor="image-upload"
                      className="px-4 py-2 bg-[#009788] text-white text-sm font-medium rounded-md cursor-pointer hover:bg-[#355855] transition-colors"
                    >
                      Ubah Gambar
                    </label>
                  </div>
                );
              }}
            />
          </div>

          {/* Nama & Kategori */}
          <div className="flex flex-col gap-1">
             <label className="text-sm font-semibold text-slate-800">Nama Acara:</label>
             <div className="flex gap-3">
                <div className="flex-grow">
                  <FormControl
                    name="name"
                    inputType="text"
                    placeholder="Masukkan Nama Acara..."
                    type="input"
                    register={register}
                    error={errors.name}
                    className="w-full rounded-md border-slate-300 focus:border-[#009788] focus:ring-[#009788]"
                  />
                </div>
                <div className="w-1/3 min-w-[120px]">
                  <FormControl
                    className="appearance-none rounded-md border-slate-300 focus:border-[#009788] focus:ring-[#009788]"
                    type="select"
                    placeholder="Kategori"
                    register={register}
                    name="category_id"
                    options={categoryOptions}
                  />
                </div>
             </div>
          </div>

          {/* Deskripsi */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-slate-800">Deskripsi Acara:</label>
            <FormControl
              name="description"
              inputType="text"
              placeholder="Masukkan Deskripsi Acara..."
              type="textarea"
              register={register}
              error={errors.description}
              className="w-full rounded-md border-slate-300 focus:border-[#009788] focus:ring-[#009788] min-h-[100px]"
            />
          </div>

          {/* Fasilitas */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-slate-800">Fasilitas Acara:</label>
            <FormControl
              name="facilities"
              inputType="text"
              placeholder="Masukkan Fasilitas Acara..."
              type="textarea"
              register={register}
              error={errors.facilities}
              className="w-full rounded-md border-slate-300 focus:border-[#009788] focus:ring-[#009788] min-h-[80px]"
            />
          </div>

           {/* Waktu Mulai & Selesai */}
           <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-slate-800">Waktu Mulai:</label>
                <Controller
                  control={control}
                  name="start_at"
                  render={({ field }) => (
                    <MobileDateTimePicker
                      {...field}
                      format="MM/DD/YYYY HH:mm"
                      className="w-full bg-white rounded-md"
                      slotProps={{
                        textField: {
                          size: "small",
                          fullWidth: true,
                          error: !!errors.start_at,
                          sx: { 
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '0.375rem', 
                                backgroundColor: 'white'
                            }
                          }
                        }
                      }}
                    />
                  )}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-slate-800">Waktu Selesai:</label>
                <Controller
                    control={control}
                    name="end_at"
                    render={({ field }) => (
                      <MobileDateTimePicker
                        {...field}
                        format="MM/DD/YYYY HH:mm"
                        className="w-full bg-white rounded-md"
                        slotProps={{
                            textField: {
                              size: "small",
                              fullWidth: true,
                              error: !!errors.end_at,
                              sx: { 
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '0.375rem', 
                                    backgroundColor: 'white'
                                }
                              }
                            }
                        }}
                      />
                    )}
                />
              </div>
           </div>

          {/* Link / Address based on Logic */}
          <div className={clsx("flex flex-col gap-1", {
             hidden: type === "Luring" 
          })}>
            <label className="text-sm font-semibold text-slate-800">Link Meeting (opsional):</label>
            <FormControl
              name="link"
              inputType="text"
              placeholder="Masukkan Link Meeting..."
              type="input"
              register={register}
              error={errors.link}
              className="w-full rounded-md border-slate-300 focus:border-[#009788] focus:ring-[#009788]"
            />
          </div>

          <div className={clsx("flex flex-col gap-1", {
             hidden: type === "Daring" 
          })}>
             <label className="text-sm font-semibold text-slate-800">Tempat Acara:</label>
             <FormControl
              name="address"
              inputType="text"
              placeholder="Masukkan Tempat Acara..."
              type="input"
              register={register}
              error={errors.address}
              className="w-full rounded-md border-slate-300 focus:border-[#009788] focus:ring-[#009788]"
            />
          </div>

          {/* Sessions */}
          <div className="flex flex-col gap-4">
             <h2 className="text-sm font-semibold text-slate-800">Sesi Acara:</h2>
             
             {sessions.map((session, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4 bg-slate-50 relative space-y-3">
                   {sessions.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeSession(index)}
                        className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1 rounded-full"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                      </button>
                   )}
                   
                   <p className="font-medium text-slate-700">Sesi {index === 0 ? "Pertama" : index === 1 ? "Kedua" : index === 2 ? "Ketiga" : `Ke-${index + 1}`}</p>
                   
                   {/* Date & Time Picker for Session */}
                   <div className="flex items-center gap-2">
                        <MobileDateTimePicker
                             value={session.waktu}
                             onChange={(value) => handleSessionChange(index, "waktu", value)}
                             label="Waktu Sesi"
                             className="w-full bg-white"
                             slotProps={{
                                textField: {
                                size: "small",
                                fullWidth: true,
                                sx: { '& .MuiOutlinedInput-root': { borderRadius: '0.375rem', backgroundColor: 'white' } }
                                }
                             }}
                        />
                   </div>

                   {/* Description (List style in reference, but input here) */}
                   <textarea
                        value={session.name} 
                        onChange={(e) => handleSessionChange(index, "name", e.target.value)}
                        placeholder="Nama Sesi / Kegiatan..."
                        className="w-full text-sm p-3 border border-slate-300 rounded-md focus:outline-none focus:border-[#009788]"
                        rows={2}
                   />
                   
                   <textarea
                        value={session.keterangan} 
                        onChange={(e) => handleSessionChange(index, "keterangan", e.target.value)}
                        placeholder="Detail Keterangan (e.g. Pembicara, Agenda)..."
                        className="w-full text-sm p-3 border border-slate-300 rounded-md focus:outline-none focus:border-[#009788]"
                        rows={3}
                   />
                </div>
             ))}

             <button
                type="button"
                onClick={addSession}
                className="w-full py-3 bg-[#009788] text-white rounded-lg font-medium hover:bg-[#355855] transition-colors"
                style={{ backgroundColor: '#009788' }} // Matching the reference dark green/slate
             >
                Tambahkan Sesi
             </button>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-4 pt-4 mt-4 mb-8">
               <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-medium rounded-full hover:bg-slate-200 transition-colors"
               >
                  Batalkan
               </button>
               <button
                  type="submit"
                  disabled={updatingEvent}
                  className="flex-1 py-3 bg-[#009788] text-white font-medium rounded-full hover:bg-[#355855] transition-colors flex justify-center items-center"
               >
                  {updatingEvent ? <Loader className="size-5 text-white" /> : "Simpan"}
               </button>
          </div>
        </form>
      </div>
    </LocalizationProvider>
  );
}