"use client";

import { useState, useEffect } from "react";
import TopBar from "@/components/nav/topbar";
import API from "@/utils/api/config";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

interface Member {
	id: string;
	name: string;
	profile?: {
		school_place?: string;
	};
}

const MemberList = () => {
	const { districtId } = useParams();
	const [dataMember, setDataMember] = useState<Member[]>([]);
	const [nextUrl, setNextUrl] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [searchKeyword, setSearchKeyword] = useState<string>("");
	const searchParams = useSearchParams();
	const filter = searchParams.get("filter"); // bisa null kalau tidak ada

	useEffect(() => {
		getMembers();
	}, []);

	const getMembers = async () => {
		try {
			setIsLoading(true);
			const response = await API.get(
				`/district/${districtId}/district-member-info?filter=${filter}`,
			);
			if (response.data) {
				setDataMember(response.data.data || []);
				setNextUrl(response.data.next_page_url || null);
			}
		} catch (error) {
			console.error("Error fetching members:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleRetrieveMore = async () => {
		if (!nextUrl) return;
		try {
			const response = await API.get(nextUrl);
			setDataMember((prevData: Member[]) => [
				...prevData,
				...(response.data.data || []),
			]);
			setNextUrl(response.data.next_page_url || null);
		} catch (error) {
			console.error("Error fetching more members:", error);
		}
	};

	const handleSearchMember = async (keyword: string) => {
		setSearchKeyword(keyword);
		try {
			setIsLoading(true);
			const response = await API.get(
				`/district/${districtId}/search/${keyword}?filter=${filter}`,
			);
			setDataMember(response.data.data || []);
			setNextUrl(response.data.next_page_url || null);
		} catch (error) {
			console.error("Error searching members:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const { data: district } = useQuery({
		queryKey: ["district", districtId],
		queryFn: async () => {
			const res = await API.get("district/" + districtId);
			return res.status === 200 && res.data;
		},
	});

	return (
		<div className="pt-[4.21rem]">
			<TopBar withBackButton>Informasi Anggota</TopBar>
			<div className="px-6 py-4 border-b border-b-slate-300">
				<h1 className="text-sm text-slate-500">Kecamatan</h1>
				<h1 className="text-xl font-semibold capitalize">
					{district?.name.toLowerCase()}
				</h1>
			</div>
			<div className="p-4">
				<div className="mb-4">
					<input
						type="text"
						placeholder="Cari anggota..."
						value={searchKeyword}
						onChange={(e) => handleSearchMember(e.target.value)}
						className="w-full p-2 border rounded"
					/>
				</div>

				{isLoading ? (
					<div className="text-center py-4">Loading...</div>
				) : (
					<div>
						{dataMember.length > 0 ? (
							<ul className="space-y-4">
								{dataMember.map((member) => (
									<li
										key={member.id}
										className="p-4 border rounded shadow cursor-pointer hover:bg-gray-100">
										<Link href={`/profile/${member.id}`}>
											<div className="font-bold text-lg">{member.name}</div>
											<div className="text-sm text-gray-600">
												{member.profile?.school_place || "Tidak diketahui"}
											</div>
										</Link>
									</li>
								))}
							</ul>
						) : (
							<div className="text-center py-4">
								Tidak ada anggota yang ditemukan.
							</div>
						)}

						{nextUrl && (
							<button
								onClick={handleRetrieveMore}
								className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
								Muat Lebih Banyak
							</button>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default MemberList;
