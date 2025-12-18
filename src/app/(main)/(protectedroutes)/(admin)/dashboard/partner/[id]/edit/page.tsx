"use client";
import Loader from "@/components/loader/loader";
import Select from "@/components/select/select";
import API from "@/utils/api/config";
import {
  ChevronRightIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/16/solid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";

const getImage = (url: string) =>
  `${process.env.NEXT_PUBLIC_STORAGE_URL}/${url}`;

export default function EditPartnerPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: partnerToEdit, isLoading } = useQuery({
    queryKey: ["partner", id],
    queryFn: async () => {
      const res = await API.get(`/partner/${id}`);
      console.log(res);

      if (res.status == 200) return res.data;
    },
  });

  const { mutate: updatePartner, isPending: pendingUpdate } = useMutation({
    mutationFn: async (data: any) => {
      const res = await API.post(`partner/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.status == 200) return res.data;
      else return null;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["partners"] });
      await queryClient.invalidateQueries({ queryKey: ["partner", id] });
      router.push("/dashboard/partner");
    },
  });

  const { data: partners } = useQuery({
    queryKey: ["partners"],
    queryFn: async () => {
      const res = await API.get("/partner");
      if (res.status == 200) return res.data;
    },
  });

  const forms = [
    {
      name: "name",
      label: "Nama",
      form_type: "input",
    },
    {
      name: "parent_partner_id",
      label: "Kategori",
      form_type: "select",
      options: !!partners
        ? [
            ...partners.map((partner: any) => ({
              name: partner.name,
              value: partner.id,
            })),
            { name: "Tidak ada", value: 0 },
          ]
        : [],
    },
    {
      name: "url",
      label: "Url",
      form_type: "input",
    },
    {
      name: "description",
      label: "Deskripsi",
      form_type: "textarea",
    },
  ];

  const [credentials, setCredentials] = useState({
    image: null,
    cover_image: null,
    name: "",
    parent_partner_id: "",
    description: "",
    url: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, id } = e.target;
    setCredentials((c) => ({ ...c, [id]: value }));
  };

  useEffect(() => {
    if (!!partnerToEdit) {
      setCredentials({
        image: partnerToEdit.image,
        name: partnerToEdit.name,
        parent_partner_id: partnerToEdit.parent_partner_id,
        cover_image: partnerToEdit.cover_image,
        description: partnerToEdit.description,
        url: partnerToEdit.url,
      });
    }
  }, [partnerToEdit]);

  const getPartnerImage = (image: any) =>
    typeof image == "string" ? getImage(image) : URL.createObjectURL(image);

  return (
    <div className="py-8 sm:py-8 lg:py-12 px-6">
      <div className="flex gap-2.5 text-[#009788] items-center flex-wrap">
        <h1 className="text-lg sm:text-3xl font-semibold w-max">Edit Mitra </h1>
        <ChevronRightIcon className="size-5 mt-1" />
        <h2>{partnerToEdit?.name}</h2>
      </div>
      {!isLoading ? (
        <form
          method="POST"
          onSubmit={(e) => {
            e.preventDefault();
            updatePartner(credentials);
          }}
          className="mt-8 md:mt-20 flex flex-col gap-4 w-full *:w-full  md:max-w-[40rem]"
        >
          <div className="flex  gap-2 md:items-end">
            <div className="aspect-square p-4 border border-slate-500 rounded-md border-dashed min-w-[7rem] sm:min-w-[9rem] flex items-center justify-center ">
              {!!credentials.image ? (
                <div className="aspect-square relative">
                  <img
                    src={getPartnerImage(credentials.image as Blob)}
                    alt=""
                    className=" aspect-square object-cover object-center size-full max-w-[9rem]"
                  />
                  <span
                    onClick={() =>
                      setCredentials((c) => ({ ...c, image: null }))
                    }
                    className="p-1 rounded-full bg-white border border-slate-300 absolute -right-2 -top-2"
                  >
                    <XMarkIcon className="size-4" />
                  </span>
                </div>
              ) : (
                <label
                  htmlFor="image"
                  className="text-center flex flex-col items-center"
                >
                  <PhotoIcon className="size-8 fill-slate-400" />
                  <h1 className="text-sm text-slate-500">Tambahkan Logo</h1>
                </label>
              )}

              <input
                type="file"
                id="image"
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setCredentials(
                    (c) =>
                      ({
                        ...c,
                        image: !!e.target.files && e.target.files[0],
                      } as any)
                  )
                }
                hidden
              />
            </div>
            <div className="flex px-4 aspect-video py-4 overflow-hidden justify-center flex-grow items-center flex-col border border-slate-500 rounded-md border-dashed">
              {!!credentials.cover_image ? (
                <div className="rounded-md relative flex size-full">
                  <div
                    onClick={() =>
                      setCredentials((c) => ({ ...c, cover_image: null }))
                    }
                    className="p-1 rounded-full bg-white absolute border border-slate-400 -top-2 -right-2"
                  >
                    <XMarkIcon className="size-4" />
                  </div>
                  <div className="overflow-hidden rounded-md ">
                    <img
                      src={getPartnerImage(credentials.cover_image)}
                      alt=""
                      className="rounded-md size-full object-cover"
                    />
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="coverImage"
                  className="flex flex-col items-center"
                >
                  <PhotoIcon className="size-10 fill-slate-400" />
                  <h1 className="text-sm text-slate-500">Tambahkan Cover</h1>
                </label>
              )}
            </div>

            <input
              type="file"
              onChange={(e) => {
                setCredentials((c) => ({
                  ...c,
                  cover_image: !!e.target.files && (e.target.files[0] as any),
                }));
              }}
              id="coverImage"
              hidden
            />
          </div>
          {forms.map((form, i: number) => {
            return (
              <div
                onChange={handleChange}
                key={i}
                className={clsx(
                  "flex gap-2 max-md:flex-col md:gap-4 md:justify-between",
                  form.name == "url" &&
                    credentials.parent_partner_id == "0" &&
                    "hidden"
                )}
              >
                <label>
                  {form.label}
                  <span className="text-slate-500">
                    {form.name == "category" && " (optional)"}
                  </span>
                </label>
                {form.form_type == "input" ? (
                  <input
                    value={
                      credentials[form.name as keyof typeof credentials] || ""
                    }
                    onChange={handleChange}
                    id={form.name}
                    type="text"
                    className={clsx(
                      "px-3 py-2 border flex-grow border-[#009788] rounded-md max-w-[30rem]"
                    )}
                  />
                ) : form.form_type == "select" ? (
                  <Select
                    value={
                      credentials[form.name as keyof typeof credentials] || "0"
                    }
                    onChange={handleChange}
                    id={form.name}
                    className="max-w-[30rem] border border-[#009788] bg-gray-100 rounded-md !py-2 appearance-none px-3"
                    options={form.options as any}
                    placeholder={form.label}
                  />
                ) : (
                  <textarea
                    value={
                      credentials[
                        form?.name as keyof typeof credentials
                      ] as string
                    }
                    onChange={handleChange as any}
                    name={form.name}
                    id={form.name}
                    rows={8}
                    className="border border-[#009788] flex-grow max-w-[30rem] p-2 rounded-md"
                  ></textarea>
                )}
              </div>
            );
          })}
          {pendingUpdate ? (
            <div className="mt-8 flex justify-center">
              <Loader className="size-7" />
            </div>
          ) : (
            <button
              type="submit"
              className="mt-8 px-4 py-2 bg-[#009788] text-white rounded-md"
            >
              Submit
            </button>
          )}
        </form>
      ) : null}
    </div>
  );
}
