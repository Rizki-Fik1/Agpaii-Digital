"use client";

import { createContext, ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Analytics, getAnalytics, logEvent } from "firebase/analytics";
import { app } from "../../../firebase";

export const FirebaseContext = createContext<Analytics | null>(null);

export const FirebaseTrackingProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const pathname = usePathname(); // Use `next/navigation` to get the current pathname
	const [tracking, setTracking] = useState<Analytics | null>(null);

	useEffect(() => {
		const analytics = getAnalytics(app);
		setTracking(analytics);
	}, []);

	useEffect(() => {
		if (!tracking || !pathname) return;

		logEvent(getAnalytics(), "page_view", {
			platform: "web",
			page_location: window.location.href,
			page_path: pathname,
			page_title: document.title,
		});
	}, [tracking, pathname]);

	return (
		<FirebaseContext.Provider value={tracking}>
			{children}
		</FirebaseContext.Provider>
	);
};
