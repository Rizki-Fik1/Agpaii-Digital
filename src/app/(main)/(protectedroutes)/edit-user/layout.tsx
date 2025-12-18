"use client";
import Navigate from "@/components/navigator/navigate";
import { useAuth } from "@/utils/context/auth_context";
import { ReactNode } from "react";

export default function AdminEditLayout({ children }: { children: ReactNode }) {
	const { auth, authLoading } = useAuth();
	if (authLoading) return null;
	if (auth.role_id !== 1) return <Navigate to="/" />;
	return <>{children}</>;
}
