import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Navigate({
  to,
  replace = false,
}: {
  to: string | number;
  replace?: boolean;
}): null {
  const router = useRouter();
  useEffect(() => {
    if (replace) {
      router.replace(to as string);
    } else {
      if (to == -1) router.back();
      else router.push(to as string);
    }
  }, []);
  return null;
}
