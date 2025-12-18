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
import { ChevronRightIcon } from "@heroicons/react/24/solid";
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
  } = useForm<Fields>({
    resolver: zodResolver(schema),
    defaultValues: defaultEventValue,
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

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="pt-[4.21rem] pb-20">
        <TopBar withBackButton>Buat Acara</TopBar>
        {/* FORM EVENT */}
        {type === null ? (
          <div className="flex flex-col pt-8 px-4 sm:px-6 gap-3">
            <div
              onClick={() => setType("Daring")}
              className="border border-slate-300 p-4 pr-6 rounded-md flex items-center"
            >
              <div>
                <h1 className="text-slate-600 font-medium ">Online</h1>
                <p className="text-slate-500 text-sm pr-5">
                  Buat kegiatan anda secara online dengan menggunakan layanan
                  meeting kami
                </p>
              </div>
              <ChevronRightIcon className="size-6" />
            </div>
            <div
              onClick={() => setType("Luring")}
              className="border border-slate-300 p-4 pr-6 rounded-md flex items-center"
            >
              <div>
                <h1 className="text-slate-600 font-medium ">Offline</h1>
                <p className="text-slate-500 pr-6 text-sm">
                  Buat kegiatan secara langsung dengan bertemu di tempat yang
                  sudah di tetapkan
                </p>
              </div>
              <ChevronRightIcon className="size-6" />
            </div>
          </div>
        ) : (
          <form
            method="POST"
            onSubmit={handleSubmit(createEvent as any)}
            className="flex flex-col px-6 pt-6 gap-3"
          >
            {forms.map((f, i) => {
              return f.type == "input" && f.inputType == "file" ? (
                <Controller
                  key={i}
                  control={control}
                  name={f.name as keyof Fields}
                  render={({ field: { value, onChange, ref, name } }) => (
                    <div className="flex relative *:w-full aspect-video">
                      {getValues(f.name as keyof Fields) == null ? (
                        <FormControl
                          className="size-full"
                          onChange={(e) =>
                            onChange(e.target.files && e.target.files[0])
                          }
                          inputType={f.inputType as any}
                          placeholder={f.placeholder}
                          value={value}
                          type={f.type}
                          name={name}
                          refs={ref}
                        />
                      ) : (
                        <>
                          <img
                            src={URL.createObjectURL(
                              getValues(f.name as keyof Fields)
                            )}
                            className="size-full object-cover aspect-video rounded-md"
                          />
                          <XMarkIcon
                            onClick={() =>
                              setValue(f.name as keyof Fields, null)
                            }
                            className="absolute size-6 -right-1 -top-1.5 cursor-pointer !w-fit p-1 bg-white rounded-full border border-slate-300"
                          />
                        </>
                      )}
                    </div>
                  )}
                />
              ) : f.type == "input" && f.inputType == "date" ? (
                <Controller
                  key={i}
                  name={f.name as keyof Fields}
                  control={control}
                  render={({ field: { value, onChange, ref, name } }) => (
                    <div className="flex flex-col">
                      <label
                        className="text-sm text-slate-700 mb-1"
                        htmlFor={f.name}
                      >
                        {f.label}
                      </label>
                      <MobileDateTimePicker
                        name={name}
                        ref={ref}
                        onChange={(value) => onChange(value)}
                        value={value}
                        ampm={false}
                      />
                    </div>
                  )}
                />
              ) : f.type == "input" || f.type == "textarea" ? (
                <div
                  key={i}
                  className={clsx("flex flex-col", {
                    hidden:
                      (f.name == "link" && type == "Luring") ||
                      (f.name == "address" && type == "Daring"),
                  })}
                >
                  <label
                    className="text-sm text-slate-700 mb-1"
                    htmlFor={f.name}
                  >
                    {f.placeholder}
                  </label>
                  <FormControl
                    key={i}
                    name={f.name}
                    inputType={f.inputType as any}
                    placeholder={f.placeholder}
                    type={f.type}
                    register={register}
                    error={errors[f.name as keyof Fields]}
                    className="rounded-md overflow-hidden"
                  />
                </div>
              ) : (
                f.type == "select" && (
                  <FormControl
                    key={i}
                    className="appearance-none rounded-md"
                    type={f.type}
                    placeholder={f.placeholder}
                    register={register}
                    name={f.name}
                    options={f.options}
                  />
                )
              );
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
            {creatingEvent ? (
              <div className="flex justify-center mt-8">
                <Loader className="size-8" />
              </div>
            ) : (
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#009788] rounded-md text-white mt-8"
              >
                Submit
              </button>
            )}
          </form>
        )}
      </div>
    </LocalizationProvider>
  );
}