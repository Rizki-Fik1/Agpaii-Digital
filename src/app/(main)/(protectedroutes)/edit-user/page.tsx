"use client";

import React, {
	useState,
	useEffect,
	useRef,
	useCallback,
	ChangeEvent,
} from "react";
import TopBar from "@/components/nav/topbar";
import API from "@/utils/api/config";
import { debounce } from "lodash"; // Import lodash untuk debounce
import { useRouter } from "next/navigation"; // Gunakan router Next.js

// Tipe untuk profile user
interface UserProfile {
	id: number;
	user_id: number;
	nip: string | null;
	nik: string | null;
	contact: string;
	school_place: string;
	home_address: string;
	educational_level_id: number | null;
	unit_kerja: string | null;
	nama_kepala_satuan_pendidikan: string | null;
	nip_kepala_satuan_pendidikan: string | null;
	gender: string | null;
	birthdate: string;
	created_at: string;
	updated_at: string;
	province_id: number;
	city_id: number;
	district_id: number;
	short_bio: string | null;
	long_bio: string | null;
	headmaster_name: string | null;
	headmaster_nip: string | null;
	grade_id: number | null;
	school_status: string | null;
}

// Tipe untuk user
interface User {
	id: number;
	kta_id: number | null;
	role_id: number;
	name: string;
	email: string;
	avatar: string;
	email_verified_at: string;
	user_activated_at: string;
	point: number;
	settings: any[];
	session_id: string | null;
	is_login_google: number;
	user_level: number;
	created_at: string;
	updated_at: string;
	expired_at: string;
	deleted_at: string | null;
	age: number;
	profile: UserProfile;
}

// Tipe untuk response paginasi
interface PaginatedResponse<T> {
	current_page: number;
	data: T[];
	first_page_url: string;
	from: number;
	last_page: number;
	last_page_url: string;
	links: any[];
	next_page_url: string | null;
	path: string;
	per_page: number;
	prev_page_url: string | null;
	to: number;
	total: number;
}

const EditUserPage: React.FC = () => {
	const router = useRouter(); // Router untuk navigasi klik
	const [keyword, setKeyword] = useState<string>("");
	const [debouncedKeyword, setDebouncedKeyword] = useState<string>("");
	const [users, setUsers] = useState<User[]>([]);
	const [page, setPage] = useState<number>(1);
	const [hasMore, setHasMore] = useState<boolean>(true);
	const observer = useRef<IntersectionObserver | null>(null);

	// Debounce untuk mengurangi request API saat mengetik
	const debouncedSearch = useCallback(
		debounce((value: string) => {
			setDebouncedKeyword(value);
			setPage(1); // Reset halaman
			setUsers([]); // Reset list user
			setHasMore(true);
		}, 500),
		[],
	);

	// Event handler input pencarian dengan debounce
	const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
		setKeyword(e.target.value);
		debouncedSearch(e.target.value);
	};

	// Infinite scroll observer
	const lastUserElementRef = useCallback(
		(node: HTMLLIElement | null) => {
			if (observer.current) observer.current.disconnect();
			observer.current = new IntersectionObserver((entries) => {
				if (entries[0].isIntersecting && hasMore) {
					setPage((prevPage) => prevPage + 1);
				}
			});
			if (node) observer.current.observe(node);
		},
		[hasMore],
	);

	// Fetch data setiap kali 'debouncedKeyword' atau 'page' berubah
	useEffect(() => {
		async function getUsers() {
			try {
				const queryKeyword = debouncedKeyword.trim()
					? debouncedKeyword.trim()
					: "all";
				const url = `/users/search/${queryKeyword}`;
				const response = await API.get<PaginatedResponse<User>>(url, {
					params: { page },
				});
				const fetchedUsers = response.data.data;

				// Hindari duplikasi user sebelum menyimpan ke state
				setUsers((prevUsers) => {
					const newUsers = fetchedUsers.filter(
						(newUser) =>
							!prevUsers.some((prevUser) => prevUser.id === newUser.id),
					);
					return [...prevUsers, ...newUsers];
				});

				setHasMore(response.data.next_page_url !== null);
			} catch (error) {
				console.error("Error fetching users:", error);
			}
		}
		getUsers();
	}, [debouncedKeyword, page]);

	// Navigasi ke halaman detail saat diklik
	const handleUserClick = (userId: number) => {
		router.push(`/edit-user/${userId}`);
	};

	return (
		<div className="pb-20 pt-[4.21rem]">
			<TopBar withBackButton>Admin Edit Users</TopBar>
			<div className="container mx-auto p-4">
				<input
					type="text"
					placeholder="Cari user..."
					value={keyword}
					onChange={handleSearchChange}
					className="border p-2 w-full mb-4"
				/>
				<ul>
					{users.map((user, index) => {
						// Data dengan fallback jika kosong
						const name = user.name?.trim() ? user.name : "N/A";
						const email = user.email?.trim() ? user.email : "N/A";
						const kta_id =
							user.kta_id !== null && user.kta_id !== 0 ? user.kta_id : "N/A";
						const nik =
							user.profile?.nik && user.profile.nik.trim()
								? user.profile.nik
								: "N/A";

						// Gunakan kombinasi unik untuk key
						const uniqueKey = `${user.id}-${user.created_at}`;

						return (
							<li
								key={uniqueKey}
								ref={users.length === index + 1 ? lastUserElementRef : null}
								onClick={() => handleUserClick(user.id)}
								className="border p-4 mb-2 rounded shadow-sm cursor-pointer hover:bg-gray-100 transition-all">
								<p>
									<strong>Nama:</strong> {name}
								</p>
								<p>
									<strong>Email:</strong> {email}
								</p>
								<p>
									<strong>KTA ID:</strong> {kta_id}
								</p>
								<p>
									<strong>NIK:</strong> {nik}
								</p>
							</li>
						);
					})}
				</ul>
				{hasMore && <p className="text-center mt-4">Loading more users...</p>}
			</div>
		</div>
	);
};

export default EditUserPage;
