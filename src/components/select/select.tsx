export default function Select({
  placeholder,
  id,
  options,
  className,
  value,
  onChange,
  required,
}: {
  value?: any;
  placeholder: string;
  id?: string;
  options: { name: string; value: any }[];
  className?: string;
  onChange?: (e: any) => void;
  required?: boolean;
}) {
  return (
    <select
      required={required}
      onChange={onChange}
      value={value || ""}
      className={
        !!className
          ? className
          : "" + " bg-gray-100 appearance-none px-5 py-2.5"
      }
      id={id}
    >
      <option disabled value={""}>
        {placeholder}
      </option>
      {options.map((o, i) => (
        <option key={i} value={o.value}>
          {o.name}
        </option>
      ))}
    </select>
  );
}
