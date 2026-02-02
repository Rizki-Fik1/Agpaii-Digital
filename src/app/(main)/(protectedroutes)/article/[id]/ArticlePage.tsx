"use client";

import React, { useMemo } from "react";
import TopBar from "@/components/nav/topbar";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import "moment/locale/id";
import parseHtml, { domToReact } from "html-react-parser";
import RecommendedArticles from "@/components/article/recommended-articles";

const ArticlePage = ({ id }: { id: string }) => {
	const fetchArticle = async () => {
		const res = await axios.get(
			`https://agpaii.or.id/wp-json/wp/v2/posts/${id}`
		);
		return res.status === 200 ? res.data : null;
	};

	const {
		data: article,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["article", id],
		queryFn: fetchArticle,
		enabled: !!id,
		staleTime: 1000 * 60 * 10,
	});

	// Define variables with defaults to maintain hook order
	const imageUrl =
		article?.yoast_head_json?.og_image?.[0]?.url || "/img/agpaii_splash.svg";
	const title = article?.title?.rendered || "";
	const modifiedDate = article ? moment(article?.modified).locale("id").format("LL") : "";
	const content = article?.content?.rendered || "";


	// Share handlers
	const handleShare = (platform: string) => {
		const encodedTitle = encodeURIComponent(title);
		const encodedUrl = encodeURIComponent(typeof window !== "undefined" ? window.location.href : "");
		let url = "";

		switch (platform) {
			case "whatsapp":
				url = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
				break;
			case "facebook":
				url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
				break;
			case "twitter":
				url = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
				break;
			case "copy":
				navigator.clipboard.writeText(typeof window !== "undefined" ? window.location.href : "");
				alert("Link berhasil disalin!");
				return;
		}

		if (url) window.open(url, "_blank");
	};

	// Now return based on states
	if (isLoading) {
		return (
			<div className="pt-[4.2rem] pb-20">
				<TopBar withBackButton>Detail Artikel</TopBar>
				<div className="px-4 sm:px-6 pt-8 animate-pulse">
					<div className="aspect-video bg-gray-200 rounded-md mb-4"></div>
					<div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
					<div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
					<div className="space-y-3">
						<div className="h-4 bg-gray-200 rounded w-full"></div>
						<div className="h-4 bg-gray-200 rounded w-full"></div>
						<div className="h-4 bg-gray-200 rounded w-5/6"></div>
					</div>
				</div>
			</div>
		);
	}

	if (error || !article) {
		return (
			<div className="pt-[4.2rem]">
				<TopBar withBackButton>Detail Artikel</TopBar>
				<div className="flex justify-center items-center h-[80vh]">
					<p>Error loading article. Please try again later.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="pt-[4.2rem] pb-20">
			<TopBar withBackButton>Detail Artikel</TopBar>
			<div className="py-2 flex flex-col px-4 sm:px-6 pt-8">
				{/* Image Section */}
				<div className="aspect-video rounded-md overflow-hidden">
					<img
						src={imageUrl}
						alt={title}
						className="object-cover size-full"
					/>
				</div>

				{/* Title Section */}
				<h1 className="text-slate-700 font-semibold text-lg pt-3">{title}</h1>
			
			{/* Meta Information */}
			<div className="flex items-center justify-between pt-4 pb-4 border-b border-slate-200">
				<div className="flex items-center gap-4">
					<div className="flex flex-col">
						<p className="text-sm text-slate-600">Admin Agpaii</p>
						<span className="text-xs text-slate-500">{modifiedDate}</span>
					</div>
				</div>
			</div>
			{/* Content Section */}
			<div className="pt-8 text-slate-700">
				{parseHtml(content, {
					replace: (domNode) => {
						const name = (domNode as any)?.name;
						const attribs = (domNode as any)?.attribs || {};

						// Add bottom margin to paragraph elements so they have spacing
						if (name === "p") {
							return (
								<p className="mb-4">
									{domToReact((domNode as any).children)}
								</p>
							);
						}

						// Normalize iframe embeds (YouTube, etc.) to be responsive and not overflow
						if (name === "iframe") {
							const src = attribs.src || "";
							const title = attribs.title || "embedded-video";
							const allow = attribs.allow || undefined;
							const frameBorder = attribs.frameborder ?? attribs.frameBorder ?? 0;
							const allowFullScreen =
								attribs.allowfullscreen !== undefined || attribs.allowFullScreen !== undefined;

							return (
								<div className="w-full max-w-full my-4">
									<div className="relative" style={{ paddingTop: "56.25%" }}>
										<iframe
											src={src}
											title={title}
											frameBorder={frameBorder}
											allow={allow}
											allowFullScreen={allowFullScreen}
											className="absolute top-0 left-0 w-full h-full"
										/>
									</div>
								</div>
							);
						}
					},
				})}
			</div>

			{/* Share Section */}
			<div className="mt-8 pt-6 border-t border-slate-200">
				<h3 className="text-sm font-semibold text-slate-700 mb-4">Bagikan Artikel</h3>
				<div className="flex items-center gap-2 justify-between">
					<button
						onClick={() => handleShare("whatsapp")}
						className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition text-sm"
					>
						<svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
							<path fill="currentColor" d="M4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5c5.079,0.002,9.845,1.979,13.43,5.566c3.584,3.588,5.558,8.356,5.556,13.428c-0.004,10.465-8.522,18.98-18.986,18.98c-0.001,0,0,0,0,0h-0.008c-3.177-0.001-6.3-0.798-9.073-2.311L4.868,43.303z"></path>
							<path fill="currentColor" d="M4.868,43.803c-0.132,0-0.26-0.052-0.355-0.148c-0.125-0.127-0.174-0.312-0.127-0.483l2.639-9.636c-1.636-2.906-2.499-6.206-2.497-9.556C4.532,13.238,13.273,4.5,24.014,4.5c5.21,0.002,10.105,2.031,13.784,5.713c3.679,3.683,5.704,8.577,5.702,13.781c-0.004,10.741-8.746,19.48-19.486,19.48c-3.189-0.001-6.344-0.788-9.144-2.277l-9.875,2.589C4.953,43.798,4.911,43.803,4.868,43.803z"></path>
							<path fill="currentColor" d="M35.176,12.832c-2.98-2.982-6.941-4.625-11.157-4.626c-8.704,0-15.783,7.076-15.787,15.774c-0.001,2.981,0.833,5.883,2.413,8.396l0.376,0.597l-1.595,5.821l5.973-1.566l0.577,0.342c2.422,1.438,5.2,2.198,8.032,2.199h0.006c8.698,0,15.777-7.077,15.78-15.776C39.795,19.778,38.156,15.814,35.176,12.832z"></path>
							<path fill="white" fillRule="evenodd" d="M19.268,16.045c-0.355-0.79-0.729-0.806-1.068-0.82c-0.277-0.012-0.593-0.011-0.909-0.011c-0.316,0-0.83,0.119-1.265,0.594c-0.435,0.475-1.661,1.622-1.661,3.956c0,2.334,1.7,4.59,1.937,4.906c0.237,0.316,3.282,5.259,8.104,7.161c4.007,1.58,4.823,1.266,5.693,1.187c0.87-0.079,2.807-1.147,3.202-2.255c0.395-1.108,0.395-2.057,0.277-2.255c-0.119-0.198-0.435-0.316-0.909-0.554s-2.807-1.385-3.242-1.543c-0.435-0.158-0.751-0.237-1.068,0.238c-0.316,0.474-1.225,1.543-1.502,1.859c-0.277,0.317-0.554,0.357-1.028,0.119c-0.474-0.238-2.002-0.738-3.815-2.354c-1.41-1.257-2.362-2.81-2.639-3.285c-0.277-0.474-0.03-0.731,0.208-0.968c0.213-0.213,0.474-0.554,0.712-0.831c0.237-0.277,0.316-0.475,0.474-0.791c0.158-0.317,0.079-0.594-0.04-0.831C20.612,19.329,19.69,16.983,19.268,16.045z" clipRule="evenodd"></path>
						</svg>
						WhatsApp
					</button>
					<button
						onClick={() => handleShare("facebook")}
						className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm"
					>
						<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
							<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
						</svg>
						Facebook
					</button>
					<button
						onClick={() => handleShare("twitter")}
						className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition text-sm"
					>
						<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
							<path d="M23.953 4.57a10 10 0 002.856-3.58 9.993 9.993 0 01-2.825.974 4.946 4.946 0 00-8.5 4.516A14.025 14.025 0 011.671 3.149a4.93 4.93 0 001.523 6.574 4.903 4.903 0 01-2.239-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.935 4.935 0 01-2.224.084 4.928 4.928 0 004.6 3.419A9.9 9.9 0 010 19.54a13.994 13.994 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
						</svg>
						Twitter
					</button>
					<button
						onClick={() => handleShare("copy")}
						className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-slate-500 hover:bg-slate-600 text-white rounded-lg transition text-sm"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
						</svg>
						Salin
					</button>
				</div>
			</div>

			{/* Recommended Articles Section */}
			<RecommendedArticles currentArticleId={id} />
			</div>
		</div>
	);
};

export default ArticlePage;