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
import {
	MagnifyingGlassIcon,
	ArrowLeftIcon,
	ChatBubbleLeftRightIcon,
	TrashIcon,
} from "@heroicons/react/24/outline";

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

	// 2. Fetch user list
	useEffect(() => {
		if (!currentUserId) return;

		const fetchUsersList = async () => {
			try {
				setLoading(true);
				if (search.trim() === "") {
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
					setUsers(response.data);
				} else {
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

	const handleRelease = (
		e: React.MouseEvent | React.TouchEvent,
		user: IUser,
		conversationId?: string,
	) => {
		if (pressTimer.current) {
			clearTimeout(pressTimer.current);
			pressTimer.current = null;
			if (!showDeletePopup) {
				handleClickUser(user);
			}
		}
	};

	const handleClickUser = (user: IUser) => {
		router.push(`/social-media/chat/${user.id}/${user.name}`);
	};

	const handleDeleteConversation = async () => {
		if (!selectedConversationId) return;
		try {
			const msgsRef = collection(
				db,
				"conversations",
				selectedConversationId,
				"messages",
			);
			const msgsSnap = await getDocs(msgsRef);

			const unreadRef = collection(
				db,
				"conversations",
				selectedConversationId,
				"unread",
			);
			const unreadSnap = await getDocs(unreadRef);

			const batch = writeBatch(db);

			msgsSnap.forEach((msgDoc) => {
				batch.delete(msgDoc.ref);
			});

			unreadSnap.forEach((uDoc) => {
				batch.delete(uDoc.ref);
			});

			await batch.commit();
			await deleteDoc(doc(db, "conversations", selectedConversationId));

			setShowDeletePopup(false);
			setSelectedConversationId(null);
		} catch (error) {
			console.error("Error deleting conversation:", error);
		}
	};

	return (
		<div className="pb-28 bg-white md:bg-[#FAFBFC] min-h-screen">
			{/* ===== HEADER ===== */}
			<div className="fixed top-0 left-0 right-0 md:left-20 lg:left-64 z-[9999] bg-gradient-to-r from-[#004D40] to-[#00897B] shadow-sm transition-all">
				<div className="max-w-[480px] md:max-w-none xl:max-w-5xl mx-auto px-4 md:px-8 py-4 flex items-center">
					<button
						onClick={() => router.back()}
						className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
					>
						<ArrowLeftIcon className="size-5 text-white" />
					</button>
					<h1 className="text-white font-semibold ml-3 flex-grow text-lg">Pesan</h1>
				</div>
			</div>

			<div className="md:px-6 lg:px-8">
				{/* ===== SEARCH BAR ===== */}
				<div className="mt-[4.7rem] md:mt-[5rem] px-4 md:px-0 py-3">
					<div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-3 border border-slate-100 shadow-sm">
						<MagnifyingGlassIcon className="size-5 text-slate-400" />
						<input
							type="text"
							className="bg-transparent flex-1 border-0 focus:outline-none focus:ring-0 placeholder-slate-400 text-sm"
							placeholder="Cari pengguna..."
							value={search}
							onChange={handleSearchChange}
						/>
					</div>
				</div>

				{/* ===== CHAT LIST ===== */}
				<div className="px-4 md:px-0">
					{loading && (
						<div className="flex items-center justify-center py-16">
							<div className="flex flex-col items-center gap-3">
								<div className="w-8 h-8 border-2 border-[#009788] border-t-transparent rounded-full animate-spin" />
								<p className="text-sm text-slate-400">Memuat...</p>
							</div>
						</div>
					)}

					{users.length === 0 && !loading ? (
						<div className="flex flex-col items-center justify-center py-20">
							<div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
								<ChatBubbleLeftRightIcon className="size-8 text-slate-300" />
							</div>
							<p className="text-slate-400 text-sm">
								{search.trim() === ""
									? "Belum ada percakapan"
									: "Tidak ditemukan user yang cocok"}
							</p>
							{search.trim() === "" && (
								<p className="text-slate-300 text-xs mt-1">Mulai chat dengan mencari pengguna</p>
							)}
						</div>
					) : (
						<div className="md:bg-white md:rounded-2xl md:border md:border-slate-100 md:shadow-sm md:overflow-hidden">
							{users.map((u, idx) => {
								const conversation = conversations.find((c) =>
									c.participants.includes(u.id),
								);
								const conversationId = conversation?.id;
								const unreadCount =
									conversation?.unreadCount?.[String(currentUserId)] || 0;
								const lastMessage = conversation?.lastMessage || "";

								return (
									<div
										key={u.id}
										className={`py-4 px-4 md:px-6 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors group ${
											idx < users.length - 1 ? "border-b border-slate-100" : ""
										}`}
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
											<div className="relative flex-shrink-0">
												<img
													src={
														!u.avatar || u.avatar === "users/default.png"
															? "/img/profileplacholder.png"
															: `${process.env.NEXT_PUBLIC_STORAGE_URL || ""}/${u.avatar}`
													}
													alt="avatar"
													className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100"
												/>
												{/* Online indicator placeholder */}
												<div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white" />
											</div>
											<div className="flex-1 min-w-0">
												<p className="font-semibold text-slate-800 text-sm truncate">
													{u.name || "Tidak ada Nama"}
												</p>
												<p className="text-slate-400 text-xs truncate mt-0.5">
													{lastMessage || "Mulai percakapan"}
												</p>
											</div>
										</div>

										<div className="flex flex-col items-end gap-1.5 flex-shrink-0 ml-3">
											<span className="text-[11px] text-slate-300 whitespace-nowrap">
												{(conversation as any)?.updatedAt
													? new Date((conversation as any).updatedAt).toLocaleTimeString("id-ID", {
														hour: "2-digit",
														minute: "2-digit",
													})
													: ""}
											</span>
											{unreadCount > 0 && (
												<span className="bg-[#009788] text-white text-[10px] font-bold min-w-[20px] h-5 rounded-full flex items-center justify-center px-1.5 leading-none">
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
			</div>

			{/* ===== DELETE POPUP ===== */}
			{showDeletePopup && (
				<div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 px-4">
					<div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full">
						<div className="flex items-center gap-3 mb-4">
							<div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
								<TrashIcon className="size-5 text-red-500" />
							</div>
							<div>
								<h3 className="text-slate-800 font-semibold">Hapus Percakapan</h3>
								<p className="text-xs text-slate-400 mt-0.5">Tindakan ini tidak bisa dibatalkan</p>
							</div>
						</div>
						<p className="text-slate-600 text-sm mb-6">
							Yakin ingin menghapus percakapan ini? Semua pesan akan dihapus secara permanen.
						</p>
						<div className="flex justify-end gap-3">
							<button
								className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-medium transition-colors"
								onClick={() => {
									setShowDeletePopup(false);
									setSelectedConversationId(null);
								}}>
								Batal
							</button>
							<button
								className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors"
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
