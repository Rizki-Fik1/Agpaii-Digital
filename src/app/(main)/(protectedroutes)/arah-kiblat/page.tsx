"use client";
import React, { useState, useEffect } from "react";
import TopBar from "@/components/nav/topbar";
import { useAuth } from "@/utils/context/auth_context";

interface LocationType {
  latitude: number;
  longitude: number;
  city?: string;
}

const ArahKiblatPage: React.FC = () => {
  const { auth: user } = useAuth();
  const [location, setLocation] = useState<LocationType | null>(null);
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);

  // Koordinat Ka'bah di Mekah
  const MECCA_LAT = 21.4224779;
  const MECCA_LNG = 39.8262202;

  // Fungsi menghitung arah kiblat
  const calculateQiblaDirection = (lat: number, lng: number): number => {
    const latRad = (lat * Math.PI) / 180;
    const lngRad = (lng * Math.PI) / 180;
    const meccaLatRad = (MECCA_LAT * Math.PI) / 180;
    const meccaLngRad = (MECCA_LNG * Math.PI) / 180;
    const deltaLng = meccaLngRad - lngRad;
    const y = Math.sin(deltaLng) * Math.cos(meccaLatRad);
    const x =
      Math.cos(latRad) * Math.sin(meccaLatRad) -
      Math.sin(latRad) * Math.cos(meccaLatRad) * Math.cos(deltaLng);
    let bearing = Math.atan2(y, x);
    bearing = (bearing * 180) / Math.PI;
    return (bearing + 360) % 360;
  };

  // Fetch Qibla direction from Aladhan API
  const fetchQiblaFromAPI = async (lat: number, lng: number): Promise<number | null> => {
    try {
      const response = await fetch(`https://api.aladhan.com/v1/qibla/${lat}/${lng}`);
      if (!response.ok) throw new Error("API request failed");
      const data = await response.json();
      if (data.code === 200 && data.data?.direction) {
        return data.data.direction;
      }
      return null;
    } catch (error) {
      console.error("Aladhan API error:", error);
      return null;
    }
  };

  // Mendapatkan lokasi user dan arah kiblat dari Aladhan API
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({
            latitude,
            longitude,
            city: user?.profile?.city?.name || "Lokasi Anda",
          });
          
          // Coba fetch dari Aladhan API terlebih dahulu
          const apiQibla = await fetchQiblaFromAPI(latitude, longitude);
          
          if (apiQibla !== null) {
            // Gunakan hasil dari API
            setQiblaDirection(apiQibla);
          } else {
            // Fallback ke kalkulasi lokal jika API gagal
            const localQibla = calculateQiblaDirection(latitude, longitude);
            setQiblaDirection(localQibla);
          }
          
          setLoading(false);
        },
        (err) => {
          setError(
            "Gagal mendapatkan lokasi. Pastikan GPS aktif dan izin lokasi diberikan.",
          );
          setLoading(false);
        },
      );
    } else {
      setError("Browser tidak mendukung Geolocation.");
      setLoading(false);
    }
  }, [user]);

  // Handle device orientation (kompas)
  useEffect(() => {
    // Skip if not in browser environment
    if (typeof window === 'undefined') return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      let heading = 0;
      // iOS - uses webkitCompassHeading
      if ((event as any).webkitCompassHeading !== undefined) {
        heading = (event as any).webkitCompassHeading;
      }
      // Android
      else if (event.alpha !== null) {
        heading = 360 - event.alpha; // convert to compass direction
      }
      setDeviceHeading(heading);
      setPermissionGranted(true);
    };

    // request permission iOS
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof (DeviceOrientationEvent as any).requestPermission === "function") {
      (DeviceOrientationEvent as any)
        .requestPermission()
        .then((response: string) => {
          if (response === "granted") {
            window.addEventListener("deviceorientation", handleOrientation, true);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener("deviceorientation", handleOrientation, true);
    }

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation, true);
    };
  }, []);

  // Hitung arah relatif kiblat terhadap device
  const getRelativeQiblaDirection = (): number => {
    if (qiblaDirection === null) return 0;
    const diff = qiblaDirection - deviceHeading;
    return (diff + 360) % 360; // normalisasi 0–360
  };

  const requestPermission = async () => {
    if (
      typeof window !== 'undefined' &&
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      try {
        const permissionState = await (
          DeviceOrientationEvent as any
        ).requestPermission();
        if (permissionState === "granted") {
          setPermissionGranted(true);
        }
      } catch (error) {
        console.error("Permission denied:", error);
      }
    }
  };

  return (
    <div className="pt-[4.2rem] min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      <TopBar withBackButton>Arah Kiblat</TopBar>
      <div className="p-4">
        {/* Info Lokasi */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-lg font-semibold text-green-800 mb-2">
            Informasi Lokasi
          </h2>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-3 text-gray-600">Mendapatkan lokasi...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Kota:</span>
                <span className="font-medium">{location?.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Latitude:</span>
                <span className="font-medium">
                  {location?.latitude.toFixed(4)}°
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Longitude:</span>
                <span className="font-medium">
                  {location?.longitude.toFixed(4)}°
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-gray-600">Arah Kiblat:</span>
                <span className="font-bold text-green-700 text-lg">
                  {qiblaDirection?.toFixed(1)}° dari Utara
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Kompas Kiblat */}
        {!loading && !error && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-green-800 mb-4 text-center">
              Kompas Arah Kiblat
            </h2>

            {/* Permission Button for iOS */}
            {!permissionGranted && (
              <div className="mb-4 text-center">
                <button
                  onClick={requestPermission}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  Aktifkan Kompas
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Klik untuk mengaktifkan sensor kompas
                </p>
              </div>
            )}

            {/* Compass Container */}
            <div className="relative flex flex-col items-center">
              {/* Outer Circle - Compass */}
              <div className="relative w-80 h-80 rounded-full border-8 border-green-600 bg-gradient-to-b from-sky-100 to-sky-200 shadow-xl">
                {/* Cardinal Directions */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                  <span className="text-red-600 font-bold text-xl">U</span>
                </div>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                  <span className="text-gray-600 font-bold text-xl">S</span>
                </div>
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                  <span className="text-gray-600 font-bold text-xl">B</span>
                </div>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <span className="text-gray-600 font-bold text-xl">T</span>
                </div>

                {/* Center Circle */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-green-600 shadow-lg flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 576 512"
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                  >
                    <path d="M0 239.4V197.4L278.1 115.3C284.9 113.6 291.1 113.6 297 115.3L576 197.4V239.4L537.1 228.6C528.6 226.2 519.7 231.2 517.4 239.7C515 248.2 520 257.1 528.5 259.4L576 272.6V409.5C576 431.1 560.4 451.5 538.4 456.4L298.4 509.7C291.6 511.2 284.4 511.2 277.6 509.7L37.59 456.4C15.63 451.5 0 431.1 0 409.5V272.6L47.48 259.4C55.1 257.1 60.98 248.2 58.62 239.7C56.25 231.2 47.43 226.2 38.92 228.6L0 239.4zM292.3 160.6C289.5 159.8 286.5 159.8 283.7 160.6L240.5 172.6C232 174.9 227 183.8 229.4 192.3C231.7 200.8 240.6 205.8 249.1 203.4L288 192.6L326.9 203.4C335.4 205.8 344.3 200.8 346.6 192.3C348.1 183.8 343.1 174.9 335.5 172.6L292.3 160.6zM191.5 219.4C199.1 217.1 204.1 208.2 202.6 199.7C200.3 191.2 191.4 186.2 182.9 188.6L96.52 212.6C88 214.9 83.02 223.8 85.38 232.3C87.75 240.8 96.57 245.8 105.1 243.4L191.5 219.4zM393.1 188.6C384.6 186.2 375.7 191.2 373.4 199.7C371 208.2 376 217.1 384.5 219.4L470.9 243.4C479.4 245.8 488.3 240.8 490.6 232.3C492.1 223.8 487.1 214.9 479.5 212.6L393.1 188.6zM269.9 84.63L0 164V130.6C0 109.9 13.22 91.59 32.82 85.06L272.8 5.061C282.7 1.777 293.3 1.777 303.2 5.061L543.2 85.06C562.8 91.59 576 109.9 576 130.6V164L306.1 84.63C294.3 81.17 281.7 81.17 269.9 84.63V84.63z" />
                  </svg>
                </div>

                {/* Qibla Arrow */}
                <div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full origin-bottom transition-transform duration-300 ease-out"
                  style={{
                    transform: `translate(-50%, -100%) rotate(${getRelativeQiblaDirection()}deg)`,
                  }}
                >
                  <div className="relative">
                    {/* Arrow Shaft */}
                    <div className="w-2 h-32 bg-gradient-to-b from-green-700 to-green-500 rounded-full shadow-lg mx-auto"></div>
                    {/* Arrow Head */}
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div
                        className="w-0 h-0"
                        style={{
                          borderLeft: "12px solid transparent",
                          borderRight: "12px solid transparent",
                          borderBottom: "20px solid #15803d",
                        }}
                      ></div>
                    </div>
                    {/* Ka'bah Icon */}
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-2 shadow-md">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 576 512"
                        className="w-6 h-6 text-green-700"
                        fill="currentColor"
                      >
                        <path d="M0 239.4V197.4L278.1 115.3C284.9 113.6 291.1 113.6 297 115.3L576 197.4V239.4L537.1 228.6C528.6 226.2 519.7 231.2 517.4 239.7C515 248.2 520 257.1 528.5 259.4L576 272.6V409.5C576 431.1 560.4 451.5 538.4 456.4L298.4 509.7C291.6 511.2 284.4 511.2 277.6 509.7L37.59 456.4C15.63 451.5 0 431.1 0 409.5V272.6L47.48 259.4C55.1 257.1 60.98 248.2 58.62 239.7C56.25 231.2 47.43 226.2 38.92 228.6L0 239.4zM292.3 160.6C289.5 159.8 286.5 159.8 283.7 160.6L240.5 172.6C232 174.9 227 183.8 229.4 192.3C231.7 200.8 240.6 205.8 249.1 203.4L288 192.6L326.9 203.4C335.4 205.8 344.3 200.8 346.6 192.3C348.1 183.8 343.1 174.9 335.5 172.6L292.3 160.6zM191.5 219.4C199.1 217.1 204.1 208.2 202.6 199.7C200.3 191.2 191.4 186.2 182.9 188.6L96.52 212.6C88 214.9 83.02 223.8 85.38 232.3C87.75 240.8 96.57 245.8 105.1 243.4L191.5 219.4zM393.1 188.6C384.6 186.2 375.7 191.2 373.4 199.7C371 208.2 376 217.1 384.5 219.4L470.9 243.4C479.4 245.8 488.3 240.8 490.6 232.3C492.1 223.8 487.1 214.9 479.5 212.6L393.1 188.6zM269.9 84.63L0 164V130.6C0 109.9 13.22 91.59 32.82 85.06L272.8 5.061C282.7 1.777 293.3 1.777 303.2 5.061L543.2 85.06C562.8 91.59 576 109.9 576 130.6V164L306.1 84.63C294.3 81.17 281.7 81.17 269.9 84.63V84.63z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Degree Markers */}
                <div className="absolute inset-0">
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(
                    (degree) => (
                      <div
                        key={degree}
                        className="absolute top-1/2 left-1/2 w-1 h-32 origin-bottom"
                        style={{
                          transform: `translate(-50%, -100%) rotate(${degree}deg)`,
                        }}
                      >
                        <div className="w-full h-2 bg-gray-400"></div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Info Text */}
              <div className="mt-6 text-center space-y-2">
                <p className="text-gray-700 font-medium">
                  Arahkan perangkat ke arah panah hijau
                </p>
                {permissionGranted ? (
                  <p className="text-sm text-green-600">
                    ✓ Kompas aktif - Gerakkan perangkat untuk kalibrasi
                  </p>
                ) : (
                  <p className="text-sm text-orange-600">
                    ⚠ Kompas belum aktif - Klik tombol di atas
                  </p>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-6 bg-green-50 rounded-lg p-4 border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">Cara Menggunakan:</h3>
              <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                <li>Pastikan GPS dan kompas perangkat aktif</li>
                <li>Pegang perangkat secara horizontal (datar)</li>
                <li>Putar badan hingga panah hijau mengarah ke depan</li>
                <li>Arah tersebut adalah arah kiblat</li>
              </ol>
            </div>
          </div>
        )}

        {/* Jarak ke Mekah */}
        {location && (
          <div className="mt-4 bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold text-green-800 mb-2">Jarak ke Ka'bah</h3>
            <p className="text-2xl font-bold text-green-700">
              {calculateDistance(
                location.latitude,
                location.longitude,
                MECCA_LAT,
                MECCA_LNG,
              ).toFixed(0)}{" "}
              km
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Fungsi menghitung jarak menggunakan Haversine formula
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371; // Radius bumi dalam km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default ArahKiblatPage;