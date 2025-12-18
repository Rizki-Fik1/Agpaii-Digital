"use client";

import TopBar from "@/components/nav/topbar";
import API from "@/utils/api/config";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Post as PostType } from "@/types/post/post";
import { useInView } from "react-intersection-observer";
import { useParams } from "next/navigation";
import { useAuth } from "@/utils/context/auth_context";
import Loader from "@/components/loader/loader";
import { getImage } from "@/utils/function/function";

function trimText(text: string, length: number) {
	return text.length > length ? text.slice(0, length) + "..." : text;
}

export default function Profile() {
	const { auth: auth } = useAuth();
	const { id } = useParams();
	const [postCount, setPostCount] = useState(0);
	const { ref, inView } = useInView();

	/* ---------------- FETCH PROFILE ---------------- */
	const { data: profile, isLoading: profileLoading } = useQuery({
		queryKey: ["profile", id],
		queryFn: async () => {
			const res = await API.get(`user/${id}`);
			if (res.status === 200) return res.data;
		},
	});

	/* ---------------- FETCH POSTS ---------------- */
	const fetchPosts = async ({ pageParam }: { pageParam: number }) => {
		const res = await API.get(`/user/${profile?.id}/post?page=${pageParam}`);
		if (res.status === 200) {
			setPostCount(res.data.total);

			return {
				currentPage: pageParam,
				data: res.data.data as PostType[],
				nextPage:
					res.data.next_page_url !== null
						? parseInt(res.data.next_page_url.split("=")[1])
						: undefined,
			};
		}
	};

	const {
		data: posts,
		isLoading,
		isPending,
		fetchNextPage,
		isFetchingNextPage,
	} = useInfiniteQuery({
		enabled: !!profile,
		queryKey: ["posts", id?.toString()],
		queryFn: fetchPosts,
		initialPageParam: 1,
		getNextPageParam: (lastPage) => lastPage?.nextPage,
	});

	useEffect(() => {
		if (inView && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [inView]);

	if (profileLoading) return null;

	/* ---------------- EXTRACT YOUTUBE ID ---------------- */
	function extractYoutubeId(url: string) {
		if (!url) return null;
		const patterns = [
			/youtu\.be\/([^?&]+)/,
			/youtube\.com\/watch\?v=([^?&]+)/,
			/youtube\.com\/embed\/([^?&]+)/,
		];
		for (const p of patterns) {
			const match = url.match(p);
			if (match) return match[1];
		}
		return null;
	}

	return (
		<div className="flex flex-col py-20">
			<TopBar withBackButton>
				<div className="flex items-center gap-3">
					<h1>Profile</h1>
				</div>
			</TopBar>

			<div className="pt-4 relative">
				{auth.id === profile?.id && (
					<Link
						className="absolute right-10 top-8 text-sm bg-[#009788] px-4 py-1.5 rounded-xl text-white"
						href={"/profile/edit/social-media"}>
						Edit Profile
					</Link>
				)}

				<div className="px-4 sm:px-5">
					<img
						src={
							(profile?.banner !== null && getImage(profile.banner.src)) ||
							"/img/post.png"
						}
						alt=""
						className="rounded-2xl w-full h-[13rem] object-cover"
					/>

					<div className="flex items-center mx-auto -mt-12 justify-center px-3 sm:px-5">
						<img
							src={
								(profile?.avatar !== null && getImage(profile.avatar)) ||
								"https://avatar.iran.liara.run/public"
							}
							alt=""
							className=" size-[5.5rem] rounded-full border-[6px] border-white"
						/>

						<div className="flex ml-4 gap-2 ms-auto">
							<div className="flex flex-col items-center border bg-white border-slate-200 p-1.5  rounded-lg shadow-md">
								<span className="font-semibold text-sm">{postCount}</span>
								<h1 className="text-xs text-slate-600">Postingan</h1>
							</div>
							<div className="flex flex-col items-center border bg-white border-slate-200 p-1.5  rounded-lg shadow-md">
								<span className="font-semibold text-sm ">
									{profile?.created_at.split("-")[0]}
								</span>
								<h1 className="text-xs text-slate-600">Bergabung</h1>
							</div>
							<div className="flex flex-col items-center border bg-white border-slate-200 p-1.5 rounded-lg shadow-md px-3">
								<span className="font-semibold text-sm ">0</span>
								<h1 className="text-xs text-slate-600">Modul</h1>
							</div>
						</div>
					</div>

					<div className="pt-4 pb-8 sm:pl-1">
						<h1 className="font-medium">{profile.name}</h1>
						<div className="text-slate-500">
							<h3 className="text-sm flex gap-2">
								{profile?.kta_id !== null && (
									<>
										<p>NO KTA</p>
										<span className="text-[#009788]">{profile?.kta_id}</span>
									</>
								)}
							</h3>
							
                            {/* Sekolah */}
                            {profile?.profile.school_place && (
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 text-gray-400">🏫</span>
                                <span>{profile.profile.school_place}</span>
                              </div>
                            )}

                            {/* Alamat */}
                            {profile?.profile.home_address && (
                              <div className="flex items-center mb-2 gap-2">
                                <span className="w-5 h-5 text-gray-400">📍</span>
                                <span>{profile.profile.home_address}</span>
                              </div>
                            )}

                          <h3 className="font-medium text-sm text-gray-700 mb-2">Bio</h3>
							{profile?.profile.long_bio ? (
								<h4 className="text-sm mt-2">
									{profile?.profile.long_bio}
								</h4>
							) : (
								"No bio yet."
							)}
						</div>
					</div>
				</div>

				{/* ---------------- POSTS GRID ---------------- */}
				<div className="border-t border-t-slate-300 flex flex-wrap">
					{isPending || isLoading ? (
						<div className="flex mt-16 justify-center w-full">
							<Loader className="size-8" />
						</div>
					) : (
						posts?.pages.map((page: any, index) => (
							<div className="flex flex-wrap flex-grow" key={index}>
								{page?.data.length > 0 ? (
									page?.data.map((post: any, i: number) => {
										const youtubeId = extractYoutubeId(post.youtube_url);
										const hasImage = post.images && post.images.length > 0;
										const hasYoutube = !hasImage && youtubeId;
										const hasDocument =
											!hasImage && !hasYoutube && post.document;

										return (
											<Link
												key={i}
												href={"/social-media/post/" + post.id}
												className="aspect-square w-1/3 border-[0.1px] border-neutral-300 relative bg-black"
											>
												{/* IMAGE */}
												{hasImage && (
													<img
														className="size-full object-cover"
														src={getImage(post.images[0].src)}
													/>
												)}

												{/* YOUTUBE */}
												{hasYoutube && (
													<div className="w-full h-full relative">
														<img
															src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
															className="size-full object-cover opacity-80"
														/>

														{/* PLAY ICON */}
														<div className="absolute inset-0 flex items-center justify-center">
															<div className="bg-white/80 rounded-full p-2">
																<svg
																	xmlns="http://www.w3.org/2000/svg"
																	fill="black"
																	viewBox="0 0 24 24"
																	className="w-6 h-6"
																>
																	<path d="M8 5v14l11-7z" />
																</svg>
															</div>
														</div>

														{/* BADGE */}
														<div className="absolute bottom-1 left-1 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-sm">
															YouTube
														</div>
													</div>
												)}

												{/* DOCUMENT BADGE */}
												{hasDocument && (
													<div className="w-full h-full flex items-center justify-center bg-slate-800 text-white text-xs p-2 text-center">
														<div className="flex flex-col items-center gap-2">
															<span className="text-2xl">📄</span>
															<span className="text-[10px] truncate px-2">
																{post.document.split("/").pop()}
															</span>
															<div className="bg-white/20 px-2 py-0.5 rounded-full text-[9px]">
																Dokumen
															</div>
														</div>
													</div>
												)}

												{/* TEXT ONLY */}
												{!hasImage && !hasYoutube && !hasDocument && (
													<div
														style={{ backgroundImage: "url(/img/post.png)" }}
														className="bg-cover bg-center size-full flex px-6 py-6 text-center"
													>
														<p className="text-xs text-white m-auto break-all">
															{trimText(post.body, 50)}...
														</p>
													</div>
												)}
											</Link>
										);
									})
								) : (
									<div className="p-4 w-full text-center pt-8 text-slate-600">
										Tidak Ada Postingan
									</div>
								)}
							</div>
						))
					)}
					<div ref={ref}></div>
				</div>
			</div>
		</div>
	);
}
