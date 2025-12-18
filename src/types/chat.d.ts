// Contoh definisi interface di file yang sama:

export interface IUser {
	id: number | string;
	name?: string;
	avatar?: string;
	// Tambahkan field lain sesuai API
}

export interface IConversation {
	id: string;
	participants: (number | string)[];
	lastMessage?: string;
	updatedAt?: {
		seconds: number;
		nanoseconds: number;
	};
	unreadCount: any;
	// Tambahkan field lain jika ada
}
