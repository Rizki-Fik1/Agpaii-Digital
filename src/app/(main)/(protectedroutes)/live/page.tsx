"use client";

import TopBar from "@/components/nav/topbar";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import API from "@/utils/api/config";

interface VideoData {
	id: string;
	link: string;
	title: string;
}

const LivePage: React.FC = () => {
	const [data, setData] = useState<VideoData[]>([]);
	const [playing, setPlaying] = useState<boolean>(false);
	const [refreshing, setRefreshing] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(true);

	const onStateChange = useCallback((state: string) => {
		if (state === "ended") {
			setPlaying(false);
			alert("Video selesai diputar!");
		}
	}, []);

	useEffect(() => {
		const getYoutubeLinks = async () => {
			try {
				setLoading(true);
				const response = await API.get<VideoData[]>(`/youtube`);
				setData(response.data);
			} catch (error) {
				console.error("Error fetching YouTube links:", error);
			} finally {
				setLoading(false);
			}
		};

		getYoutubeLinks();
	}, []);

	const extractVideoId = (url: string): string | null => {
		const match = url.match(
			/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/live\/)([^"&?\/\s]{11})/,
		);
		return match ? match[1] : null;
	};

	const renderItem = (item: VideoData) => {
		const videoId = extractVideoId(item.link);

		if (!videoId) {
			return (
				<div
					className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
					role="alert">
					<p>Tidak dapat memuat video untuk link: {item.link}</p>
				</div>
			);
		}

		return (
			<div className="bg-white shadow rounded p-4 mb-4">
				<div className="aspect-w-16 aspect-video mb-2">
					<iframe
						width="100%"
						height="100%"
						src={`https://www.youtube.com/embed/${videoId}`}
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowFullScreen
						title={item.title}></iframe>
				</div>
				<p className="font-semibold text-lg text-center">{item.title}</p>
			</div>
		);
	};

	return (
		<div className="pt-[3.9rem] bg-gray-100 min-h-screen">
			<TopBar withBackButton>Live & Video</TopBar>
			<div className="p-4">
				{loading ? (
					<div className="flex justify-center items-center h-64">
						<div className="text-center">
							<div className="loader mb-4"></div>
							<p className="text-gray-700">Memuat data...</p>
						</div>
					</div>
				) : data.length === 0 ? (
					<div className="flex justify-center items-center h-64">
						<p className="text-gray-700">Tidak ada tayangan YouTube</p>
					</div>
				) : (
					<div>
						{data.map((item) => (
							<div key={item.id}>{renderItem(item)}</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default LivePage;
