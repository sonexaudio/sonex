import useUser from "../../../hooks/useUser";
import api from "../../../lib/axios";

const StripeManager = () => {
	const { currentUser: user } = useUser();

	const redirectToStripePortal = async () => {
		const {
			data: { data },
		} = await api.post("/payments/portal");
		if (data) {
			window.location.href = data.portalUrl;
		}
	};

	const redirectToStripeAccountPortal = async () => {
		const {
			data: { data },
		} = await api.post("/accounts/onboarding");
		if (data?.accountLink) {
			window.location.href = data.accountLink;
		}
	};

	return (
		<div className="flex gap-4">
			{user?.stripeCustomerId ? (
				<>
					<button type="button" onClick={redirectToStripePortal}>
						Manage subscription
					</button>
					{!user?.isOnboarded && (
						<button type="button" onClick={redirectToStripeAccountPortal}>
							Connect to Stripe
						</button>
					)}
				</>
			) : (
				<p>Pay for a subscription to access Sonex features</p>
			)}
		</div>
	);
};
export default StripeManager;
