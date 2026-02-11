"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/utils/context/auth_context";
import MitraDetailContent from "./MitraDetailContent"; // Komponen server-side
import TopBar from "@/components/nav/topbar";

const MitraDetailPage: React.FC = () => {
	const { id } = useParams();
	const router = useRouter();
	const { auth } = useAuth();

	const [showModal, setShowModal] = useState(false);
	const [subtitle, setSubtitle] = useState<string>("");
	const [description, setDescription] = useState<string>("");
	const [imageUrl, setImageUrl] = useState<string>("");
	const [externalUrl, setExternalUrl] = useState<string>("");
	const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

	const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL2 || "";
	const STORAGE_URL = process.env.NEXT_PUBLIC_MITRA_URL || "";

	// Fetch Mitra Details
      useEffect(() => {
      if (!id) return;

      const fetchMitraData = async () => {
          try {
              const response = await axios.get(
                  `https://admin.agpaiidigital.org/api/mitra/getdata/${id}`
              );

              console.log("DEBUG: Mitra Detail Response", response.data); // Debug log

              setSubtitle(response.data.mitra);
              setDescription(response.data.deskripsi);

              let img = "";
              if (response.data.gambar) {
                  let raw = response.data.gambar;
                  try {
                      if (raw.startsWith('[') || raw.startsWith('{')) {
                           const parsed = JSON.parse(raw);
                           if (Array.isArray(parsed) && parsed.length > 0) {
                               raw = parsed[0];
                           } else if (typeof parsed === 'string') {
                               raw = parsed;
                           }
                      }
                  } catch (e) {}

                  img = raw.startsWith('http') 
                      ? raw 
                      : `https://file.agpaiidigital.org/${raw}`;
              }
              
              console.log("DEBUG: Computed Image URL", img); // Debug log
              setImageUrl(img);

              setExternalUrl(response.data.external_url);
          } catch (error) {
              console.error("Error fetching mitra data:", error);
          }
      };

      fetchMitraData();
  }, [id]);


	// Check Confirmation Status
	useEffect(() => {
		if (!id) return;

		const checkConfirmationStatus = async () => {
			try {
				const response = await axios.get(
					`${process.env.NEXT_PUBLIC_API_BASE_URL2}/api/mitra/checklistdata?user_id=${auth.id}&mitra_id=${id}`,
				);
				setIsConfirmed(response.data > 0);
			} catch (error) {
				console.error("Error checking confirmation status:", error);
			}
		};

		checkConfirmationStatus();
	}, [id, auth.id, API_URL]);

	const handleOpenExternalUrl = () => {
		if (externalUrl) {
			window.open(externalUrl, "_blank");
		}
	};

	return (
		<div className="pt-[4.2rem]">
			<TopBar withBackButton>Detail Mitra</TopBar>
			{showModal && (
				<div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
					<div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-md">
						<div className="text-center">
							<img
								src="/icons/info.png"
								alt="Info"
								className="w-12 h-12 mx-auto"
							/>
							<h2 className="text-lg font-bold mt-4">
								Silahkan Konfirmasi Data Diri
							</h2>
							<p className="text-sm text-gray-600 mt-2">
								Dimohon untuk konfirmasi data diri terlebih dahulu sebelum
								mengisi form.
							</p>
						</div>
						<div className="mt-6 flex justify-between">
							<button
								className="bg-gray-300 text-black px-4 py-2 rounded"
								onClick={() => setShowModal(false)}>
								Keluar
							</button>
							<button
								className="bg-green-500 text-white px-4 py-2 rounded"
								onClick={() => {
									setShowModal(false);
									router.back(); // Change to the correct route
								}}>
								Konfirmasi Data Diri
							</button>
						</div>
					</div>
				</div>
			)}

			<MitraDetailContent
				subtitle={subtitle}
				description={description}
				imageUrl={imageUrl}
				isConfirmed={isConfirmed}
				onConfirm={() => router.push(`/mitra/confirmdata/${id}`)}
				onExternalUrlClick={handleOpenExternalUrl}
                canRegister={
                    (typeof auth?.role === 'object' ? auth?.role?.name : auth?.role) !== 'Mitra' && 
                    (typeof auth?.role === 'object' ? auth?.role?.name : auth?.role) !== 'mitra'
                } // Mitra role cannot register for other mitras
			/>
		</div>
	);
};

export default MitraDetailPage;
