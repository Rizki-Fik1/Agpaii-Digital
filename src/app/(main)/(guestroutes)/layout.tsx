"use client";

import Loader from "@/components/loader/loader";
import Navigate from "@/components/navigator/navigate";
import { useAuth } from "@/utils/context/auth_context";
import { ReactNode } from "react";

export default function GuestRoute({ children }: { children: ReactNode }) {
  const { auth, authLoading } = useAuth();

  if (authLoading)
    return (
      <div className="flex h-screen justify-center items-center">
        <Loader className="size-10" />
      </div>
    );

  return !auth ? children : <Navigate to={"/"} />;
}
