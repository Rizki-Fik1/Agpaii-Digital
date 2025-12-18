import { XMarkIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";
import { ReactNode, useEffect, useRef } from "react";

export default function Modal({
  children,
  show,
  onClose,
  className,
  fullWidth = false,
}: {
  show: boolean;
  className?: string;
  children: ReactNode;
  onClose: () => void;
  fullWidth?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  // useEffect(() => {
  //   function clickHandler(e: MouseEvent) {
  //     if (!ref.current?.contains(e.target as Node)) onClose();
  //   }
  //   document.addEventListener("click", clickHandler);
  //   return () => document.removeEventListener("click", clickHandler);
  // }, []);
  return (
    <>
      <div
        onClick={onClose}
        className={clsx(
          " fixed flex top-0 left-0 bottom-0 right-0 bg-[rgba(0,0,0,0.250)] z-[99999] m-auto px-4 sm:px-8 duration-300 ease-in-out",
          show ? " opacity-100" : "opacity-0 pointer-events-none shadow",
          fullWidth ? "" : "max-w-[480px]"
        )}
      >
        <div
          ref={ref}
          onClick={(e) => e.stopPropagation()}
          // onClick={(e) => e.stopPropagation()}
          className={clsx(
            "m-auto px-6 h-fit  bg-white rounded-md py-5 shadow relative text-sm text-center text-slate-700 duration-300 ease-in-out ",
            show ? "scale-100 opacity-100" : "scale-75 opacity-0",
            className
          )}
        >
          {/* XMarkIcon */}
          <XMarkIcon
            className="text-slate-400 size-5 absolute right-3 top-3 cursor-pointer"
            onClick={onClose}
          />
          {/* EndXMark */}
          {children}
        </div>
      </div>
    </>
  );
}
