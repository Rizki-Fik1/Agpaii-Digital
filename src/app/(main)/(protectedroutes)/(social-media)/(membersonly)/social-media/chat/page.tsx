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
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

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
					<div className="space-y-1">
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
									className="bg-white py-3 px-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition border-b border-slate-100 last:border-b-0"
									onMouseDown={(e) => {
										if (conversationId) handlePressAndHold(e, conversationId);
									}}
									onMouseUp={(e) => handleRelease(e, u, conversationId)}
									onTouchStart={(e) => {
										if (conversationId) handlePressAndHold(e, conversationId);
									}}
									onTouchEnd={(e) => handleRelease(e, u, conversationId)}
									onClick={() => handleClickUser(u)}>
									
									<div className="flex items-start gap-3 flex-1 min-w-0">
										<img
											src={
												!u.avatar || u.avatar === "users/default.png"
													? "/img/profileplacholder.png"
													: `${process.env.NEXT_PUBLIC_STORAGE_URL || ""}/${
															u.avatar
													  }`
											}
											alt="avatar"
											className="w-12 h-12 rounded-full object-cover flex-shrink-0"
										/>
										<div className="flex-1 min-w-0 pt-0.5">
											<p className="font-semibold text-slate-900 text-base truncate">
												{u.name || "Tidak ada Nama"}
											</p>
											<p className="text-slate-500 text-sm truncate">
												{lastMessage || "Mulai percakapan"}
											</p>
										</div>
									</div>

									<div className="flex flex-col items-end gap-2 flex-shrink-0 ml-2">
										<span className="text-xs text-slate-400 whitespace-nowrap">
											{conversation?.lastMessageTime ? new Date(conversation.lastMessageTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ""}
										</span>
										{unreadCount > 0 && (
											<span className="bg-teal-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center leading-none">
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
