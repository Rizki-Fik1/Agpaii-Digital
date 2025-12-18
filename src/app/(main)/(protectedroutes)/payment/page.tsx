"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import API from "@/utils/api/config";
import TopBar from "@/components/nav/topbar";

const PaymentPage = () => {
	const searchParams = useSearchParams();
	const paymentType = searchParams.get("paymentType");
	const [paymentData, setPaymentData] = useState({
		token: "",
		url: "",
	});
	const [isLoading, setIsLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);
	const webViewRef = useRef(null);

	useEffect(() => {
		const generatePayment = async () => {
			try {
				if (paymentType === "membership") {
					const response = await API.post(`/membership-fee`);

					setPaymentData({
						token: response.data.data.snap_token,
						url: response.data.data.payment_url,
					});
				} else {
					const response = await API.post(`/subscribe-fee`);
					setPaymentData({
						token: response.data.data.snap_token,
						url: response.data.data.payment_url,
					});
				}
				setIsLoading(false);
			} catch (error) {
				console.error("Error generating payment:", error);
				setIsLoading(false);
			}
		};

		if (paymentType) {
			generatePayment();
		}
	}, [paymentType]);

	const handlePaymentStatus = (status: string) => {
		if (status === "success") {
			setIsPaymentSuccessful(true);
			setShowModal(true);
		} else {
			setIsPaymentSuccessful(false);
			setShowModal(true);
		}
	};

	return (
		<div className="min-h-screen bg-gray-100 p-6">
			<TopBar withBackButton>Payment</TopBar>

			<div className="pt-[4.2rem] pb-20">
				{isLoading ? (
					<div className="flex justify-center items-center h-full">
						<p>Loading payment details...</p>
					</div>
				) : (
					<div>
						<div className="mb-6">
							{paymentData.url && (
								<iframe
									ref={webViewRef}
									src={paymentData.url}
									height="600"
									width="100%"
									frameBorder="0"
									onLoad={() => console.log("Payment iframe loaded")}
								/>
							)}
						</div>
					</div>
				)}
			</div>

			{showModal && (
				<div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
					<div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
						<h2 className="text-xl font-bold mb-4">
							{isPaymentSuccessful ? "Payment Successful" : "Payment Failed"}
						</h2>
						<p className="text-gray-600 mb-4">
							{isPaymentSuccessful
								? "Your payment has been processed successfully."
								: "There was an issue processing your payment. Please try again."}
						</p>
						<button
							onClick={() => setShowModal(false)}
							className="bg-blue-500 text-white px-4 py-2 rounded">
							Close
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default PaymentPage;
