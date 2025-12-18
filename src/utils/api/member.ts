import API from "./config";

export async function provinceExpiredMemberAPI(page = 1): Promise<any> {
	return API.get(`/province-expired-member?page=${page}`);
}

export const SearchProvinceExpiredMemberAPI = async ({
	keyword,
}: any): Promise<any> => {
	return API.get(`/province-expired-member/search/${keyword}`);
};

export const provinceExtendMemberAPI = async (): Promise<any> => {
	return API.get(`/province-extend-member`);
};

export const SearchProvinceExtendMemberAPI = async ({
	keyword,
}: any): Promise<any> => {
	return API.get(`/province-extend-member/search/${keyword}`);
};

export const provincePensionMemberAPI = async (page = 1): Promise<any> => {
	return API.get(`/province-pension-member?page=${page}`);
};

export const SearchProvincePensionMemberAPI = async ({
	keyword,
}: any): Promise<any> => {
	return API.get(`/province-pension-member/search/${keyword}`);
};

export const provincePNSMemberAPI = async (page = 1): Promise<any> => {
	return API.get(`/province-pns-member?page=${page}`);
};

export const SearchProvincePNSMemberAPI = async ({
	keyword,
}: any): Promise<any> => {
	return API.get(`/province-pns-member/search/${keyword}`);
};

export const provinceCertificateMemberAPI = async (page = 1): Promise<any> => {
	return API.get(`/province-certificate-member?page=${page}`);
};

export const provinceCityCertificateMemberAPI = async ({
	provinceId,
}: any): Promise<any> => {
	return API.get(`/province/${provinceId}/city-certificate-member`);
};

export const cityDistrictCertificateMemberAPI = async ({
	cityId,
}: any): Promise<any> => {
	return API.get(`/city/${cityId}/district-certificate-member`);
};

export const cityDistrictInpassingMemberAPI = async ({
	cityId,
}: any): Promise<any> => {
	return API.get(`/city/${cityId}/district-inpassing-member`);
};

export const cityDistrictBSIMemberAPI = async ({
	cityId,
}: any): Promise<any> => {
	return API.get(`/city/${cityId}/district-bsi-member`);
};

export const provinceInpassingMemberAPI = async (page = 1): Promise<any> => {
	return API.get(`/province-inpassing-member?page=${page}`);
};

export const provinceCityInpassingMemberAPI = async ({
	provinceId,
}: any): Promise<any> => {
	return API.get(`/province/${provinceId}/city-inpassing-member`);
};

export const provinceBSIMemberAPI = async (page = 1): Promise<any> => {
	return API.get(`/province-bsi-member?page=${page}`);
};

export const provinceCityBSIMemberAPI = async ({
	provinceId,
}: any): Promise<any> => {
	return API.get(`/province/${provinceId}/city-inpassing-member`);
};

export const provinceNonPNSMemberAPI = async (page = 1): Promise<any> => {
	return API.get(`/province-non-pns-member?page=${page}`);
};

export const SearchProvinceNonPNSMemberAPI = async ({
	keyword,
}: any): Promise<any> => {
	return API.get(`/province-non-pns-member/search/${keyword}`);
};

export async function provinceMemberAPI(page = 1): Promise<any> {
	return API.get(`/province-member?page=${page}`);
}

export const nextMemberAPI = async ({ url }: any): Promise<any> => {
	return API.get(url);
};

export const searchProvinceMemberAPI = async ({
	keyword,
}: any): Promise<any> => {
	return API.get(`/province-member/search/${keyword}`);
};

export const cityMemberAPI = async ({
	provinceId,
	filter,
}: any): Promise<any> => {
	return API.get(`/province/${provinceId}/city-member?filter=${filter}`);
};

export const searchCityMemberAPI = async ({
	provinceId,
	keyword,
}: any): Promise<any> => {
	return API.get(`/province/${provinceId}/city-member/search/${keyword}`);
};

export const districtMemberAPI = async ({ cityId }: any): Promise<any> => {
	return API.get(`/city/${cityId}/district-member`);
};

export const searchDistrictMemberAPI = async ({
	districtId,
	keyword,
	filter,
}: any): Promise<any> => {
	return API.get(`/district/${districtId}/search/${keyword}?filter=${filter}`);
};

export const provinceCityMemberAPI = async ({
	provinceId,
}: any): Promise<any> => {
	return API.get(`/province/${provinceId}/city-member`);
};

export const provinceCityExpiredMemberAPI = async ({
	provinceId,
}: any): Promise<any> => {
	return API.get(`/province/${provinceId}/city-expired-member`);
};

export const SearchProvinceCityExpiredMemberAPI = async ({
	provinceId,
	keyword,
}: any): Promise<any> => {
	return API.get(
		`/province/${provinceId}/city-expired-member/search/${keyword}`,
	);
};

export const provinceCityExtendMemberAPI = async ({
	provinceId,
}: any): Promise<any> => {
	return API.get(`/province/${provinceId}/city-extend-member`);
};

export const SearchProvinceCityExtendMemberAPI = async ({
	provinceId,
	keyword,
}: any): Promise<any> => {
	return API.get(
		`/province/${provinceId}/city-extend-member/search/${keyword}`,
	);
};

export const provinceCityPensionMemberAPI = async ({
	provinceId,
}: any): Promise<any> => {
	return API.get(`/province/${provinceId}/city-pension-member`);
};

export const SearchProvinceCityPensionMemberAPI = async ({
	provinceId,
	keyword,
}: any): Promise<any> => {
	return API.get(
		`/province/${provinceId}/city-pension-member/search/${keyword}`,
	);
};

export const provinceCityPNSMemberAPI = async ({
	provinceId,
}: any): Promise<any> => {
	return API.get(`/province/${provinceId}/city-pns-member`);
};

export const cityDistrictPNSMemberAPI = async ({
	cityId,
}: any): Promise<any> => {
	return API.get(`/city/${cityId}/district-pns-member`);
};

export const cityDistrictExpiredMemberAPI = async ({
	cityId,
}: any): Promise<any> => {
	return API.get(`/city/${cityId}/district-expired-member`);
};

export const cityDistrictExtendMemberAPI = async ({
	cityId,
}: any): Promise<any> => {
	return API.get(`/city/${cityId}/district-extend-member`);
};

export const cityDistrictPensionMemberAPI = async ({
	cityId,
}: any): Promise<any> => {
	return API.get(`/city/${cityId}/district-pension-member`);
};

export const cityDistrictNonPNSMemberAPI = async ({
	cityId,
}: any): Promise<any> => {
	return API.get(`/city/${cityId}/district-non-pns-member`);
};

export const SearchProvinceCityPNSMemberAPI = async ({
	provinceId,
	keyword,
}: any): Promise<any> => {
	return API.get(`/province/${provinceId}/city-pns-member/search/${keyword}`);
};

export const provinceCityNonPNSMemberAPI = async ({
	provinceId,
}: any): Promise<any> => {
	return API.get(`/province/${provinceId}/city-non-pns-member`);
};

export const SearchProvinceCityNonPNSMemberAPI = async ({
	provinceId,
	keyword,
}: any): Promise<any> => {
	return API.get(
		`/province/${provinceId}/city-non-pns-member/search/${keyword}`,
	);
};

export const cityDistrictMemberAPI = async ({
	cityId,
	filter,
}: any): Promise<any> => {
	return API.get(`/city/${cityId}/district-member?filter=${filter}`);
};

export const searchCityDistrictMemberAPI = async ({
	cityId,
	keyword,
}: any): Promise<any> => {
	return API.get(`/${cityId}/district-member/search/${keyword}`);
};

export const districtMemberDetailAPI = async ({
	districtId,
	filter,
}: any): Promise<any> => {
	return API.get(
		`/district/${districtId}/district-member-info?filter=${filter}`,
	);
};

export const searchAllMemberAPI = async ({ keyword }: any): Promise<any> => {
	return API.get(`/province/search/${keyword}`);
};
