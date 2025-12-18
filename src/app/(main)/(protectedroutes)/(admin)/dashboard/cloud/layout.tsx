"use client";
import Loader from "@/components/loader/loader";
import Modal from "@/components/modal/modal";
import API from "@/utils/api/config";
import { useModal } from "@/utils/hooks/use_modal";
import { DocumentIcon, XMarkIcon } from "@heroicons/react/16/solid";
import {
  ArrowLeftIcon,
  ArrowUpTrayIcon,
  PlusIcon,
} from "@heroicons/react/20/solid";
import { FolderIcon } from "@heroicons/react/24/outline";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { useParams, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { show, toggle } = useModal();
  const { id } = useParams();
  const [file, setFile] = useState<File | null>();
  const queryClient = useQueryClient();
  const [folder, setFolder] = useState("");
  const {
    show: folderModalShow,
    toggle: toggleFolderModal,
    close: closeFolderModal,
  } = useModal();
  const {
    show: fileModalShow,
    close: closeFileModal,
    toggle: toggleFileModal,
  } = useModal();

  const { mutate: createFolder, isPending: creatingFolder } = useMutation({
    mutationFn: async () => {
      let data: any = {
        name: folder,
      };
      if (id !== undefined) data.parent_folder_id = parseInt(id as string);
      const res = await API.post(`/cloud/folder${!!id ? "/" + id : ""}`, data);
      if (res.status == 200) return res.data;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["contents"] });
      closeFolderModal();
      setFolder("");
      toast.success("Folder Berhasil dibuat");
    },
  });

  const { mutate: uploadFile, isPending: uploadingFile } = useMutation({
    mutationFn: async () => {
      const folderId = !!id ? id : null;
      const data = new FormData();
      folderId !== null && data.append("folder_id", folderId as any);
      !!file && data.append("file", file);

      const res = await API.post("/cloud/file", data);
      if (res.status == 200) return res.data;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: ["contents"],
      });
      closeFileModal();
      toast.success("Berhasil mengupload file");
    },
  });

  const handleChange = (e: any) => {
    setFile(e.target.files[0]);
  };

  useEffect(() => {
    console.log(id);
  }, []);

  return (
    <>
      {/* Folder Modal */}
      <Modal fullWidth onClose={closeFolderModal} show={folderModalShow}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createFolder();
          }}
          className="flex flex-col h-max items-start text-left pt-6 min-w-[15rem] sm:min-w-[18rem] "
        >
          <div className="flex flex-col w-full">
            <label htmlFor="f" className="pb-1.5 text-slate-600">
              Masukkan nama folder
            </label>
            <input
              value={folder || ""}
              onChange={(e) => setFolder(e.target.value)}
              type="text"
              className="px-3 py-2 border border-slate-300 rounded-md"
            />
          </div>
          {creatingFolder ? (
            <div className="flex justify-end pr-6 mt-6 w-full">
              <Loader className="size-7" />
            </div>
          ) : (
            <div className="flex justify-end mt-4 w-full gap-2">
              <button
                className="text-sm bg-gray-200 px-4 py-2
              rounded-md"
              >
                Batal
              </button>
              <button
                disabled={folder.length == 0}
                type="submit"
                className="text-sm w-max bg-[#009788] text-white px-4 py-2
              rounded-md"
              >
                Buat folder
              </button>
            </div>
          )}
        </form>
      </Modal>
      {/* End Folder Modal */}
      {/* File Modal */}
      <Modal fullWidth onClose={closeFileModal} show={fileModalShow}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            uploadFile();
          }}
          className=" min-w-[15rem] sm:min-w-[18rem] flex flex-col"
        >
          <div className="flex w-full justify-start -mt-1 pb-4">
            <h1 className="font-medium text-base">Upload File</h1>
          </div>
          <label
            htmlFor="file"
            className="w-full text-center items-center justify-center  min-h-24 border border-dashed rounded-md border-slate-400 flex gap-3"
          >
            {!!file ? (
              <div className="py-1 px-3 relative bg-gray-200 rounded-md text-sm">
                <h1>{file.name}</h1>
                <div
                  onClick={() => setFile(null)}
                  className="p-0.5 rounded-full flex bg-gray-400 absolute -right-2 -top-2 "
                >
                  <XMarkIcon className="size-4 m-auto" />
                </div>
              </div>
            ) : (
              <>
                <ArrowUpTrayIcon className="size-4 text-slate-500 " />
                <h1 className="text-slate-500 text-sm">Upload file </h1>
              </>
            )}
          </label>
          <input onChange={handleChange} type="file" id="file" hidden />
          {uploadingFile ? (
            <div className="mt-6 flex justify-center">
              <Loader className="size-6" />
            </div>
          ) : (
            <button
              disabled={!!!file}
              type="submit"
              className="mt-4 mb-1 disabled:bg-slate-300 bg-[#009788] text-white py-2 text-sm px-3 rounded-md"
            >
              Upload
            </button>
          )}
        </form>
      </Modal>
      {/* End File Modal */}
      <div className="px-4 md:px-8 py-8 md:py-12 min-h-screen">
        <h1 className="text-2xl lg:text-3xl font-semibold text-[#009788]">
          Dokumen Cloud
        </h1>
        <ArrowLeftIcon
          onClick={() => router.back()}
          className="size-7 mt-8 cursor-pointer"
        />
        <div className="mt-8">
          {children}
          <div className="fixed shadow-lg right-6 sm:right-8 sm:bottom-8 bottom-24 z-[9999] p-2 bg-[#009788]  text-slate-700 rounded-full">
            <PlusIcon
              onClick={toggle}
              className={clsx(
                "size-8 text-white cursor-pointer duration-300 ease-in-out",
                show && "-rotate-[140deg]"
              )}
            />
            {
              <div
                className={clsx(
                  "absolute min-w-[15rem] sm:min-w-[17rem] rounded-lg border hover:*:bg-slate-100 *:cursor-pointer border-slate-200 bg-white  bottom-0 right-16 w-max *:py-3 *:border *:border-slate-200 text-sm shadow duration-300 ease-in-out origin-bottom-right",
                  show ? "" : "scale-50 opacity-0 pointer-events-none"
                )}
              >
                <div
                  onClick={() => {
                    toggle();
                    toggleFolderModal();
                  }}
                  className="flex gap-3 pl-5 items-center cursor-default"
                >
                  <FolderIcon className="size-[1.1rem]" /> Folder Baru
                </div>
                <div
                  onClick={() => {
                    toggle();
                    toggleFileModal();
                  }}
                  className="flex gap-3 pl-5 items-center cursor-default"
                >
                  <ArrowUpTrayIcon className="size-[1.1rem]" /> Upload File
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </>
  );
}
