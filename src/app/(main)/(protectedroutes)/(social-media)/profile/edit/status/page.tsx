"use client";

import { DevTool } from "@hookform/devtools";
import FormControl from "@/components/form/form_control";
import Loader from "@/components/loader/loader";
import TopBar from "@/components/nav/topbar";
import API from "@/utils/api/config";
import { useAuth } from "@/utils/context/auth_context";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

/* ===============================
   TYPES
=============================== */

type Bank = {
  id: number;
  name: string;
};

/* ===============================
   SCHEMA (ENTERPRISE CONDITIONAL)
=============================== */

const schema = z.object({
  is_pns: z.string(),

  employment_status: z.string(),

  is_tpp_received: z.string().optional(),

  thr_tpg_2023_50: z.string().optional(),
  gaji_13_tpg_2023_50: z.string().optional(),
  thr_tpg_2024_100: z.string().optional(),
  gaji_13_tpg_2024_100: z.string().optional(),

  pendidikan: z.string(),
  jurusan: z.string(),
  kampus: z.string(),

  is_certification: z.string(),
  is_non_pns_inpassing: z.string(),

  pemasukan: z.string(),
  pengeluaran: z.string(),
  kepemilikan_rumah: z.string(),

  bank_id: z.string().optional(),
  bank_account_no: z.string().optional(),
})
  .superRefine((data, ctx) => {
    if (data.is_pns === "1") {
      if (!data.employment_status || data.employment_status.trim() === "") {
        ctx.addIssue({
          path: ["employment_status"],
          code: z.ZodIssueCode.custom,
          message: "Status Kepegawaian wajib diisi untuk ASN",
        });
      }
    }
  });

type Fields = z.infer<typeof schema>;

/* ===============================
   COMPONENT
=============================== */

export default function EditStatus() {
  const { auth: user } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    control,
    watch,
  } = useForm<Fields>({
    resolver: zodResolver(schema),
  });

  const watchedValues = useWatch({ control });
  const isPns = watch("is_pns");

  const employmentStatus = watch("employment_status");
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBankFeatureEnabled, setIsBankFeatureEnabled] = useState(false);

  /* ===============================
     EMPTY CHECK HELPER
  =============================== */

  const isFieldEmpty = (fieldName: keyof Fields) => {
    const value = watchedValues?.[fieldName];
    if (value === null || value === undefined) return true;
    if (typeof value === "string" && value.trim() === "") return true;
    return false;
  };

  const getBorderColor = (fieldName: keyof Fields) => {
    return !isFieldEmpty(fieldName)
      ? "border-slate-300 focus:border-[#009788]"
      : "border-red-500 focus:border-red-500";
  };

  /* ===============================
     INIT DATA
  =============================== */

  useEffect(() => {
    const init = async () => {
      try {
        const featureRes = await fetch(
          `${process.env.NEXT_PUBLIC_MITRA_URL}/api/feature-status/bank_feature`,
        );
        const featureData = await featureRes.json();
        setIsBankFeatureEnabled(featureData.is_enabled);

        const bankRes = await API.get("/bank");
        if (bankRes.status === 200) {
          setBanks(bankRes.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    init();

    if (user?.pns_status) {
  reset({
    is_pns: user.pns_status.is_pns?.toString() ?? "",

    employment_status: user.pns_status.employment_status ?? "",

    is_tpp_received:
      user.pns_status.is_tpp_received?.toString() ?? "",

    thr_tpg_2023_50:
      user.pns_status.thr_tpg_2023_50?.toString() ?? "",

    gaji_13_tpg_2023_50:
      user.pns_status.gaji_13_tpg_2023_50?.toString() ?? "",

    thr_tpg_2024_100:
      user.pns_status.thr_tpg_2024_100?.toString() ?? "",

    gaji_13_tpg_2024_100:
      user.pns_status.gaji_13_tpg_2024_100?.toString() ?? "",

    pendidikan: user.pns_status.pendidikan ?? "",
    jurusan: user.pns_status.jurusan ?? "",
    kampus: user.pns_status.kampus ?? "",

    is_certification:
      user.pns_status.is_certification?.toString() ?? "",

    is_non_pns_inpassing:
      user.pns_status.is_non_pns_inpassing?.toString() ?? "",

    pemasukan: user.pns_status.pemasukan ?? "",
    pengeluaran: user.pns_status.pengeluaran ?? "",
    kepemilikan_rumah:
      user.pns_status.kepemilikan_rumah ?? "",

    bank_account_no:
      user.pns_status.bank_account_no ?? "",

    bank_id:
      user.pns_status.bank_id?.toString() ?? "",
  });
}
  }, [user, reset]);

  /* ===============================
     UPDATE
  =============================== */

  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: async (data: Fields) => {
      const res = await API.post(`/users/${user.id}/updatestatus`, data);
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth"] });
      toast.success("Data Berhasil Di Update");
      router.push("/profile/edit");
    },
    onError: (err: any) => toast.error(err.message),
  });

  /* ===============================
     DYNAMIC FORM CONFIG (SMART)
  =============================== */

  const forms = useMemo(() => {
  const baseForms: any[] = [
    {
      name: "is_pns",
      label: "Status Guru",
      type: "select",
      options: [
        { name: "ASN", value: "1" },
        { name: "Non ASN", value: "0" },
      ],
    },

    {
      name: "employment_status",
      label: "Status Kepegawaian",
      type: "select",
      options:
        isPns === "1"
          ? [
              { name: "PNS Pemda", value: "PNS Pemda" },
              { name: "PNS Kemenag", value: "PNS Kemenag" },
              { name: "PPPK Pemda", value: "PPPK Pemda" },
              { name: "PPPK Kemenag", value: "PPPK Kemenag" },
            ]
          : [
              { name: "Guru Tetap Yayasan", value: "Guru Tetap Yayasan" },
              { name: "Honor Yayasan", value: "Honor Yayasan" },
              { name: "Honor Daerah/KKI/PJLP", value: "Honor Daerah/KKI/PJLP" },
              { name: "Honor Murni Sekolah", value: "Honor Murni Sekolah" },
            ],
    },
  ];

  if (isPns === "1") {
    baseForms.push({
      name: "is_tpp_received",
      label:
        "Sudah mendapat TPP/TKD/Tamsil/Tunjangan Daerah/Tukin?",
      type: "select",
      options: [
        { name: "Sudah", value: "1" },
        { name: "Belum", value: "0" },
      ],
    });
  }

  if (
    employmentStatus === "PNS Pemda" ||
    employmentStatus === "PPPK Pemda"
  ) {
    baseForms.push(
      {
        name: "thr_tpg_2023_50",
        label: "THR TPG 2023 50%",
        type: "select",
        options: [
          { name: "Sudah", value: "1" },
          { name: "Belum", value: "0" },
        ],
      },
      {
        name: "gaji_13_tpg_2023_50",
        label: "Gaji 13 TPG 2023 50%",
        type: "select",
        options: [
          { name: "Sudah", value: "1" },
          { name: "Belum", value: "0" },
        ],
      },
      {
        name: "thr_tpg_2024_100",
        label: "THR TPG 2024 100%",
        type: "select",
        options: [
          { name: "Sudah", value: "1" },
          { name: "Belum", value: "0" },
        ],
      },
      {
        name: "gaji_13_tpg_2024_100",
        label: "Gaji 13 TPG 2024 100%",
        type: "select",
        options: [
          { name: "Sudah", value: "1" },
          { name: "Belum", value: "0" },
        ],
      }
    );
  }

  baseForms.push(
    {
      name: "pendidikan",
      label: "Pendidikan",
      type: "select",
      options: [
        { name: "S1", value: "S1" },
        { name: "S2", value: "S2" },
        { name: "S3", value: "S3" },
      ],
    },
    { name: "jurusan", label: "Program Studi", type: "input" },
    { name: "kampus", label: "Universitas/Kampus", type: "input" },
    {
      name: "is_certification",
      label: "Sudah Sertifikasi?",
      type: "select",
      options: [
        { name: "Sudah", value: "1" },
        { name: "Belum", value: "0" },
      ],
    },
    {
      name: "is_non_pns_inpassing",
      label: "Sudah Inpassing?",
      type: "select",
      options: [
        { name: "Sudah", value: "1" },
        { name: "Belum", value: "0" },
      ],
    },
    {
      name: "pemasukan",
      label: "Pemasukan",
      type: "select",
      options: [
        { name: "0 - 5 Juta", value: "0 - 5 Juta" },
        { name: "5 - 10 Juta", value: "5 - 10 Juta" },
        { name: "Diatas 10 Juta", value: "Diatas 10 Juta" },
      ],
    },
    {
      name: "pengeluaran",
      label: "Pengeluaran",
      type: "select",
      options: [
        { name: "0 - 5 Juta", value: "0 - 5 Juta" },
        { name: "5 - 10 Juta", value: "5 - 10 Juta" },
        { name: "Diatas 10 Juta", value: "Diatas 10 Juta" },
      ],
    },
    {
      name: "kepemilikan_rumah",
      label: "Kepemilikan Rumah",
      type: "select",
      options: [
        { name: "Milik Sendiri", value: "Milik Sendiri" },
        { name: "Orang Tua", value: "Orang Tua" },
        { name: "Sewa", value: "Sewa" },
      ],
    }
  );

  if (isBankFeatureEnabled) {
    baseForms.push(
      {
        name: "bank_id",
        label: "Bank",
        type: "select",
        options: banks.map((bank) => ({
          name: bank.name,
          value: bank.id.toString(),
        })),
      },
      {
        name: "bank_account_no",
        label: "No Rekening",
        type: "input",
      }
    );
  }

  return baseForms;
}, [isPns, employmentStatus, banks, isBankFeatureEnabled]);

  /* ===============================
     LOADING
  =============================== */

  if (isLoading) {
    return (
      <div className="pt-[4.21rem] pb-20">
        <TopBar withBackButton>Edit Status Guru</TopBar>
        <div className="flex justify-center items-center h-64">
          <Loader className="size-8" />
        </div>
      </div>
    );
  }

  /* ===============================
     RENDER
  =============================== */

  return (
    <div className="pb-20 pt-[4.21rem]">
      <TopBar withBackButton>Edit Status Guru</TopBar>

      <form
        onSubmit={handleSubmit(updateStatus)}
        className="flex flex-col px-6 pt-8 gap-3"
      >
        {forms.map((field, i) => (
          <div key={i} className="flex flex-col">
            <h1 className="text-sm text-slate-700 mb-1">
              {field.label}
              {isFieldEmpty(field.name) && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </h1>

            <FormControl
              type={field.type}
              register={register}
              name={field.name}
              placeholder={field.label}
              inputType="text"
              options={field.options}
              className={`rounded-md border px-3 py-2 ${getBorderColor(
                field.name,
              )}`}
              error={errors[field.name]}
            />
          </div>
        ))}

        {isPending ? (
          <div className="flex mt-10 justify-center">
            <Loader className="size-8" />
          </div>
        ) : (
          <button
            type="submit"
            className="mt-8 px-4 py-2 rounded-md bg-[#009788] text-white"
          >
            Submit
          </button>
        )}
      </form>

      <DevTool control={control} />
    </div>
  );
}