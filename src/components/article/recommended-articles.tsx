import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function trimText(text: string, length: number) {
	return text.length > length ? text.slice(0, length) + "..." : text;
}

function stripHtml(html: string): string {
	return html.replace(/<[^>]*>/g, "");
}

export default function RecommendedArticles({ currentArticleId }: { currentArticleId: string }) {
	const fetchRecommendedArticles = async () => {
		const res = await axios.get(
			`https://agpaii.or.id/wp-json/wp/v2/posts?per_page=6&exclude=${currentArticleId}`
		);
		return res.status === 200 ? res.data : [];
	};

	const { data: articles = [], isLoading } = useQuery({
		queryKey: ["recommended-articles", currentArticleId],
		queryFn: fetchRecommendedArticles,
		staleTime: 1000 * 60 * 10, // 10 minutes
	});

	// Take random 3 articles
	const recommended = articles
		.sort(() => Math.random() - 0.5)
		.slice(0, 10);

	if (isLoading) {
		return (
			<div className="mt-8 pt-8 border-t px-4">
				<h2 className="text-lg font-bold text-gray-800 mb-4">Artikel Lainnya</h2>
				<div className="grid grid-cols-2 gap-3">
					{[...Array(2)].map((_, i) => (
						<div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
							<Skeleton height={128} />
							<div className="p-3">
								<Skeleton height={18} width="80%" />
								<Skeleton height={14} width="60%" style={{ marginTop: "8px" }} />
								<Skeleton height={14} width="40%" style={{ marginTop: "8px" }} />
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	if (recommended.length === 0) {
		return null;
	}

	return (
		<div className="mt-8 pt-8 border-t px-4">
			<h2 className="text-lg font-bold text-gray-800 mb-4">Artikel Lainnya</h2>
			<div className="grid grid-cols-2 gap-3">
				{recommended.map((article: any) => {
					const excerpt = stripHtml(article?.excerpt?.rendered || "");
					return (
						<Link key={article.id} href={`/article/${article.id}`}>
							<div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition group cursor-pointer h-full">
								{/* Image */}
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

								{/* Content */}
								<div className="p-3">
									<h3 className="text-xs font-bold text-gray-800 line-clamp-2 mb-2">
										{article?.title.rendered}
									</h3>
									<p className="text-xs text-gray-600 line-clamp-1">
										{trimText(excerpt, 50)}
									</p>
								</div>
							</div>
						</Link>
					);
				})}
			</div>
		</div>
	);
}
