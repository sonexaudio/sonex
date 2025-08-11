import { useEffect } from "react";
import PageLayout from "../../../components/PageLayout";
import StripeManager from "./StripeManager";

import UpdateAccount from "./UpdateAccount";
import AccountActivities from "./AccountActivities";
import AccountDangerZone from "./AccountDangerZone";
import ConnectWithGoogleAccount from "./ConnectWithGoogleAccount";
import { useSearchParams } from "react-router";
import AuthState from "../../../components/auth/AuthState";
import { useAuth } from "../../../hooks/useAuth";
import useUser from "../../../hooks/useUser";
import SignOutButton from "../../../components/auth/SignoutButton";

const AccountPage = () => {
	const { session, loading } = useAuth();
	const { user } = useUser()
	const [searchParams] = useSearchParams();
	const error = searchParams.get("error");

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

	if (loading) return <p>Loading...</p>;

	return (

		<PageLayout>
			<SignOutButton />
			<pre className="text-sm overflow-clip flex flex-col mt-8">
				<span>Session info</span>
				{JSON.stringify(session, null, 2)}
			</pre>
			{/* {error && (
				<AuthState
					type="error"
					message="Google account email doesn't match your account email."
				/>
			)}
			<div className="space-y-8">
				<StripeManager />
				<UpdateAccount />
				<ConnectWithGoogleAccount />
				<AccountActivities activities={user?.activities} />
				<AccountDangerZone />
			</div> */}
		</PageLayout>
	);
};

export default AccountPage;
