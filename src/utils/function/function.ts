import { IMAGE_URL, Status } from "@/constant/constant";

export const getImage = (url: string): string => {
	return `${IMAGE_URL}/${url}`;
};

export const getUserStatus = (user: any) => {
	return user.user_activated_at === null
		? Status.INACTIVE
		: !isAllProfileCompleted(user)
		? Status.PENDING
		: user.expired_at !== null && new Date() > new Date(user.expired_at)
		? Status.EXPIRED
		: Status.ACTIVE;
};

export const isInformationProfileCompleted = (user: any) => {
	const keys = [
		"nip",
		"nik",
		"contact",
		"school_place",
		"educational_level_id",
		"unit_kerja",
		"gender",
		"birthdate",
		"headmaster_name",
		"headmaster_nip",
		"school_status",
	];
	return keys.every((val) => user.profile[val] != null);
};

export const isLocationProfileCompleted = (user: any) => {
	const keys = ["city_id", "province_id", "district_id"];
	return keys.every((val) => user.profile[val] != null);
};

export function getYoutubeId(url: string) {
  try {
    const regExp =
      /(?:youtube\.com\/.*v=|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}


export const isPnsStatusCompleted = (user: any) => {
	const keys = [
		"is_pns",
		"is_certification",
		"is_non_pns_inpassing",
		"employment_status",
		"pendidikan",
		"jurusan",
		"kampus",
		"pemasukan",
		"pengeluaran",
		"kepemilikan_rumah",
	];

	return !!user.pns_status && keys.every((val) => user.pns_status[val] != null);
};

export const isAllProfileCompleted = (user: any) =>
	isInformationProfileCompleted(user) &&
	isLocationProfileCompleted(user) &&
	isPnsStatusCompleted(user);

export function cekDanUbahType(type: any) {
	switch (type) {
		case "Buku":
			return "Materi Ajar";
		case "Bahan Ajar":
			return "Bahan Tayang";
		case "Materi ajar & RPP":
			return "Modul Ajar/RPP";
		default:
			return type; // Tidak diubah jika tidak cocok
	}
}

export function makeConversationId(
	a: number | string,
	b: number | string,
): string {
	return Number(a) < Number(b) ? `${a}_${b}` : `${b}_${a}`;
}
