export function initOneSignal(userId?: string | number) {
  if (typeof window === "undefined") return;

  // @ts-ignore
  window.OneSignal = window.OneSignal || [];

  // @ts-ignore
  OneSignal.push(function () {
    OneSignal.init({
      appId: "1436bf70-cf4b-495e-8528-b1fcc58df79d",
      allowLocalhostAsSecureOrigin: true,
      notifyButton: { enable: false },
    });

    if (userId) {
      OneSignal.setExternalUserId(String(userId));
    }
  });
}
