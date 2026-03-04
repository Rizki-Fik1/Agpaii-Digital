"use client";

import FormControl from "@/components/form/form_control";
import Loader from "@/components/loader/loader";
import TopBar from "@/components/nav/topbar";
import API from "@/utils/api/config";
import { useAuth } from "@/utils/context/auth_context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

/* ===============================
   FIELD CONFIG
=============================== */

const fields = [
  { name: "name", label: "Nama", type: "input", inputType: "text" },
  { name: "nik", label: "NIK", type: "input", inputType: "text" },
  { name: "nip", label: "NIP", type: "input", inputType: "text" },
  { name: "birthdate", label: "Tanggal Lahir", type: "input", inputType: "date" },
  {
    name: "gender",
    label: "Jenis Kelamin",
    type: "select",
    options: [
      { name: "Laki - laki", value: "L" },
      { name: "Perempuan", value: "P" },
    ],
  },
  { name: "contact", label: "Kontak", type: "input", inputType: "text" },
  {
    name: "educational_level_id",
    label: "Jenjang Ajar",
    type: "select",
    options: [
      { name: "SD", value: 1 },
      { name: "SMP", value: 2 },
      { name: "SMA", value: 3 },
      { name: "SMK", value: 4 },
      { name: "TK", value: 5 },
      { name: "SLB", value: 9 },
    ],
  },
  {
    name: "pensiun",
    label: "Pensiun",
    type: "select",
    options: [
      { name: "Tidak", value: 0 },
      { name: "Ya", value: 1 },
    ],
  },
  { name: "unit_kerja", label: "Unit Kerja", type: "input", inputType: "text" },
  { name: "headmaster_name", label: "Nama Kepala Sekolah", type: "input", inputType: "text" },
  { name: "school_place", label: "Tempat Tugas", type: "input", inputType: "text" },
  {
    name: "school_status",
    label: "Status Sekolah",
    type: "select",
    options: [
      { name: "Negeri", value: "Negeri" },
      { name: "Swasta", value: "Swasta" },
    ],
  },
  { name: "headmaster_nip", label: "NIP Kepala Sekolah", type: "input", inputType: "text" },
];

/* ===============================
   REQUIRED FIELD LIST
=============================== */

const requiredFields = [
  "nik",
  "birthdate",
  "gender",
  "contact",
  "unit_kerja",
  "school_place",
  "school_status",
];

/* ===============================
   VALIDATION
=============================== */

const schema = z.object({
  name: z.string(),
  nik: z.string().min(16),
  nip: z.string().optional(),
  birthdate: z.string(),
  gender: z.string(),
  contact: z.string().min(10),
  unit_kerja: z.string(),
  headmaster_name: z.string().optional(),
  headmaster_nip: z.string().optional(),
  school_place: z.string(),
  school_status: z.string(),
  educational_level_id: z.any(),
  pensiun: z.union([z.literal("0"), z.literal("1"), z.literal(0), z.literal(1)])
    .transform((v) => Number(v)),
});

type FormFields = z.infer<typeof schema>;

const defaultValue: FormFields = {
  name: "",
  nik: "",
  nip: "",
  birthdate: "",
  gender: "",
  contact: "",
  unit_kerja: "",
  headmaster_name: "",
  headmaster_nip: "",
  school_place: "",
  school_status: "",
  educational_level_id: "",
  pensiun: 0,
};

/* ===============================
   COMPONENT
=============================== */

export default function InformationProfile() {
  const { auth: user } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    control,
    formState: { errors },
    register,
    reset,
    handleSubmit,
  } = useForm<FormFields>({
    defaultValues: defaultValue,
    resolver: zodResolver(schema),
  });

  const watchedValues = useWatch({ control });

  /* ===============================
     FIELD EMPTY CHECK
  =============================== */

  const isFieldEmpty = (fieldName: keyof FormFields) => {
    const value = watchedValues?.[fieldName];

    if (value === null || value === undefined) return true;
    if (typeof value === "string" && value.trim() === "") return true;

    return false;
  };

  const getBorderColor = (fieldName: keyof FormFields) => {
    if (!isFieldEmpty(fieldName)) return "border-slate-300 focus:border-[#009788]";

    if (requiredFields.includes(fieldName as string)) {
      return "border-red-500 focus:border-red-500";
    }

    return "border-amber-400 focus:border-amber-400";
  };

  /* ===============================
     SET DEFAULT VALUE
  =============================== */

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        nik: user.profile?.nik ?? "",
        nip: user.profile?.nip ?? "",
        birthdate: user.profile?.birthdate ?? "",
        gender: user.profile?.gender ?? "",
        contact: user.profile?.contact ?? "",
        educational_level_id: user.profile?.educational_level_id ?? "",
        unit_kerja: user.profile?.unit_kerja ?? "",
        headmaster_name: user.profile?.headmaster_name ?? "",
        headmaster_nip: user.profile?.headmaster_nip ?? "",
        school_place: user.profile?.school_place ?? "",
        school_status: user.profile?.school_status ?? "",
        pensiun: user.pensiun ?? 0,
      });
    }
  }, [user, reset]);

  /* ===============================
     SUBMIT
  =============================== */

  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: async (credentials: any) => {
      const res = await API.put(`user/${user?.id}/profile`, credentials);
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth"] });
      toast.success("Berhasil Update Profile");
      router.push("/profile/edit");
    },
  });

  /* ===============================
     RENDER
  =============================== */

  return (
    <div className="pt-[4.21rem] pb-20">
      <TopBar withBackButton>Informasi Umum</TopBar>

      <form
        onSubmit={handleSubmit(updateProfile as any)}
        className="flex flex-col px-[5%] sm:px-6 gap-4 mt-8"
      >
        {fields.map((field) => (
          <div key={field.name}>
            <h1 className="mb-1 text-sm text-slate-700">
              {field.label}
              {requiredFields.includes(field.name) && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </h1>

            <FormControl
              error={errors[field.name as keyof FormFields]}
              register={register}
              name={field.name}
              inputType={field.inputType as any}
              type={field.type}
              options={field.options}
              placeholder={field.label}
              className={`rounded-md appearance-none border px-3 py-2 transition-colors ${getBorderColor(
                field.name as keyof FormFields
              )}`}
            />
          </div>
        ))}

        {isPending ? (
          <div className="mt-8 flex justify-center">
            <Loader className="size-8" />
          </div>
        ) : (
          <button
            type="submit"
            className="px-3 py-2 bg-[#009788] text-white rounded-md mt-8"
          >
            Update
          </button>
        )}
      </form>
    </div>
  );
}