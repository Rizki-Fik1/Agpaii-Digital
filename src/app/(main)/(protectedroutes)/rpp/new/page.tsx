"use client";
import TopBar from "@/components/nav/topbar";
import { XMarkIcon } from "@heroicons/react/16/solid";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { duration } from "moment";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

export default function NewRPP() {
  const [image, setImage] = useState<File | null>(null);

  const { acceptedFiles, getInputProps, getRootProps } = useDropzone({
    accept: { "image/*": [] },
  });

  useEffect(() => {
    console.log(image);
  }, [image]);

  useEffect(() => {
    setImage(acceptedFiles[0]);
  }, [acceptedFiles]);

  const [credentials, setCredentials] = useState({
    topic: "",
    subject: "",
    educational_level_id: 0,
    grade: "",
    duration: "",
  });

  return (
    <div className="pt-[4.21rem]">
      <TopBar withBackButton>Buat RPP</TopBar>
      <div className="flex flex-col gap-3 px-6 pt-8">
        <div
          {...getRootProps({
            className:
              "rounded-md  h-56 border flex justify-center items-center border-slate-300 relative",
          })}
        >
          <input {...getInputProps({ max: 1 })} />
          <label
            htmlFor="image"
            className=" text-slate-500 flex justify-center items-center flex-col"
          >
            Upload Gambar Disini
          </label>
          {image && (
            <div className="absolute size-full">
              <img
                className="size-full object-cover object-center rounded-md"
                src={URL.createObjectURL(image as Blob)}
                alt=""
              />
              <span
                onClick={() => setImage(null)}
                className="p-1 rounded-full absolute -top-2 -right-2 bg-white border border-slate-400"
              >
                <XMarkIcon className="size-5" />
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="text-lg font-medium mt-6">Detail Informasi</h1>
          <input
            type="text"
            className="px-4 py-2 rounded-md border border-slate-200"
            placeholder="Materi Pokok"
          />
          <input
            type="text"
            className="px-4 py-2 rounded-md border border-slate-200"
            placeholder="Mata Pelajaran"
          />
          <select
            className="px-4 py-2 rounded-md border border-slate-200 appearance-none"
            name=""
            id=""
            defaultValue={"_"}
          >
            <option disabled value="_">
              Jenjang
            </option>
            <option value="1">SD</option>
            <option value="2">SMP</option>
            <option value="3">SMA</option>
            <option value="4">SMK</option>
            <option value="5">TK</option>
            <option value="9">SLB</option>
          </select>

          <input
            type="text"
            className="px-4 py-2 rounded-md border border-slate-200"
            placeholder="Kelas"
          />
          <input
            type="text"
            className="px-4 py-2 rounded-md border border-slate-200"
            placeholder="Durasi"
          />
        </div>

        <button className="w-full bg-[#009788] rounded-md px-4 py-2 text-white mt-8">
          Submit
        </button>
      </div>
    </div>
  );
}
