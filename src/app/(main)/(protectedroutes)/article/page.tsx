"use client";

import React, { useState, useRef } from "react";
import TopBar from "@/components/nav/topbar";
import axios from "axios";
import { useInfiniteQuery } from "@tanstack/react-query";
import Link from "next/link";
import moment from "moment";
import "moment/locale/id";
import ArticleCarousel from "@/components/article/article-carousel";

interface ArticleType {
	id: number;
	title: { rendered: string };
	excerpt: { rendered: string };
	date: string;
	yoast_head_json?: {
		og_image?: Array<{ url: string }>;
	};
}

export default function ArticlePage() {
	const [searchQuery, setSearchQuery] = useState<string>("");
	const observerRef = useRef<HTMLDivElement | null>(null);

	const fetchArticles = async ({ pageParam = 1 }: { pageParam?: number }) => {
		const response = await axios.get(
			`https://agpaii.or.id/wp-json/wp/v2/posts?per_page=10&page=${pageParam}`
		);
		return {
			data: response.data,
			nextPage: response.data.length > 0 ? pageParam + 1 : undefined,
		};
	};

	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useInfiniteQuery({
			queryKey: ["articles"],
			queryFn: fetchArticles,
			getNextPageParam: (lastPage) => lastPage.nextPage,
			initialPageParam: 1,
		});

	const articles = data?.pages.flatMap((page) => page.data) || [];

	const filteredArticles = searchQuery
		? articles.filter((article) =>
				article.title.rendered
					.toLowerCase()
					.includes(searchQuery.toLowerCase()),
		  )
		: articles;

	React.useEffect(() => {
		if (!observerRef.current || !hasNextPage || isFetchingNextPage) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					fetchNextPage();
				}
			},
			{ threshold: 1.0 },
		);

		observer.observe(observerRef.current);

		return () => {
			if (observerRef.current) {
				observer.unobserve(observerRef.current);
			}
		};
	}, [fetchNextPage, hasNextPage, isFetchingNextPage]);

	return (
		<div className="pt-[4.2rem]">
			<TopBar withBackButton>Artikel</TopBar>

			{/* Featured Articles Carousel */}
			{!searchQuery && (
				<ArticleCarousel articles={articles} isLoading={isLoading} />
			)}

			{/* Search Section */}
			<div className="flex flex-col gap-4 px-4 py-2">
				<div className="flex gap-2">
					<input
						type="text"
						className="flex-1 p-2 border rounded-md"
						placeholder="Cari artikel"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
			</div>

			{/* Articles Grid - 2 Columns */}
			<div className="px-4 py-6 bg-slate-50">
				<div className="grid grid-cols-2 gap-3">
					{isLoading && articles.length === 0 ? (
						<p className="col-span-2 text-center text-gray-500">Loading...</p>
					) : filteredArticles.length > 0 ? (
						filteredArticles.map((article, index) => (
							<Link
								key={article.id}
								href={`/article/${article.id}`}
								className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition group"
							>
								<div className="relative h-32 overflow-hidden bg-slate-200">
									<img
										src={
											article.yoast_head_json?.og_image?.[0]?.url ||
											"/img/article.png"
										}
										alt={article.title.rendered}
										className="w-full h-full object-cover group-hover:scale-105 transition"
									/>
								</div>
								<div className="p-3">
									<p className="text-xs font-medium text-slate-700 line-clamp-2 h-8">
										{article.title.rendered}
									</p>
									<p className="text-xs text-slate-400 mt-1">
										{moment(article.date).locale("id").format("DD MMM YYYY")}
									</p>
								</div>
							</Link>
						))
					) : (
						<p className="col-span-2 text-center text-gray-500">
							Tidak ada artikel yang ditemukan.
						</p>
					)}
				</div>
			</div>

			{/* Infinite Scroll Trigger */}
			{hasNextPage && !searchQuery.trim() && (
				<div
					ref={observerRef}
					className="h-10"
				/>
			)}

			{isFetchingNextPage && (
				<div className="flex justify-center py-4">
					<p>Loading more articles...</p>
				</div>
			)}
		</div>
	);
}