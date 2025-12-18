"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
	collection,
	query,
	where,
	onSnapshot,
	DocumentData,
	doc,
	deleteDoc,
	getDocs,
	writeBatch,
} from "firebase/firestore";

import API from "@/utils/api/config";
import { IUser, IConversation } from "@/types/chat";
import { useAuth } from "@/utils/context/auth_context";
import { db } from "../../../../../../../../firebase";
import { MagnifyingGlassIcon, HomeIcon, HeartIcon as HeartOutlineIcon, ChatBubbleLeftIcon, UserIcon, PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function ChatIndex() {
	const router = useRouter();
	const { auth } = useAuth();
	const currentUserId = auth?.id;

	const [search, setSearch] = useState<string>("");
	const [users, setUsers] = useState<IUser[]>([]);
	const [conversations, setConversations] = useState<IConversation[]>([]);
	const [loading, setLoading] = useState<boolean>(false);

	const [showDeletePopup, setShowDeletePopup] = useState<boolean>(false);
	const [selectedConversationId, setSelectedConversationId] = useState<
		string | null
	>(null);

	// Timer ref untuk long press
	const pressTimer = useRef<NodeJS.Timeout | null>(null);

	// 1. Subscribe Firestore
	useEffect(() => {
		if (!currentUserId) return;
		const colRef = collection(db, "conversations");
		const q = query(
			colRef,
			where("participants", "array-contains", currentUserId),
		);

		const unsubscribe = onSnapshot(
			q,
			(snapshot) => {
				const convs: IConversation[] = [];
				snapshot.forEach((docSnap) => {
					const data = docSnap.data() as DocumentData;
					convs.push({ id: docSnap.id, ...data } as IConversation);
				});
				setConversations(convs);
			},
			(err) => console.error("Error subscribing conversations:", err),
		);

		return () => unsubscribe();
	}, [currentUserId]);

	// 2. Panggil API /users/chat?ids=... atau /users?search=...
	useEffect(() => {
		if (!currentUserId) return;

		const fetchUsersList = async () => {
			try {
				setLoading(true);
				if (search.trim() === "") {
					// Tampilkan user yang pernah chat
					const partnerIds = conversations
						.map((c) =>
							c.participants.find(
								(pid) => String(pid) !== String(currentUserId),
							),
						)
						.filter((id): id is string | number => !!id);

					if (partnerIds.length === 0) {
						setUsers([]);
						return;
					}

					const idsParam = partnerIds.map(String).join(",");
					const response = await API.get(`/users/chat?ids=${idsParam}`);
					setUsers(response.data); // array user
				} else {
					// Tampilkan hasil search semua user
					const response = await API.get(
						`/users?search=${encodeURIComponent(search)}`,
					);
					const json = response.data;
					if (json.data) {
						setUsers(json.data);
					} else {
						setUsers(json);
					}
				}
			} catch (err) {
				console.error("Error fetching users:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchUsersList();
	}, [search, conversations, currentUserId]);

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearch(e.target.value);
	};

	// Tekan + tahan => pop-up hapus
	const handlePressAndHold = (
		e: React.MouseEvent | React.TouchEvent,
		conversationId: string,
	) => {
		e.preventDefault();
		pressTimer.current = setTimeout(() => {
			setSelectedConversationId(conversationId);
			setShowDeletePopup(true);
		}, 1000);
	};

	// Lepas => jika timer masih aktif, batalkan & jalankan klik biasa
	const handleRelease = (
		e: React.MouseEvent | React.TouchEvent,
		user: IUser,
		conversationId?: string,
	) => {
		if (pressTimer.current) {
			clearTimeout(pressTimer.current);
			pressTimer.current = null;

			// Jika pop-up belum muncul => "klik biasa"
			if (!showDeletePopup) {
				handleClickUser(user);
			}
		} else {
			// Timer sudah jalan, pop-up muncul => do nothing
		}
	};

	// handleClickUser => navigasi
	const handleClickUser = (user: IUser) => {
		router.push(`/social-media/chat/${user.id}/${user.name}`);
	};

	// Hapus conversation
	const handleDeleteConversation = async () => {
		if (!selectedConversationId) return;
		try {
			// 1. Ambil semua doc di sub-collection "messages"
			//    (dan sub-collection "unread" jika Anda punya)
			const msgsRef = collection(
				db,
				"conversations",
				selectedConversationId,
				"messages",
			);
			const msgsSnap = await getDocs(msgsRef);

			// (Opsional) jika Anda menyimpan data "unread"
			const unreadRef = collection(
				db,
				"conversations",
				selectedConversationId,
				"unread",
			);
			const unreadSnap = await getDocs(unreadRef);

			// 2. Gunakan writeBatch agar efisien
			const batch = writeBatch(db);

			// Hapus semua doc di "messages"
			msgsSnap.forEach((msgDoc) => {
				batch.delete(msgDoc.ref);
			});

			// (Opsional) Hapus semua doc di "unread"
			unreadSnap.forEach((uDoc) => {
				batch.delete(uDoc.ref);
			});

			// 3. Commit batch => sub-collection terhapus
			await batch.commit();

			// 4. Terakhir, hapus dokumen induk conversation
			await deleteDoc(doc(db, "conversations", selectedConversationId));

			// Tutup pop-up
			setShowDeletePopup(false);
			setSelectedConversationId(null);
		} catch (error) {
			console.error("Error deleting conversation:", error);
		}
	};

	return (
		<div className="pb-28 bg-white min-h-screen">
			{/* HEADER */}
			<div className="fixed top-0 left-0 right-0 mx-auto max-w-[480px] px-4 sm:px-5 py-5 bg-teal-700 flex items-center z-[9999] shadow">
				<button
					onClick={() => router.back()}
					className="flex items-center"
				>
					<svg className="size-6 cursor-pointer text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
					</svg>
				</button>
				<h1 className="text-white font-semibold ml-3 flex-grow">Pesan</h1>
			</div>

			{/* SEARCH BAR */}
			<div className="mt-[4.7rem] px-4 py-4 bg-white border-b border-slate-200">
				<div className="flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2.5">
					<MagnifyingGlassIcon className="size-5 text-slate-500" />
					<input
						type="text"
						className="bg-slate-100 flex-1 border-0 focus:outline-none focus:ring-0 placeholder-slate-400 text-sm"
						placeholder="Cari Pengguna..."
						value={search}
						onChange={handleSearchChange}
					/>
				</div>
			</div>

			{/* CHAT LIST */}
			<div className="px-4 py-4">
				{loading && <p className="text-center text-slate-500 py-8">Loading...</p>}

				{users.length === 0 && !loading ? (
					<p className="text-center text-slate-500 py-8">
						{search.trim() === ""
							? "Belum ada chat"
							: "Tidak ditemukan user yang cocok"}
					</p>
				) : (
					<div className="space-y-3">
						{users.map((u) => {
							// Temukan conversation untuk user ini (jika ada)
							const conversation = conversations.find((c) =>
								c.participants.includes(u.id),
							);
							const conversationId = conversation?.id;

							const unreadCount =
								conversation?.unreadCount?.[String(currentUserId)] || 0;

							// Get last message preview
							const lastMessage = conversation?.lastMessage || "";

							return (
								<div
									key={u.id}
									className="bg-white rounded-lg p-4 border border-slate-200 flex items-center justify-between cursor-pointer hover:shadow-md transition"
									onMouseDown={(e) => {
										if (conversationId) handlePressAndHold(e, conversationId);
									}}
									onMouseUp={(e) => handleRelease(e, u, conversationId)}
									onTouchStart={(e) => {
										if (conversationId) handlePressAndHold(e, conversationId);
									}}
									onTouchEnd={(e) => handleRelease(e, u, conversationId)}
									onClick={() => handleClickUser(u)}>
									
									<div className="flex items-center gap-3 flex-1 min-w-0">
										<img
											src={
												!u.avatar || u.avatar === "users/default.png"
													? "https://avatar.iran.liara.run/public"
													: `${process.env.NEXT_PUBLIC_STORAGE_URL || ""}/${
															u.avatar
													  }`
											}
											alt="avatar"
											className="w-12 h-12 rounded-full object-cover flex-shrink-0"
										/>
										<div className="flex-1 min-w-0">
											<p className="font-semibold text-slate-800 text-sm truncate">
												{u.name || "Tidak ada Nama"}
											</p>
											<p className="text-slate-500 text-xs truncate">
												{lastMessage || "Mulai percakapan"}
											</p>
										</div>
									</div>

									<div className="flex items-center gap-3 flex-shrink-0">
										<span className="text-xs text-slate-500 whitespace-nowrap">
											{conversation?.lastMessage ? "" : ""}
										</span>
										{unreadCount > 0 && (
											<span className="bg-teal-700 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
												{unreadCount}
											</span>
										)}
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>

			{/* BOTTOM NAVIGATION BAR */}
			<div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto border-t border-slate-200 bg-white px-0 py-0 flex justify-around items-center">
				<Link
					href="/social-media"
					className="flex-1 flex flex-col items-center justify-center py-3 px-4 text-slate-400"
				>
					<HomeIcon className="size-6 mb-0.5" />
					<span className="text-xs">Beranda</span>
				</Link>
				<Link
					href="/social-media/liked"
					className="flex-1 flex flex-col items-center justify-center py-3 px-4 text-slate-400"
				>
					<HeartOutlineIcon className="size-6 mb-0.5" />
					<span className="text-xs">Disukai</span>
				</Link>
				<Link
					href="/social-media/post/new"
					className="flex-1 flex flex-col items-center justify-center py-3 px-4 text-teal-700"
				>
					<div className="flex items-center justify-center w-10 h-10 rounded-full bg-teal-700 mb-0.5">
						<PlusIcon className="size-6 text-white" />
					</div>
					<span className="text-xs">Posting</span>
				</Link>
				<Link
					href="/social-media/chat"
					className="flex-1 flex flex-col items-center justify-center py-3 px-4 text-teal-700 border-b-2 border-teal-700"
				>
					<ChatBubbleLeftIcon className="size-6 mb-0.5" />
					<span className="text-xs">Pesan</span>
				</Link>
				<Link
					href="/profile"
					className="flex-1 flex flex-col items-center justify-center py-3 px-4 text-slate-400"
				>
					<UserIcon className="size-6 mb-0.5" />
					<span className="text-xs">Profil</span>
				</Link>
			</div>

			{/* Pop-up Hapus Percakapan */}
			{showDeletePopup && (
				<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
					<div className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-4">
						<p className="text-slate-800 font-medium mb-6">Yakin ingin menghapus percakapan ini?</p>
						<div className="flex justify-end gap-3">
							<button
								className="px-6 py-2 bg-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-400 transition"
								onClick={() => {
									setShowDeletePopup(false);
									setSelectedConversationId(null);
								}}>
								Batal
							</button>
							<button
								className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition"
								onClick={handleDeleteConversation}>
								Hapus
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
