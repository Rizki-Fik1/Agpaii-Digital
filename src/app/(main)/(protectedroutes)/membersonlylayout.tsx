"use client";
import Navigate from "@/components/navigator/navigate";
import { Status } from "@/constant/constant";
import { useAuth } from "@/utils/context/auth_context";
import { getUserStatus } from "@/utils/function/function";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  const { auth } = useAuth();

  return getUserStatus(auth) != Status.ACTIVE ? (
    <Navigate to={"/"} />
  ) : (
    children
  );
}
