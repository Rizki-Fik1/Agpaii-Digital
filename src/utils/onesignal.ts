// Extend Window interface to include OneSignal
declare global {
  interface Window {
    OneSignal: any[];
  }
}

export function initOneSignal(userId?: string | number) {
  if (typeof window === "undefined") return;

  // Initialize OneSignal array if not exists
  window.OneSignal = window.OneSignal || [];

  // Push initialization function
  window.OneSignal.push(function () {
    // @ts-ignore - OneSignal SDK methods
    window.OneSignal.init({
      appId: "1436bf70-cf4b-495e-8528-b1fcc58df79d",
      allowLocalhostAsSecureOrigin: true,
      notifyButton: { enable: false },
    });

    if (userId) {
      // @ts-ignore - OneSignal SDK methods
      window.OneSignal.setExternalUserId(String(userId));
    }
  });
}
