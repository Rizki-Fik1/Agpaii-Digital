"use client";

import Loader from "@/components/loader/loader";
import Modal from "@/components/modal/modal";
import API from "@/utils/api/config";
import { useModal } from "@/utils/hooks/use_modal";
import {
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

function trimText(text: string, length: number) {
  return text.length > length ? text.slice(0, length) + "..." : text;
}

export default function SubPartners() {
  const { id } = useParams();
  const [selected, setSelected] = useState<any>(null);
  const { data: partner, isLoading } = useQuery({
    queryKey: ["partner", id],
    queryFn: async () => {
      const res = await API.get(`/partner/${id}`);
      if (res.status == 200) return res.data;
    },
  });

  const { data: subpartners } = useQuery({
    queryKey: ["subpartners", id],
    queryFn: async () => {
      try {
        const res = await API.get(`/partner/${id}/subpartners`);
        if (res.status == 200) return res.data;
        else return null;
      } catch (error) {
        return null;
      }
    },
  });
  const { show: deleteModalShow, toggle: toggleDeleteModal } = useModal();
  const queryClient = useQueryClient();

  const { mutate: deletePartner, isPending: deletePending } = useMutation({
    mutationFn: async ({ id }: { id: number | string }) => {
      const res = await API.delete(`/partner/${id}`);
      if (res.status == 200) return res.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["subpartners", id] }),
        queryClient.invalidateQueries({ queryKey: ["partner", id] }),
      ]);
      toggleDeleteModal();
    },
  });

  if (isLoading) return null;

  return (
    <div className="flex flex-col px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 lg:py-12">
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
      <h1 className="text-xl font-semibold mb-12">Mitra {partner.name}</h1>
      <div className="flex justify-end mb-6">
        <Link
          href={`/dashboard/partner/${id}/user`}
          className="px-4 py-1.5 bg-[#009788] text-white rounded-md"
        >
          User Mitra {partner.name}
        </Link>
      </div>
      {!!partner?.has_subpartners ? (
        <table className="border border-slate-300 shadow-md  overflow-hidden w-full">
          <thead>
            <tr className="*:bg-[#00978859] *:px-4 *:py-3 *:font-medium *:border-b *:border-slate-300">
              <td className="rounded-tl-md  text-center">No</td>
              <td className=""> Mitra</td>
              <td className="rounded-tr-md text-center"> Aksi</td>
            </tr>
          </thead>
          <tbody>
            {!!subpartners &&
              subpartners.length > 0 &&
              subpartners.map((partner: any, i: number) => {
                return (
                  <tr
                    className={clsx(
                      "*:px-2 *:sm:px-4  *:py-3 border-b border-b-slate-300",
                      i % 2 == 0 && "bg-slate-100"
                    )}
                    key={i}
                  >
                    <td className="text-center">{i + 1}</td>
                    <td>
                      <span className="sm:hidden text-sm">
                        {trimText(partner.name, 10)}
                      </span>
                      <span className="max-sm:hidden">{partner.name}</span>
                    </td>
                    <td className="text-center">
                      <div className="flex gap-4 justify-end mr-12">
                        <Link href={`/dashboard/partner/${partner.id}/edit`}>
                          <PencilIcon className="size-[1.10rem] text-green-600" />
                        </Link>
                        <TrashIcon
                          onClick={() => {
                            setSelected(partner);
                            toggleDeleteModal();
                          }}
                          className="size-[1.10rem] text-red-600"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      ) : (
        <div className="text-slate-500">
          <h1>Tidak ada Mitra</h1>
        </div>
      )}
    </div>
  );
}
