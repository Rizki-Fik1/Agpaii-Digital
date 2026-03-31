"use client";

import { createContext, ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Analytics, getAnalytics, isSupported, logEvent } from "firebase/analytics";
import { app, isFirebaseConfigured } from "../../../firebase";

export const FirebaseContext = createContext<Analytics | null>(null);

export const FirebaseTrackingProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const pathname = usePathname(); // Use `next/navigation` to get the current pathname
	const [tracking, setTracking] = useState<Analytics | null>(null);

	useEffect(() => {
		let mounted = true;

		if (!app || !isFirebaseConfigured) return;
		const firebaseApp = app;

		isSupported()
			.then((supported) => {
				if (!supported || !mounted) return;
				const analytics = getAnalytics(firebaseApp);
				setTracking(analytics);
			})
			.catch(() => {
				// Ignore analytics initialization on unsupported environments.
			});

		return () => {
			mounted = false;
		};
	}, []);

	useEffect(() => {
		if (!tracking || !pathname) return;

		logEvent(tracking, "page_view", {
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
