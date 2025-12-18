import Link from "next/link";

function stripHtml(html: string): string {
	return html.replace(/<[^>]*>/g, "");
}

export default function ArticleLarge({ article }: { article: any }) {
	const pubDate = new Date(article?.date).toLocaleDateString("id-ID", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});

	return (
		<Link href={`/article/${article?.id}`}>
			<div className="bg-[#EAEAEA] rounded-lg shadow-md overflow-hidden hover:shadow-md transition duration-300 ease-in-out cursor-pointer">
				{/* Gambar Besar */}
				<div className="w-full h-48 relative overflow-hidden">
					<img
						src={
							article.yoast_head_json?.og_image?.[0]?.url ||
							"/img/agpaii_splash.svg"
						}
						alt={article.title.rendered}
						className="w-full h-fit object-cover hover:scale-105 transition duration-300"
					/>
				</div>

				{/* Konten */}
				<div className="p-4">
					{/* Judul */}
					<h2 className="text-lg font-bold text-gray-800 line-clamp-2 mb-2">
						{article?.title.rendered}
					</h2>

					{/* Deskripsi */}
					<p className="text-sm text-gray-600 line-clamp-3 mb-4">
						{stripHtml(article?.excerpt?.rendered || "")}
					</p>
				</div>
			</div>
		</Link>
	);
}
