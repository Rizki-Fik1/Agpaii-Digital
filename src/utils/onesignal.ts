'use client';

import OneSignal from 'react-onesignal';

export async function initOneSignal(userId?: string | number) {
  if (typeof window === 'undefined') return;

  const allowedDomains = [
    'web.agpaiidigital.org',
    'localhost',
    '127.0.0.1',
  ];

  const hostname = window.location.hostname;
  if (!allowedDomains.some(d => hostname.includes(d))) return;

  try {
    await OneSignal.init({
      appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
      notifyButton: { enable: false } as any,
      allowLocalhostAsSecureOrigin: hostname === 'localhost',
      serviceWorkerPath: '/OneSignalSDKWorker.js',
      serviceWorkerUpdaterPath: '/OneSignalSDKUpdaterWorker.js',
    });
  } catch (error) {
    console.error('OneSignal Init Error:', error);
  }

  if (userId) {
    await OneSignal.login(String(userId));
  }
}
