"use client";

import Script from "next/script";
import { useEffect } from "react";

export default function OneSignalProvider() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async function (OneSignal) {
      await OneSignal.init({
        appId: "1436bf70-cf4b-495e-8528-b1fcc58df79d",
        notifyButton: { enable: true },
      });
    });
  }, []);

  return (
    <>
      <Script
        src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
        strategy="afterInteractive"
      />
    </>
  );
}
