"use client";

import Loader from "@/components/loader/loader";
import Navigate from "@/components/navigator/navigate";
import { useAuth } from "@/utils/context/auth_context";
import { ReactNode } from "react";

export default function GuestRoute({ children }: { children: ReactNode }) {
  const { auth, authLoading } = useAuth();

  if (authLoading) return null;

  return !auth ? children : <Navigate to={"/"} />;
}
