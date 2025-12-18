"use client";

import API from "@/utils/api/config";
import {
	FolderIcon,
	DocumentIcon,
	ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

const downloadFile = async (content: any) => {
	let url = process.env.NEXT_PUBLIC_STORAGE_URL + "/" + content.src;
	let name = content.name;
	await fetch(url, {
		headers: new Headers({
			Origin: location.origin,
		}),
		mode: "cors",
	})
		.then(async (res) => await res.blob())
		.then((blob) => {
			console.log(blob);
			let url = URL.createObjectURL(blob);
			forceDownload(url, name);
		})
		.catch((err) => console.log(err));
};

const forceDownload = (blob: any, filename: string) => {
	let a = document.createElement("a");
	a.download = filename;
	a.href = blob;
	a.click();
	a.remove();
};

export default function FolderContents() {
	const { id } = useParams();

	const { data: contents, isLoading } = useQuery({
		queryKey: ["contents", id],
		queryFn: async () => {
			const res = await API.get(`/cloud${!!id ? "/" + id : ""}`);
			if (res.status == 200) return res.data;
			else return null;
		},
	});

	return (
		<div>
			{!!isLoading ? null : (
				<div className="flex flex-col justify-center w-full">
					<div className="flex flex-col w-full ">
						{contents.length > 0 ? (
							contents.map((content: any, i: number) => {
								return content.type == "folder" ? (
									<Link
										key={i}
										href={`/cloud/${content.id}?name=${content.name}`}
										className="flex gap-3.5 items-center px-5 sm:px-6 py-3 border-b border-b-slate-300">
										<FolderIcon className="size-[1.4rem] text-slate-500" />

										<h4 className="text-sm font-medium text-center text-slate-600">
											{content.name}
										</h4>
									</Link>
								) : (
									<div
										key={i}
										className="flex gap-3.5 items-center px-5 sm:px-6 py-3 border-b border-b-slate-300">
										<DocumentIcon className="size-6 text-slate-500" />
										<h4 className="text-sm font-medium text-center text-slate-600">
											{content.name}
										</h4>
										<ArrowDownTrayIcon
											onClick={() => downloadFile(content)}
											className="size-[1.2rem] ms-auto text-slate-600 cursor-pointer"
										/>
									</div>
								);
							})
						) : (
							<div className="flex justify-center mt-36">
								<h1 className="text-sm text-slate-400">Tidak ada folder</h1>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
