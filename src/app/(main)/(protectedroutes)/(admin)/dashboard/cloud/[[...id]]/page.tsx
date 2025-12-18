"use client";

import { File, Folder } from "@/components/folders/folder";
import Loader from "@/components/loader/loader";
import Modal from "@/components/modal/modal";
import API from "@/utils/api/config";
import { useModal } from "@/utils/hooks/use_modal";
import { FolderIcon } from "@heroicons/react/16/solid";
import { ArrowDownTrayIcon, DocumentIcon } from "@heroicons/react/20/solid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import { toast } from "sonner";

const getFilename = (selected: any) => {
  switch (selected.type) {
    case "file":
      return selected.name.split(".").slice(0, -1);
      break;
    case "folder":
      return selected.name;
      break;
  }
};

export default function Contents() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    show: deleteModalShow,
    toggle: toggleDeleteModal,
    close,
  } = useModal();
  const {
    show: editModalShow,
    close: closeEditModal,
    toggle: toggleEditModal,
  } = useModal();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["contents", id],
    queryFn: async () => {
      const res = await API.get(`/cloud${!!id ? "/" + id : ""}`);
      if (res.status == 200) return res.data;
    },
  });

  const getUrl = (type: string) =>
    type == "folder" ? "/cloud/folder" : "/cloud/file";

  const { mutate: deleteContent, isPending: deletePending } = useMutation({
    mutationFn: async () => {
      const res = await API.delete(`${getUrl(selected.type)}/${selected.id}`);
      if (res.status == 200) return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["contents", id] });
      close();
      toast.success(
        selected.type.charAt(0).toUpperCase() +
          selected.type.substring(1) +
          " Berhasil dihapus"
      );
      setSelected(null);
    },
  });

  const { mutate: updateContent, isPending: updating } = useMutation({
    mutationFn: async () => {
      const res = await API.put(getUrl(selected.type) + "/" + selected.id, {
        name: selected.name,
      });
      if (res.status == 200) return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["contents", id] });
      closeEditModal();
    },
  });

  const [selected, setSelected] = useState<any>();

  if (isLoading) return null;
  if (isError) return error.message;

  const handleChange =
    (selected: any) => (e: ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      const ext = "." + selected.name.split(".").pop();
      setSelected((s: any) => ({
        ...s,
        name: selected.type == "file" ? value + ext : value,
      }));
    };

  return (
    <>
      {/* Edit Modal */}
      {!!selected && (
        <Modal fullWidth show={editModalShow} onClose={closeEditModal}>
          <div className=" flex flex-col min-w-[15rem] sm:min-w-[18rem] *:text-left">
            <h1 className="font-semibold pb-2">
              <span className="capitalize text-base ">
                Edit {selected?.type}
              </span>
            </h1>
            <div className="flex border border-slate-300 rounded-md overflow-hidden mt-5">
              <input
                onChange={handleChange(selected)}
                value={getFilename(selected)}
                type="text"
                className="py-2 px-3 flex-grow"
              />
              {selected.type == "file" && (
                <div className="p-2 px-3 bg-gray-200 flex-grow">
                  .{selected.name.split(".").pop()}
                </div>
              )}
            </div>
            <div className="flex justify-end mt-5 gap-2">
              {updating ? (
                <Loader className="size-6 mr-4" />
              ) : (
                <>
                  {" "}
                  <button
                    onClick={toggleEditModal}
                    className="px-3 py-2 bg-gray-200 rounded-md"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => updateContent()}
                    className="px-3 py-2 bg-[#009788] text-white  rounded-md"
                  >
                    Edit {selected.type}
                  </button>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* End Edit Modal */}
      <Modal fullWidth show={deleteModalShow} onClose={close}>
        <img src="/img/trash.svg" className="size-44" alt="" />
        <p>
          Apakah anda yakin ingin menghapus <br /> {selected?.type} ini?
        </p>
        <div className="flex justify-center  pt-8 gap-3">
          {deletePending ? (
            <Loader className="size-8" />
          ) : (
            <>
              <span
                onClick={() => deleteContent()}
                className="px-4 py-2 rounded-md cursor-default bg-[#009788] text-white"
              >
                Hapus {selected?.type}
              </span>
              <span
                onClick={() => close()}
                className="px-4 py-2 rounded-md border border-slate-300 cursor-default"
              >
                Batal
              </span>
            </>
          )}
        </div>
      </Modal>
      {isLoading ? (
        <div className="flex justify-center mt-24">
          <Loader className="size-8" />
        </div>
      ) : (
        <>
          {data.length > 0 ? (
            <div className="flex flex-col border border-slate-200 overflow-hidden max-h-[40rem] rounded-lg">
              {data.map((content: any, i: number) => {
                return content.type == "file" ? (
                  <File
                    onEdit={toggleEditModal}
                    onDelete={toggleDeleteModal}
                    key={i}
                    content={content}
                    onClick={() => setSelected(content)}
                    selected={content == selected}
                  />
                ) : (
                  <Folder
                    onEdit={toggleEditModal}
                    onDelete={toggleDeleteModal}
                    key={i}
                    content={content}
                    onClick={() => setSelected(content)}
                    selected={selected == content}
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex text-center justify-center py-4 text-sm text-slate-800 mt-20">
              Tidak ada file/folder
            </div>
          )}
        </>
      )}
    </>
  );
}
