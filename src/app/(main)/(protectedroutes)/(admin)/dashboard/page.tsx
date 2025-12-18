"use client";
import { useAuth } from "@/utils/context/auth_context";

export default function AdminPage() {
  const { auth, authLoading } = useAuth();
  if (authLoading) return null;
  return (
    <div className="px-8 py-12 text-2xl font-semibold">
      Welcome, {auth.name} !
    </div>
  );
}
