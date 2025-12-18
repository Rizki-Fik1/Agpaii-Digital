import ArticlePage from "./ArticlePage";

export default async function ArticleDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const id = (await params).id;
	return <ArticlePage id={id} />;
}
