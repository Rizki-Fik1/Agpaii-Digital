'use client';

import OneSignal from 'react-onesignal';

export async function initOneSignal(userId?: string | number) {
  if (typeof window === 'undefined') return;

  // Check if OneSignal App ID is configured
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
  if (!appId || appId === 'your-onesignal-app-id-here') {
    console.warn('OneSignal App ID is not configured. Skipping OneSignal initialization.');
    return;
  }

  const allowedDomains = [
    'web.agpaiidigital.org',
    'localhost',
    '127.0.0.1',
  ];

  const hostname = window.location.hostname;
  if (!allowedDomains.some(d => hostname.includes(d))) return;

  try {
    await OneSignal.init({
      appId: appId,
      notifyButton: { enable: false },
      allowLocalhostAsSecureOrigin: hostname === 'localhost',
      serviceWorkerPath: '/OneSignalSDKWorker.js',
      serviceWorkerUpdaterPath: '/OneSignalSDKUpdaterWorker.js',
    });

    if (userId) {
      await OneSignal.login(String(userId));
    }
  } catch (error) {
    console.error('Failed to initialize OneSignal:', error);
  }
}
