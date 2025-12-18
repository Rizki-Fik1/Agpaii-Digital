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

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="pt-[4.21rem] pb-20">
        <TopBar withBackButton>Edit Acara</TopBar>
        <form
          method="POST"
          onSubmit={handleSubmit(updateEvent as any)}
          className="flex flex-col px-6 pt-6 gap-3"
        >
          {forms.map((f, i) => {
            if (f.type === "input" && f.inputType === "file") {
              return (
                <Controller
                  key={i}
                  control={control}
                  name="image"
                  render={({ field: { value, onChange, ref, name } }) => {
                    // Kondisi 1 - masih pakai gambar lama
                    if (!replaceImage && eventData?.image) {
                      return (
                        <div className="relative">
                          <img
                            src={process.env.NEXT_PUBLIC_STORAGE_URL + "/" + eventData.image}
                            className="size-full object-cover aspect-video rounded-md"
                          />

                          {/* Tombol hapus -> masuk mode upload */}
                          <XMarkIcon
                            className="absolute size-6 -right-1 -top-1.5 cursor-pointer p-1 bg-white rounded-full border border-slate-300"
                            onClick={() => {
                              setReplaceImage(true);
                              onChange(null);
                            }}
                          />
                        </div>
                      );
                    }

                    // Kondisi 2 - user sudah pilih file baru → tampilkan preview
                    if (value) {
                      return (
                        <div className="relative">
                          <img
                            src={URL.createObjectURL(value)}
                            className="size-full object-cover aspect-video rounded-md"
                          />
                          <XMarkIcon
                            onClick={() => onChange(null)}
                            className="absolute size-6 -right-1 -top-1.5 cursor-pointer p-1 bg-white rounded-full border border-slate-300"
                          />
                        </div>
                      );
                    }

                    // Kondisi 3 - mode upload gambar baru
                    return (
                      <FormControl
                        className="size-full"
                        inputType="file"
                        placeholder="Tambahkan Banner"
                        type="input"
                        name={name}
                        refs={ref}
                        onChange={(e) => onChange(e.target.files?.[0] || null)}
                      />
                    );
                  }}
                />
              );
            }

            // Input / textarea
            if (f.type === "input" || f.type === "textarea") {
              return (
                <div
                  key={i}
                  className={clsx("flex flex-col", {
                    hidden:
                      (f.name === "link" && type === "Luring") ||
                      (f.name === "address" && type === "Daring"),
                  })}
                >
                  <label className="text-sm text-slate-700 mb-1">{f.placeholder}</label>
                  <FormControl
                    name={f.name}
                    inputType={f.inputType}
                    placeholder={f.placeholder}
                    type={f.type}
                    register={register}
                    error={errors[f.name as keyof Fields]}
                    className="rounded-md overflow-hidden"
                  />
                </div>
              );
            }

            // Select
            if (f.type === "select") {
              return (
                <FormControl
                  key={i}
                  className="appearance-none rounded-md"
                  type="select"
                  placeholder={f.placeholder}
                  register={register}
                  name={f.name}
                  options={f.options}
                />
              );
            }

            return null;
          })}

          <h1 className="mt-4 text-slate-700">Tambahkan Sesi</h1>
          {sessions.map((session, index) => (
            <div key={index} className="flex flex-col border border-slate-300 rounded-md p-2 relative">
              {sessions.length > 1 && (
                <XMarkIcon
                  onClick={() => removeSession(index)}
                  className="absolute size-5 -right-1 -top-1 cursor-pointer p-0.5 bg-white rounded-full border border-slate-300"
                />
              )}
              <input
                type="text"
                value={session.name}
                onChange={(e) => handleSessionChange(index, "name", e.target.value)}
                placeholder={`Nama Sesi ${session.id}`}
                className="px-3 py-2 border-b border-slate-300"
              />
              <MobileDateTimePicker
                value={session.waktu}
                onChange={(value) => handleSessionChange(index, "waktu", value)}
                className="text-sm border-b border-slate-300 py-2"
                ampm={false}
              />
              <textarea
                value={session.keterangan}
                onChange={(e) => handleSessionChange(index, "keterangan", e.target.value)}
                placeholder="Keterangan Sesi"
                className="px-3 py-2"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addSession}
            className="px-4 py-2 bg-[#009788] text-white rounded-md mt-2"
          >
            Tambah Sesi
          </button>
          {updatingEvent ? (
            <div className="flex justify-center mt-8">
              <Loader className="size-8" />
            </div>
          ) : (
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#009788] rounded-md text-white mt-8"
            >
              Update
            </button>
          )}
        </form>
      </div>
    </LocalizationProvider>
  );
}