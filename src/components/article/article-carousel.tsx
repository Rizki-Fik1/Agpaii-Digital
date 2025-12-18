import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

interface CarouselArticle {
	id: number;
	title: { rendered: string };
	yoast_head_json?: {
		og_image?: Array<{ url: string }>;
	};
}

export default function ArticleCarousel({
	articles,
	isLoading,
}: {
	articles: CarouselArticle[];
	isLoading: boolean;
}) {
	if (isLoading || articles.length === 0) {
		return null;
	}

	const featuredArticles = articles.slice(0, 5);

	return (
		<div className="w-full px-4 py-4">
			<Swiper
				modules={[Pagination, Autoplay]}
				pagination={{ clickable: true }}
				autoplay={{ delay: 5000, disableOnInteraction: false }}
				className="w-full rounded-lg overflow-hidden"
				slidesPerView={1}>
				{featuredArticles.map((article) => (
					<SwiperSlide key={article.id}>
						<Link href={`/article/${article.id}`}>
							<div className="relative w-full h-64 bg-gray-200 group cursor-pointer">
								{/* Gambar */}
								<img
									src={
										article.yoast_head_json?.og_image?.[0]?.url ||
										"/img/agpaii_splash.svg"
									}
									alt={article.title.rendered}
									className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
								/>

								{/* Overlay */}
								<div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition duration-300 flex flex-col justify-end p-4">
									{/* Konten */}
									<div className="text-white">
										<h2 className="text-lg font-bold line-clamp-2 mb-2">
											{article.title.rendered}
										</h2>
										<p className="text-sm opacity-90">Baca Selengkapnya →</p>
									</div>
								</div>
							</div>
						</Link>
					</SwiperSlide>
				))}
			</Swiper>
		</div>
	);
}
