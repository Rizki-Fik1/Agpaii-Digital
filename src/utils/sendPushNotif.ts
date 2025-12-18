// utils/sendPushNotif.js
export async function sendPushNotifToUser(
	targetUserId: number | string,
	messageText: string,
	targetUserName: string,
) {
	// Perhatian: Jangan taruh REST API Key ini di client untuk aplikasi produksi!
	const ONE_SIGNAL_REST_API_KEY =
		"os_v2_app_cq3l64gpjnev5bjiwh6mldpxtxfw3olkztvuumnoncvy64aal6zfelasdx3vnn3jo5zfeyrunoq5vm3guvtbjxnlr6ucg6hfwtiekzq";
	const ONE_SIGNAL_APP_ID = "1436bf70-cf4b-495e-8528-b1fcc58df79d";

	try {
		const response = await fetch("https://onesignal.com/api/v1/notifications", {
			method: "POST",
			headers: {
				"Content-Type": "application/json; charset=utf-8",
				"Authorization": `Basic ${ONE_SIGNAL_REST_API_KEY}`,
			},
			body: JSON.stringify({
				app_id: ONE_SIGNAL_APP_ID,
				target_channel: "push",
				// Menggunakan include_aliases dengan alias external_id
				include_aliases: {
					external_id: [String(targetUserId)],
				},
				headings: { en: `Pesan Baru dari ${targetUserName}!` },
				contents: { en: messageText },
			}),
		});
		const result = await response.json();
	} catch (err) {
		console.error("sendPushNotifToUser error:", err);
	}
}
