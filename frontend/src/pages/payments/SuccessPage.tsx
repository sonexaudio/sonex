import { useSearchParams } from "react-router";
import api from "../../lib/axios";

const SuccessPage = () => {
	const [searchParams] = useSearchParams();
	const sessionId = searchParams.get("session_id");
	// if (!sessionId) return <p>This page can not be shown</p>;

	const handleStripeAccountRedirect = async () => {
		const {
			data: { data },
		} = await api.post("/accounts/account");

		if (data) {
			const {
				data: { data: onboardingRes },
			} = await api.post("/accounts/onboarding");

			window.location.href = onboardingRes.accountLink;
		}
	};

	return (
		<div>
			<h1>Welcome! Now you must connect your Stripe Account</h1>
			<button type="button" onClick={handleStripeAccountRedirect}>
				Create Stripe Account
			</button>
		</div>
	);
};
export default SuccessPage;
