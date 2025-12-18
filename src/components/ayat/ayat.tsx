import clsx from "clsx";

export interface iAyat {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio?: {};
}

export default function Ayat({ ayat }: { ayat: iAyat }) {
  return (
    <div
      className={clsx(
        "flex flex-col gap-6 py-6 px-6",
        ayat.nomorAyat % 2 == 0 ? "bg-[#266565]" : "bg-white"
      )}
    >
      <div className="flex gap-8 justify-end items-start">
        <span
          className={clsx(
            "text-sm p-2 size-6 flex justify-center border items-center rounded-full",
            ayat.nomorAyat % 2 == 0
              ? "border-white text-white"
              : " border-black "
          )}
        >
          {ayat.nomorAyat}
        </span>
        <span
          className={clsx(
            "text-right text-xl text-[1.50rem]",
            ayat.nomorAyat % 2 == 0 ? "text-white" : ""
          )}
        >
          {ayat.teksArab}
        </span>
      </div>
      <div className="text-sm flex flex-col gap-2 pt-6">
        <h1
          className={clsx(
            ayat.nomorAyat % 2 == 0 ? "text-white" : "text-slate-700"
          )}
        >
          {ayat.teksLatin}
        </h1>
        <h2
          className={clsx(
            ayat.nomorAyat % 2 == 0 ? "text-white" : "text-[#266565]"
          )}
        >
          {ayat.teksIndonesia}
        </h2>
      </div>
    </div>
  );
}
