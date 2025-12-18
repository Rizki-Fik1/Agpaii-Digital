import { getImage } from "@/utils/function/function";
import Image from "next/image";
import Link from "next/link";

const getEducationalLevel = (number: string | number) => {
	switch (parseInt(number as string)) {
		case 1:
			return "SD";
			break;
		case 2:
			return "SMP";
			break;
		case 3:
			return "SMA";
			break;
		case 4:
			return "SMK";
			break;
		case 5:
			return "TK";
			break;
		case 9:
			return "SLB";
			break;

		default:
			break;
	}
};

export default function Rpp({ rpp }: { rpp: any }) {
	return (
		<Link
			href={`/rpp/${rpp.id}`}
			className="border border-slate-200 px-4 py-3 rounded-md flex gap-3">
			<div className="aspect-square overflow-hidden min-w-28 min-h-28 size-28 rounded-md">
				<Image
					fill
					alt={rpp.topic}
					src={
						rpp.image !== null ? getImage(rpp.image) : "/img/agpaii_splash.svg"
					}
					className="size-full"
				/>
			</div>
			<div className="flex flex-col">
				<h1 className="font-semibold text-slate-700 text-[0.9rem]">
					{rpp.topic}
				</h1>
				<span className="text-slate-500 text-sm">{rpp.user?.name}</span>
				<h3 className="text-sm text-slate-800">{rpp.subject}</h3>
				<p className="mt-auto text-sm font-medium text-slate-500">
					Jenjang {getEducationalLevel(rpp.grade.educational_level_id)}
				</p>
			</div>
		</Link>
	);
}
