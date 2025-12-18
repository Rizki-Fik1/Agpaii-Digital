// contexts/UnreadContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/utils/context/auth_context";
import {
	collection,
	query,
	where,
	onSnapshot,
	DocumentData,
} from "firebase/firestore";
import { db } from "../../../firebase";

interface UnreadContextValue {
	totalUnread: number;
}

const UnreadContext = createContext<UnreadContextValue>({
	totalUnread: 0,
});

export function UnreadProvider({ children }: { children: React.ReactNode }) {
	const { auth } = useAuth();
	const currentUserId = auth?.id;
	const [totalUnread, setTotalUnread] = useState<number>(0);

	useEffect(() => {
		if (!currentUserId) return;

		// Langganan conversation
		const colRef = collection(db, "conversations");
		const q = query(
			colRef,
			where("participants", "array-contains", currentUserId),
		);

		const unsubscribe = onSnapshot(q, (snapshot) => {
			let sumUnread = 0;
			snapshot.forEach((docSnap) => {
				const data = docSnap.data() as DocumentData;
				// data.unreadCount = { "userId1": number, "userId2": number, ...}
				const unreadCountObj = data.unreadCount || {};
				const userUnread = unreadCountObj[currentUserId] || 0;
				sumUnread += userUnread;
			});
			setTotalUnread(sumUnread);
		});

		return () => unsubscribe();
	}, [currentUserId]);

	return (
		<UnreadContext.Provider value={{ totalUnread }}>
			{children}
		</UnreadContext.Provider>
	);
}

export function useUnread() {
	return useContext(UnreadContext);
}
