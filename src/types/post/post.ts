export interface Post {
	body: string;
	slug: string;
	author_id: number;
	updated_at: string;
	created_at: string;
	id: number;
	comments_count: number;
	likes_count: number;
	is_liked: boolean;
	is_bookmarked: boolean;
	read_count: number;
	thumbnail: null | any;
	images: Image[];
	videos: string[];
	media: string[];
	author: Author;
	last_like: null | string;
	last_comment: null | string;
	is_pinned: boolean | number;
}

type Image = {
	id: number;
	name: null | string;
	description: null | string;
	src: string;
	type: string;
	value: null;
	file_type: string;
	file_id: number;
	created_at: string;
	updated_at: string;
	key: any | null;
	size: string;
};

type Author = {
	id: number;
	kta_id: number;
	role_id: number;
	name: string;
	email: string;
	avatar: string;
	email_verified_at: string;
	user_activated_at: string;
	point: number;
	settings: any[];
	created_at: string;
	updated_at: string;
	expired_at: string;
	deleted_at: null;
	age: number;
	profile: {
		id: number;
		user_id: number;
		nip: string;
		nik: string;
		contact: string;
		school_place: string;
		home_address: string;
		educational_level_id: number;
		unit_kerja: string;
		nama_kepala_satuan_pendidikan: string;
		nip_kepala_satuan_pendidikan: string;
		gender: string;
		birthdate: string;
		created_at: string;
		updated_at: string;
		province_id: number;
		city_id: number;
		district_id: number;
		short_bio: null | string;
		long_bio: string;
		headmaster_name: string;
		headmaster_nip: string;
		grade_id: number;
		school_status: string;
	};
	role: {
		id: number;
		name: string;
		display_name: string;
		created_at: string;
		updated_at: string;
	};
};
