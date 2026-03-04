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
import { PaperAirplaneIcon, ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/solid";

const ChatScreen: React.FC = () => {
	const { auth: profile } = useAuth();
	const params = useParams();

	const otherUserId = params.conversationId as string;
	const othername = decodeURIComponent(params.othername as string);

	const currentUserId = profile?.id;

	const messagesEndRef = useRef<HTMLDivElement>(null);

	const sentSound = useRef<HTMLAudioElement | null>(null);
	const receivedSound = useRef<HTMLAudioElement | null>(null);

	const [messages, setMessages] = useState<any[]>([]);
	const [text, setText] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		sentSound.current = new Audio(window.location.origin + "/sounds/sent.mp3");
		receivedSound.current = new Audio(
			window.location.origin + "/sounds/received.mp3",
		);
	}, []);

	// Subscribe messages
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

	// Reset unread
	useEffect(() => {
		if (!currentUserId || !otherUserId) return;
		const convoId = makeConversationId(currentUserId, otherUserId);

		const conversationRef = doc(db, "conversations", convoId);
		updateDoc(conversationRef, {
			[`unreadCount.${currentUserId}`]: 0,
		}).catch((err) => {
			console.error("Error resetting unreadCount:", err);
		});
	}, [currentUserId, otherUserId]);

	// Auto scroll
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	// Send message
	const onSend = useCallback(async () => {
		if (!text.trim() || !currentUserId || !otherUserId) return;
		const convoId = makeConversationId(currentUserId, otherUserId);
		const conversationDocRef = doc(db, "conversations", convoId);

		try {
			await setDoc(
				conversationDocRef,
				{
					participants: [Number(currentUserId), Number(otherUserId)],
				},
				{ merge: true },
			);

			const msgColRef = collection(db, "conversations", convoId, "messages");
			await addDoc(msgColRef, {
				text: text.trim(),
				senderId: currentUserId,
				createdAt: serverTimestamp(),
			});

			await setDoc(
				conversationDocRef,
				{
					lastMessage: text.trim(),
					updatedAt: serverTimestamp(),
				},
				{ merge: true },
			);

			sentSound.current?.play();

			const tempMsg = text.trim();
			setText("");

			await updateDoc(conversationDocRef, {
				[`unreadCount.${otherUserId}`]: increment(1),
			});

			sendPushNotifToUser(otherUserId, tempMsg, othername);
		} catch (error) {
			console.error("Error sending message:", error);
		}
	}, [text, currentUserId, otherUserId]);

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		onSend();
	};

	// Helper: group messages by date
	const getDateLabel = (date: Date) => {
		const today = new Date();
		const msgDate = new Date(date);
		if (msgDate.toDateString() === today.toDateString()) return "Hari Ini";
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);
		if (msgDate.toDateString() === yesterday.toDateString()) return "Kemarin";
		return msgDate.toLocaleDateString("id-ID", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
	};

	if (loading) {
		return (
			<div className="pt-[4.21rem] bg-[#FAFBFC] min-h-screen">
				<TopBar withBackButton>{othername}</TopBar>
				<div className="flex items-center justify-center h-[80vh]">
					<div className="flex flex-col items-center gap-3">
						<div className="w-8 h-8 border-2 border-[#009788] border-t-transparent rounded-full animate-spin" />
						<p className="text-slate-400 text-sm">Memuat percakapan...</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="pt-[4.21rem] min-h-screen flex flex-col"
			style={{ background: "linear-gradient(180deg, #F0F4F3 0%, #FAFBFC 100%)" }}
		>
			<TopBar withBackButton>{othername}</TopBar>

			{/* Messages Area */}
			<div className="flex-1 overflow-y-auto p-4 md:px-8 lg:px-12 space-y-3 pb-24">
				{messages.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-[60vh]">
						<div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4">
							<ChatBubbleBottomCenterTextIcon className="size-8 text-slate-300" />
						</div>
						<p className="text-slate-400 text-sm">Belum ada pesan</p>
						<p className="text-slate-300 text-xs mt-1">Kirim pesan untuk memulai percakapan</p>
					</div>
				) : (
					<>
						{messages.map((m, idx) => {
							const isSender = m.senderId === currentUserId;
							// Show date separator
							const showDate =
								idx === 0 ||
								getDateLabel(messages[idx - 1].createdAt) !== getDateLabel(m.createdAt);

							return (
								<React.Fragment key={m.id}>
									{showDate && (
										<div className="flex justify-center my-4">
											<span className="bg-white/80 backdrop-blur-sm text-slate-400 text-[11px] font-medium px-3 py-1 rounded-full shadow-sm border border-slate-100">
												{getDateLabel(m.createdAt)}
											</span>
										</div>
									)}
									<div className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
										<div
											className={`max-w-[75%] lg:max-w-md px-4 py-2.5 shadow-sm ${
												isSender
													? "bg-[#009788] text-white rounded-2xl rounded-br-md"
													: "bg-white text-slate-700 rounded-2xl rounded-bl-md border border-slate-100"
											}`}
										>
											<p className="text-sm leading-relaxed">{m.text}</p>
											<p
												className={`text-[10px] mt-1 text-right ${
													isSender ? "text-white/60" : "text-slate-300"
												}`}
											>
												{new Date(m.createdAt).toLocaleTimeString([], {
													hour: "2-digit",
													minute: "2-digit",
												})}
											</p>
										</div>
									</div>
								</React.Fragment>
							);
						})}
					</>
				)}
				<div ref={messagesEndRef} />
			</div>

			{/* Input Bar */}
			<form
				onSubmit={handleSubmit}
				className="fixed bottom-0 md:bottom-0 left-0 right-0 md:left-20 lg:left-64 z-50 bg-white/80 backdrop-blur-xl border-t border-slate-100 transition-all"
			>
				<div className="max-w-[480px] md:max-w-none mx-auto px-4 md:px-8 lg:px-12 py-3">
					<div className="flex items-center gap-3">
						<input
							type="text"
							value={text}
							onChange={(e) => setText(e.target.value)}
							placeholder="Tulis pesan..."
							className="flex-1 px-5 py-3 bg-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#009788]/30 focus:bg-white border border-transparent focus:border-[#009788]/20 placeholder-slate-400 text-sm transition-all"
						/>
						<button
							type="submit"
							disabled={!text.trim()}
							className="w-11 h-11 bg-[#009788] hover:bg-[#00867a] disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl flex items-center justify-center transition-all shadow-sm hover:shadow-md disabled:shadow-none"
						>
							<PaperAirplaneIcon className="size-5" />
						</button>
					</div>
				</div>
			</form>
		</div>
	);
};

export default ChatScreen;
