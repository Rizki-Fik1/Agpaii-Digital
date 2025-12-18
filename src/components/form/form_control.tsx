import {
  EyeSlashIcon,
  EyeIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/solid";
import clsx from "clsx";
import { ReactNode, useState } from "react";

export default function FormControl({
  onChange,
  refs = null,
  className = "",
  name,
  placeholder,
  type,
  value,
  register,
  inputType,
  options,
  error,
}: {
  children?: ReactNode;
  onChange?: (e: any) => void;
  refs?: any;
  className?: string;
  name?: string;
  type: any;
  value?: any;
  placeholder: string;
  inputType?: "text" | "email" | "password" | "file";
  register?: any;
  options?: { name: string; value: any }[];
  error?: any;
}) {
  const [passwordHidden, setPasswordHidden] = useState(true);
  return type == "input" && inputType !== "file" ? (
    <div className="w-full">
      <div
        className={clsx(
          "relative bg-slate-200",
          inputType == "password" && "flex items-stretch",
          className
        )}
      >
        <input
          {...(value && { value: value })}
          {...(register && { ...register(name) })}
          className={clsx("px-4 py-2.5 w-full focus:outline-none bg-inherit ")}
          type={inputType == "password" && !passwordHidden ? "text" : inputType}
          placeholder={placeholder}
          {...(onChange && { onChange: onChange })}
        />
        {inputType == "password" && (
          <div className="py-2.5 pr-4 pl-0 flex items-center bg-slate-200">
            {passwordHidden ? (
              <EyeSlashIcon
                onClick={() => setPasswordHidden((p) => !p)}
                className="size-5"
              />
            ) : (
              <EyeIcon
                className="size-5"
                onClick={() => setPasswordHidden((p) => !p)}
              />
            )}
          </div>
        )}
      </div>
      {error && <small className="text-red-500">{error.message}</small>}
    </div>
  ) : inputType == "file" ? (
    <div className="flex">
      <div
        className={clsx(
          "rounded-md overflow-hidden bg-slate-200 px-5 py-3 flex",
          className
        )}
      >
        <label
          htmlFor={name}
          className="flex size-full items-center text-slate-600 justify-center m-auto text-sm gap-2"
        >
          <ArrowUpTrayIcon className="size-[1.1rem]" />
          <h1>{placeholder}</h1>
        </label>
      </div>
      <input
        name={name}
        {...(refs && { refs: refs })}
        {...(onChange && { onChange: onChange })}
        {...(register && { ...register(name) })}
        type="file"
        hidden
        id={name}
      />
    </div>
  ) : type == "select" ? (
    <div>
      <select
        {...(register && { ...register(name) })}
        defaultValue={""}
        {...(value && { value: value })}
        className={clsx("px-3 py-3 bg-slate-200 w-full", className)}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options?.map((option, i) => (
          <option key={i} value={option.value}>
            {option.name}
          </option>
        ))}
      </select>
      {error && <small className="text-red-500">{error.message}</small>}
    </div>
  ) : (
    type == "textarea" && (
      <textarea
        name={name}
        {...(register && { ...register(name) })}
        className={clsx("bg-slate-200 px-3 py-2 !min-h-36", className)}
      ></textarea>
    )
  );
}
