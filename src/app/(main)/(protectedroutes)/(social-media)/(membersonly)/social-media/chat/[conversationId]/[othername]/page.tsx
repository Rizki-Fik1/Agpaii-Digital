"use client";

import React, {
	useEffect,
	useState,
	useCallback,
	FormEvent,
	useRef,
} from "react";
import { useParams } from "next/navigation";
import {
	collection,
	doc,
	query,
	orderBy,
	onSnapshot,
	addDoc,
	setDoc,
	updateDoc,
	serverTimestamp,
	increment,
} from "firebase/firestore";
import { useAuth } from "@/utils/context/auth_context";
import { db } from "../../../../../../../../../../firebase";
import { makeConversationId } from "@/utils/function/function";
import TopBar from "@/components/nav/topbar";
import { sendPushNotifToUser } from "@/utils/sendPushNotif";

const ChatScreen: React.FC = () => {
	const { auth: profile } = useAuth();
	const params = useParams();

	// Route param: /social-media/chat/[conversationId]/[othername]
	const otherUserId = params.conversationId as string;
	const othername = decodeURIComponent(params.othername as string);

	const currentUserId = profile?.id;

	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Suara notifikasi
	const sentSound = useRef<HTMLAudioElement | null>(null);
	const receivedSound = useRef<HTMLAudioElement | null>(null);

	// State
	const [messages, setMessages] = useState<any[]>([]);
	const [text, setText] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(true);

	// Load file audio
	useEffect(() => {
		sentSound.current = new Audio(window.location.origin + "/sounds/sent.mp3");
		receivedSound.current = new Audio(
			window.location.origin + "/sounds/received.mp3",
		);
	}, []);

	// 1. Berlangganan ke sub-collection "messages" untuk real-time chat
	useEffect(() => {
		if (!currentUserId || !otherUserId) return;
		const convoId = makeConversationId(currentUserId, otherUserId);

		const messagesRef = collection(db, "conversations", convoId, "messages");
		const q = query(messagesRef, orderBy("createdAt", "asc"));

		const unsubscribe = onSnapshot(
			q,
			(snapshot) => {
				const msgs: any[] = [];
				snapshot.forEach((docSnap) => {
					const data = docSnap.data();
					msgs.push({
						id: docSnap.id,
						text: data.text,
						createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
						senderId: data.senderId,
					});
				});
				// Mainkan suara jika pesan baru dari lawan
				if (
					msgs.length > messages.length &&
					msgs[msgs.length - 1].senderId !== currentUserId
				) {
					receivedSound.current?.play();
				}
				setMessages(msgs);
				setLoading(false);
			},
			(err) => {
				console.error("Error fetching messages:", err);
				setLoading(false);
			},
		);

		return () => unsubscribe();
	}, [currentUserId, otherUserId, messages]);

	// 2. Pada saat user membuka chat, set unreadCount miliknya = 0
	useEffect(() => {
		if (!currentUserId || !otherUserId) return;
		const convoId = makeConversationId(currentUserId, otherUserId);

		// Dapatkan doc conversation, set unreadCount.[currentUserId] = 0
		const conversationRef = doc(db, "conversations", convoId);
		updateDoc(conversationRef, {
			[`unreadCount.${currentUserId}`]: 0,
		}).catch((err) => {
			console.error("Error resetting unreadCount:", err);
		});
	}, [currentUserId, otherUserId]);

	// Scroll ke bawah otomatis jika ada pesan baru
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	// Fungsi kirim pesan
	const onSend = useCallback(async () => {
		if (!text.trim() || !currentUserId || !otherUserId) return;
		const convoId = makeConversationId(currentUserId, otherUserId);
		const conversationDocRef = doc(db, "conversations", convoId);

		try {
			// Pastikan doc conversation ada
			await setDoc(
				conversationDocRef,
				{
					participants: [Number(currentUserId), Number(otherUserId)],
				},
				{ merge: true },
			);

			// Tambahkan pesan ke sub-collection "messages"
			const msgColRef = collection(db, "conversations", convoId, "messages");
			await addDoc(msgColRef, {
				text: text.trim(),
				senderId: currentUserId,
				createdAt: serverTimestamp(),
			});

			// Update lastMessage & updatedAt
			await setDoc(
				conversationDocRef,
				{
					lastMessage: text.trim(),
					updatedAt: serverTimestamp(),
				},
				{ merge: true },
			);

			// 🔊 Suara “sent”
			sentSound.current?.play();

			// Kosongkan input
			const tempMsg = text.trim(); // simpan sebelum reset
			setText("");

			// Tambahkan unreadCount untuk lawan user
			await updateDoc(conversationDocRef, {
				[`unreadCount.${otherUserId}`]: increment(1),
			});

			// Kirim notifikasi (jika lawan tidak di room)
			sendPushNotifToUser(otherUserId, tempMsg, othername);
		} catch (error) {
			console.error("Error sending message:", error);
		}
	}, [text, currentUserId, otherUserId]);

	// Handler form submit
	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		onSend();
	};

	if (loading) return <p>Loading chat...</p>;

	return (
		<div className="pt-[3.9rem] bg-slate-100 min-h-screen">
			<TopBar withBackButton>{othername}</TopBar>

			<div className="min-h-[calc(100vh-13rem)] overflow-y-auto p-4 space-y-4">
				{messages.length === 0 ? (
					<p className="text-center text-gray-500">Belum ada pesan.</p>
				) : (
					messages.map((m) => (
						<div
							key={m.id}
							className={`flex ${
								m.senderId === currentUserId ? "justify-end" : "justify-start"
							}`}>
							<div
								className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
									m.senderId === currentUserId
										? "bg-blue-500 text-white"
										: "bg-white border border-gray-200"
								}`}>
								<p className="text-sm">{m.text}</p>
								<p className="text-xs mt-1 opacity-70">
									{new Date(m.createdAt).toLocaleTimeString([], {
										hour: "2-digit",
										minute: "2-digit",
									})}
								</p>
							</div>
						</div>
					))
				)}
				<div ref={messagesEndRef} />
			</div>

			<form
				onSubmit={handleSubmit}
				className="fixed bottom-16 left-0 right-0 z-50 p-4 bg-white border-t max-w-[480px] mx-auto">
				<div className="flex items-center space-x-2">
					<input
						type="text"
						value={text}
						onChange={(e) => setText(e.target.value)}
						placeholder="Tulis pesan..."
						className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
					/>
					<button
						type="submit"
						className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
						Kirim
					</button>
				</div>
			</form>
		</div>
	);
};

export default ChatScreen;
