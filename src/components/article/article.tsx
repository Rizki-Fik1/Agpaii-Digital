import Link from "next/link";
import clsx from "clsx";

function trimText(text: string, length: number) {
	return text.length > length ? text.slice(0, length) + "..." : text;
}

function stripHtml(html: string): string {
	return html.replace(/<[^>]*>/g, "");
}

export default function Article({ article, i }: { article: any; i: number }) {
	const excerpt = stripHtml(article?.excerpt?.rendered || "");
	const pubDate = new Date(article?.date).toLocaleDateString("id-ID", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});

	return (
		<Link href={`/article/${article?.id}`}>
			<div className="flex flex-row bg-[#EAEAEA] rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300 ease-in-out gap-4 p-4 cursor-pointer">
				{/* Konten Artikel - Left Side */}
				<div className="flex-1 flex flex-col justify-between">
					<div>
						<h3 className="text-base font-bold text-gray-800 line-clamp-2 mb-2">
							{article?.title.rendered}
						</h3>
						<p className="text-sm text-gray-600 line-clamp-2">
							{trimText(excerpt, 100)}
						</p>
					</div>
				</div>

				{/* Gambar Artikel - Right Side */}
				<div className="w-28 h-28 flex-shrink-0 rounded-md overflow-hidden">
					<img
						src={
							article.yoast_head_json?.og_image?.[0]?.url ||
							"/img/agpaii_splash.svg"
						}
						alt={article.title.rendered}
						className="w-full h-full object-cover hover:scale-105 transition duration-300"
					/>
				</div>
			</div>
		</Link>
	);
}
