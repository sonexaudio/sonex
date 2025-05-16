import { useEffect } from "react";
import AuthLayout from "../../../components/AuthLayout";
import PageLayout from "../../../components/PageLayout";
import { useAuth } from "../../../hooks/useAuth";
import api from "../../../lib/axios";

const AccountPage = () => {
	const { user } = useAuth();
	/* Functions
        Check if user has ability to view page
        Get user information - done via AuthProvider
        Check if user has active subscription
        Check if user has successfully onboarded account 
        Display user's current subscription
    */
	// Button to customer portal
	// Button to stripe connect

	// Section to update current information (can even connect or view google account)
	// -- If user connected via google, add ability to add password
	// Add ability to delete account (should soft delete)
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
		<AuthLayout>
			<PageLayout>
				<div className="space-y-8">
					<div className="flex gap-4">
						<button type="button" onClick={redirectToStripePortal}>
							Manage subscription
						</button>
						{!user?.isOnboarded && (
							<button type="button" onClick={redirectToStripeAccountPortal}>
								Connect to Stripe
							</button>
						)}
					</div>
					{/* Update account information */}
					<div>
						<h3>Profile Information</h3>
						<form>
							<div className="flex items-center gap-4">
								<input type="text" value={user?.firstName} />
								<input type="text" value={user?.lastName} />
							</div>
							<div>
								<input type="email" value={user?.email} />
								<input type="password" />
							</div>
						</form>
					</div>

					{/* delete account */}
					<div>
						<button type="button">Delete account</button>
					</div>
				</div>
			</PageLayout>
		</AuthLayout>
	);
};

export default AccountPage;
