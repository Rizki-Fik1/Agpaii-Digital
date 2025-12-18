"use client";
import Loader from "@/components/loader/loader";
import Modal from "@/components/modal/modal";
import Partner from "@/components/partner/partner";
import API from "@/utils/api/config";
import { useModal } from "@/utils/hooks/use_modal";
import { PlusIcon } from "@heroicons/react/20/solid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import TextAreaAutosize from "react-textarea-autosize";

const trimText = (text: string, length: number) =>
  text.length > length ? text.substring(0, length) + "..." : text;

export default function PartnerPage() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<any>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["partners"],
    queryFn: async () => {
      const res = await API.get("/partner");
      if (res.status == 200) return res.data;
    },
  });
  const { show: deleteModalShow, toggle: toggleDeleteModal } = useModal();

  const { mutate: deletePartner, isPending: deletePending } = useMutation({
    mutationFn: async ({ id }: { id: number | string }) => {
      const res = await API.delete(`/partner/${id}`);
      if (res.status == 200) return res.data;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["partners"] });
      toggleDeleteModal();
    },
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value, id } = e.target;
    setSelected((s: any) => ({ ...s, [id]: value }));
  };

  const router = useRouter();

  if (isLoading) return null;

  return (
    <>
      <Modal show={deleteModalShow} fullWidth onClose={toggleDeleteModal}>
        <img src="/img/trash.svg" className="size-44" alt="" />
        <p>
          Apakah anda yakin ingin menghapus <br /> {selected?.name} ?
        </p>
        <div className="flex justify-center  pt-8 gap-3">
          {deletePending ? (
            <Loader className="size-8 justify-self-center" />
          ) : (
            <>
              <span
                onClick={() => deletePartner(selected)}
                className="px-4 py-2 rounded-md cursor-default bg-[#009788] text-white"
              >
                Hapus Mitra
              </span>
              <span
                onClick={() => toggleDeleteModal()}
                className="px-4 py-2 rounded-md border border-slate-300 cursor-default"
              >
                Batal
              </span>
            </>
          )}
        </div>
      </Modal>
      {/* Edit Partner Name Modal */}

      <div className="py-12 px-4 sm:px-6 md:px-8">
        <h1 className="text-3xl font-semibold mb-24">Kategori Mitra </h1>
        <div className="flex justify-end">
          <Link
            href={"/dashboard/partner/new"}
            className="p-1 rounded-md bg-[#009788] max-sm:fixed bottom-28 z-[999] shadow-md"
          >
            <PlusIcon className="size-8 text-white" />
          </Link>
        </div>
        <div className=" mt-4 w-full">
          <table className="border border-slate-300 shadow-md  overflow-hidden w-full">
            <thead>
              <tr className="*:bg-[#00978859] *:px-4 *:py-3 *:font-medium *:border-b *:border-slate-300">
                <td className="rounded-tl-md  text-center">No</td>
                <td className=""> Mitra</td>
                <td className="rounded-tr-md text-center"> Aksi</td>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 &&
                data.map((partner: any, i: number) => {
                  return (
                    <Partner
                      onEdit={() => {
                        router.push(`/dashboard/partner/${partner.id}/edit`);
                      }}
                      onDelete={() => {
                        setSelected(partner);
                        toggleDeleteModal();
                      }}
                      partner={partner}
                      i={i}
                      key={i}
                    />
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
