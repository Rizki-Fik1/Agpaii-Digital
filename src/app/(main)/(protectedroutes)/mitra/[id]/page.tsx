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
	const [images, setImages] = useState<string[]>([]);
	const [externalUrl, setExternalUrl] = useState<string>("");
	const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
	const [isOwner, setIsOwner] = useState<boolean>(false);
	const [applicants, setApplicants] = useState<any[]>([]);
	const [loadingApplicants, setLoadingApplicants] = useState<boolean>(false);

	const MEMBER_API_URL = "https://2024.agpaiidigital.org/api/v2/member";
    const DATA_API_URL = "https://admin.agpaiidigital.org/api"; 
    // const APPLICANT_API_URL = "https://admin.agpaiidigital.org/api"; // Try admin first
    const APPLICANT_API_URL = "https://2024.agpaiidigital.org/api/v2/member"; // Revert to member if admin fails?
	// Hardcode to match list page logic first, then check env var later if needed
	const STORAGE_URL = "https://file.agpaiidigital.org"; 

	// Fetch Mitra Details
      useEffect(() => {
      if (!id) return;

      const fetchMitraData = async () => {
          try {
              // Fetching details still uses the admin domain to match list page consistency
              const response = await axios.get(
                  `${DATA_API_URL}/mitra/getdata/${id}`
              );
              
              console.log("DEBUG: Mitra Detail Response", response.data);

              setSubtitle(response.data.judul_campaign || response.data.mitra);
              setDescription(response.data.deskripsi);
              
              // Check Ownership
              
              const isOwnerCheck = 
                auth?.id && (
                    response.data.id_user == auth.id || 
                    response.data.created_by == auth.id ||
                    response.data.user_id == auth.id // Added user_id check
                );

              if (isOwnerCheck) {
                  console.log("DEBUG: Current user is the owner of this Mitra campaign.");
                  setIsOwner(true);
              } else {
                  // FORCE OWNER FOR DEBUGGING if user confirms they are owner but logic fails
                  // console.log("DEBUG: Force Owner for testing");
                  // setIsOwner(true); 
              }

              const extUrl = response.data.external_url || response.data.url || "";
              console.log("DEBUG: External URL found:", extUrl);
              setExternalUrl(extUrl);

              let imgs: string[] = [];
              
              // 1. Try 'images' (New API field)
              if (response.data.images && Array.isArray(response.data.images)) {
                  imgs = response.data.images;
              }
              // 2. Try 'gambar' (Legacy / stringified JSON)
              else if (response.data.gambar) {
                  const rawGambar = response.data.gambar;
                  try {
                      if (rawGambar.startsWith('[') || rawGambar.startsWith('{')) {
                           const parsed = JSON.parse(rawGambar);
                           if (Array.isArray(parsed) && parsed.length > 0) {
                               imgs = parsed;
                           } else if (typeof parsed === 'string') {
                               imgs = [parsed];
                           }
                      } else {
                          imgs = [rawGambar];
                      }
                  } catch (e) {
                      imgs = [rawGambar];
                  }
              }
              // 3. Try 'logo'
              else if (response.data.logo) {
                   imgs = [response.data.logo];
              }

              // 4. Fallback if empty
              if (imgs.length === 0) {
                  const mitraName = response.data.judul_campaign || response.data.mitra || 'Mitra';
                  imgs = [`https://ui-avatars.com/api/?name=${encodeURIComponent(mitraName)}&background=random&size=512`];
              }
              
              // Ensure valid URLs (prepend STORAGE_URL if needed)
              const validImages = imgs
                  .filter(img => typeof img === 'string')
                  .map(img => img.startsWith('http') ? img : `${STORAGE_URL}/${img}`);

              console.log("DEBUG: Setting images to:", validImages);
              setImages(validImages);

          } catch (error) {
              console.error("Error fetching getdata:", error);
          }
      };

      fetchMitraData();
  }, [id, auth?.id]);

    // Check Ownership via "By User" List (Robust Fallback)
    useEffect(() => {
        if (!id || !auth?.id) return;

        const checkOwnershipViaList = async () => {
            try {
                // Fetch list of mitras created by this user
                const response = await axios.get(`${DATA_API_URL}/mitra/by-user`, {
                    params: { user_id: auth.id }
                });

                if (response.data && Array.isArray(response.data.data)) {
                    // Check if current ID exists in the user's created list
                    const isMyMitra = response.data.data.some((item: any) => item.id == id);
                    if (isMyMitra) {
                        console.log("DEBUG: Ownership confirmed via list check.");
                        setIsOwner(true);
                    }
                }
            } catch (error) {
                console.error("Error checking ownership via list:", error);
            }
        };

        checkOwnershipViaList();
    }, [id, auth?.id]);

	// Check Confirmation Status
	useEffect(() => {
		if (!id || !auth?.id) return;

		const checkConfirmationStatus = async () => {
			try {
				const response = await axios.get(
					`${MEMBER_API_URL}/mitra/checklistdata?user_id=${auth.id}&mitra_id=${id}`,
				);
				setIsConfirmed(response.data > 0);
			} catch (error: any) {
                // If 404 or other error, assume not confirmed
                if (error.response && error.response.status === 404) {
                    console.log("Checklist data not found (404), assuming user not confirmed.");
                    setIsConfirmed(false);
                } else {
    				console.error("Error checking confirmation status:", error);
                }
			}
		};

		checkConfirmationStatus();
	}, [id, auth.id]);

	// Fetch Applicants if Owner
	useEffect(() => {
		if (!id || !isOwner) return;

        const fetchApplicants = async () => {
			try {
                // Fetch both approved and pending, then merge them
				const [approvedRes, pendingRes] = await Promise.all([
					axios.get(`${DATA_API_URL}/list-mitra/approved?mitra_id=${id}`),
					axios.get(`${DATA_API_URL}/list-mitra/pending?mitra_id=${id}`)
				]);

                const approved = approvedRes.data.success ? (approvedRes.data.data || []) : [];
                const pending = pendingRes.data.success ? (pendingRes.data.data || []) : [];
                
                // Merge lists
				setApplicants([...approved, ...pending]);
                
			} catch (error: any) {
				console.error("Error fetching applicants:", error);
			} finally {
				setLoadingApplicants(false);
			}
        };

		fetchApplicants();
	}, [id, isOwner]);

	const handleOpenExternalUrl = () => {
        console.log("DEBUG: handleOpenExternalUrl triggered", externalUrl);
		if (externalUrl) {
            const url = externalUrl.startsWith('http') ? externalUrl : `https://${externalUrl}`;
            console.log("DEBUG: Opening URL", url);
			window.open(url, "_blank");
		} else {
            console.warn("DEBUG: externalUrl is empty");
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
				images={images}
				isConfirmed={isConfirmed}
				onConfirm={() => router.push(`/mitra/confirmdata/${id}`)}
				onExternalUrlClick={handleOpenExternalUrl}
                canRegister={
                    (typeof auth?.role === 'object' ? auth?.role?.name : auth?.role) !== 'Mitra' && 
                    (typeof auth?.role === 'object' ? auth?.role?.name : auth?.role) !== 'mitra'
                } // Mitra role cannot register for other mitras
                isOwner={isOwner}
                applicants={applicants}
                loadingApplicants={loadingApplicants}
			/>
		</div>
	);
};

export default MitraDetailPage;
