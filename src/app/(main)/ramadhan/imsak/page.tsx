"use client";
import TopBar from "@/components/nav/topbar";
import axios from "axios";
import { useEffect, useState } from "react";
import html2canvas from "html2canvas"; // We will remove direct html2canvas usage for table
import jsPDF from "jspdf";
import "jspdf-autotable";
import logoAgpaii from "../../../../../public/icons/logo_agpaii.png";

interface Jadwal {
	tanggal: number;
	imsak: string;
	subuh: string;
	terbit: string;
	dhuha: string;
	dzuhur: string;
	ashar: string;
	maghrib: string;
	isya: string;
}

const ImsakRamadhan = () => {
	const [provinces, setProvinces] = useState<string[]>([]);
	const [cities, setCities] = useState<string[]>([]);
	const [selectedProvince, setSelectedProvince] =
		useState<string>("D.K.I Jakarta");
	const [selectedCity, setSelectedCity] = useState<string>("Kota Jakarta");
	const [schedule, setSchedule] = useState<Jadwal[]>([]);
	const [loading, setLoading] = useState({
		provinces: true,
		cities: true,
		schedule: true,
	});

	// Fetch provinces on mount
	useEffect(() => {
		const fetchProvinces = async () => {
			try {
				const response = await axios.get(
					"https://equran.id/api/v2/imsakiyah/provinsi",
				);
				setProvinces(response.data.data);

				// Set default Jakarta setelah provinsi dimuat
				if (response.data.data.includes("D.K.I Jakarta")) {
					fetchCities("D.K.I Jakarta");
				}
			} catch (error) {
				console.error("Error fetching provinces:", error);
			} finally {
				setLoading((prev) => ({ ...prev, provinces: false }));
			}
		};
		fetchProvinces();
	}, []);

	useEffect(() => {
		if (selectedProvince && selectedCity) {
			fetchSchedule(selectedProvince, selectedCity);
		}
	}, [selectedProvince, selectedCity]);

	// Fetch cities when province selected
	const fetchCities = async (province: string) => {
		try {
			setLoading((prev) => ({ ...prev, cities: true }));
			const response = await axios.post(
				"https://equran.id/api/v2/imsakiyah/kabkota",
				{ provinsi: province },
			);
			setCities(response.data.data);

			// Set default Kota Jakarta jika ada
			if (
				province === "D.K.I Jakarta" &&
				response.data.data.includes("Kota Jakarta")
			) {
				setSelectedCity("Kota Jakarta");
				fetchSchedule("D.K.I Jakarta", "Kota Jakarta");
			}
		} catch (error) {
			console.error("Error fetching cities:", error);
		} finally {
			setLoading((prev) => ({ ...prev, cities: false }));
		}
	};

	const fetchSchedule = async (provinceParam?: string, cityParam?: string) => {
		const selectedProv = provinceParam || selectedProvince;
		const selectedCityValue = cityParam || selectedCity;

		if (!selectedProv || !selectedCityValue) return;

		try {
			setLoading((prev) => ({ ...prev, schedule: true }));
			const response = await axios.post("https://equran.id/api/v2/imsakiyah", {
				provinsi: selectedProv,
				kabkota: selectedCityValue,
			});
			setSchedule(response.data.data[0]?.imsakiyah || []);
		} catch (error) {
			console.error("Error fetching schedule:", error);
		} finally {
			setLoading((prev) => ({ ...prev, schedule: false }));
		}
	};

	const handleExportPDF = async () => {
		const doc = new jsPDF("p", "mm", "a4"); // Landscape A4
		const pageWidth = doc.internal.pageSize.getWidth();
		const margin = 10;

		// Function to add header (Logo, AGPAII, Jadwal Imsakiyah)
		const addHeader = async (pageNumber: number) => {
			const logoDataUrl = logoAgpaii.src; // Use imported logo directly

			if (logoDataUrl) {
				doc.addImage(logoDataUrl, "PNG", margin, margin, 20, 20); // Smaller logo
			}
			doc.setFontSize(18); // Slightly smaller header font
			doc.text("AGPAII", pageWidth / 2, margin + 8, { align: "center" });
			doc.setFontSize(12);
			doc.text(
				`Jadwal Imsakiyah ${selectedProvince} - ${selectedCity}`,
				pageWidth / 2,
				margin + 15,
				{
					align: "center",
				},
			);
		};

		// Convert schedule data to table rows
		const tableData = schedule.map((item) => [
			item.tanggal,
			item.imsak,
			item.subuh,
			item.terbit,
			item.dhuha,
			item.dzuhur,
			item.ashar,
			item.maghrib,
			item.isya,
		]);

		const header = [
			"Tanggal",
			"Imsak",
			"Subuh",
			"Terbit",
			"Dhuha",
			"Dzuhur",
			"Ashar",
			"Maghrib",
			"Isya",
		];

		let startY = 35; // Start table below header
		let pageNumber = 1;

		await addHeader(pageNumber);

		// Use jspdf-autotable to draw table
		(doc as any).autoTable({
			// Type assertion to bypass jsPDF type issues with autotable
			head: [header],
			body: tableData,
			startY: startY,
			margin: { left: margin, right: margin },
			pageBreak: "auto", // Enable auto page break
			didDrawPage: async (data: any) => {
				// Add header and footer for every new page
				if (data.pageNumber > pageNumber) {
					pageNumber = data.pageNumber;
					await addHeader(pageNumber);
					startY = 35; // Reset startY for new page
				}
			},
			styles: {
				// Basic styling for better readability
				fontSize: 9,
				cellPadding: 2,
				halign: "center",
				valign: "middle",
			},
			headStyles: {
				fillColor: [100, 200, 100], // Green header
				textColor: 255,
				fontStyle: "bold",
				halign: "center",
			},
			columnStyles: { 0: { halign: "left" } }, // Align 'Tanggal' column to left
		});

		// Save PDF
		doc.save(`jadwal-imsakiyah-${selectedProvince}-${selectedCity}.pdf`);
	};

	return (
		<div className="p-6 bg-gray-50 min-h-screen pt-[5.21rem]">
			<TopBar withBackButton>Jadwal Imsakiyah</TopBar>

			<div className="max-w-4xl mx-auto mt-6 space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Provinsi
						</label>
						<select
							value={selectedProvince}
							onChange={(e) => {
								setSelectedProvince(e.target.value);
								fetchCities(e.target.value);
								setSelectedCity("");
							}}
							className="w-full p-2 border rounded-md"
							disabled={loading.provinces}>
							{loading.provinces ? (
								<option>Memuat provinsi...</option>
							) : (
								<>
									<option value="">Pilih Provinsi</option>
									{provinces.map((province) => (
										<option
											key={province}
											value={province}>
											{province}
										</option>
									))}
								</>
							)}
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Kabupaten/Kota
						</label>
						<select
							value={selectedCity}
							onChange={(e) => {
								setSelectedCity(e.target.value);
								fetchSchedule();
							}}
							className="w-full p-2 border rounded-md"
							disabled={!selectedProvince || loading.cities}>
							{loading.cities ? (
								<option>Memuat kabupaten/kota...</option>
							) : (
								<>
									<option value="">Pilih Kabupaten/Kota</option>
									{cities.map((city) => (
										<option
											key={city}
											value={city}>
											{city}
										</option>
									))}
								</>
							)}
						</select>
					</div>
				</div>

				{loading.schedule ? (
					<div className="text-center py-4">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
						<p className="mt-2 text-sm text-gray-600">Memuat jadwal...</p>
					</div>
				) : (
					schedule.length > 0 && (
						<div className="overflow-x-auto rounded-lg shadow">
							<div className="flex justify-center items-center px-4 py-2 text-white rounded-t-lg">
								<button
									onClick={handleExportPDF}
									className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md">
									Export ke PDF
								</button>
							</div>
							<div
								id="schedule-table"
								className="overflow-x-auto rounded-lg shadow">
								<table className="min-w-full bg-white">
									<thead className="bg-green-50">
										<tr>
											<th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
												Tanggal
											</th>
											<th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
												Imsak
											</th>
											<th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
												Subuh
											</th>
											<th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
												Terbit
											</th>
											<th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
												Dhuha
											</th>
											<th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
												Dzuhur
											</th>
											<th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
												Ashar
											</th>
											<th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
												Maghrib
											</th>
											<th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
												Isya
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-200">
										{schedule.map((item) => (
											<tr key={item.tanggal}>
												<td className="px-4 py-3 text-sm text-gray-700">
													{item.tanggal}
												</td>
												<td className="px-4 py-3 text-sm text-gray-600">
													{item.imsak}
												</td>
												<td className="px-4 py-3 text-sm text-gray-600">
													{item.subuh}
												</td>
												<td className="px-4 py-3 text-sm text-gray-600">
													{item.terbit}
												</td>
												<td className="px-4 py-3 text-sm text-gray-600">
													{item.dhuha}
												</td>
												<td className="px-4 py-3 text-sm text-gray-600">
													{item.dzuhur}
												</td>
												<td className="px-4 py-3 text-sm text-gray-600">
													{item.ashar}
												</td>
												<td className="px-4 py-3 text-sm text-gray-600">
													{item.maghrib}
												</td>
												<td className="px-4 py-3 text-sm text-gray-600">
													{item.isya}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					)
				)}
			</div>
		</div>
	);
};

export default ImsakRamadhan;
