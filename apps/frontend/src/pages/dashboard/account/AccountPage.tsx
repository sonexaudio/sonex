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
import { Avatar, AvatarImage } from "../../../components/ui/avatar";
import UpdateUserForm from "../../../components/forms/UpdateUserForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import ChangePasswordForm from "../../../components/forms/ChangePasswordForm";

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
			<div className="space-y-8 mt-8 px-8">
				<SignOutButton />
				<pre className="text-sm overflow-clip flex flex-col mt-8">
					<span>Session info</span>
					{JSON.stringify(session, null, 2)}
				</pre>
				<pre className="text-sm overflow-clip flex flex-col">
					<span>User info</span>
					{JSON.stringify(user, null, 2)}
				</pre>

				{user?.image ? (
					<Avatar className="size-24">
						<AvatarImage alt="User Avatar" src={user.image} />
					</Avatar>
				) : (
					<div className="size-24 border border-primary rounded-md bg-primary text-primary-foreground flex items-center justify-center">
						<span className="uppercase text-lg font-bold">{user?.name.slice(0, 2)}</span>
					</div>
				)}
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

				<Card>
					<CardHeader>
						<CardTitle
							className="text-2xl font-bold">
							Update User
						</CardTitle>
						<CardDescription>
							Update your account information and settings.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<UpdateUserForm
							name={user?.name as string}
							image={user?.image || ""}
						/>
					</CardContent>
				</Card>

				{/* Update Password */}
				<Card>
					<CardHeader>
						<CardTitle
							className="text-2xl font-bold">
							Change Password
						</CardTitle>
					</CardHeader>
					<CardContent>
						<ChangePasswordForm />
					</CardContent>
				</Card>
			</div>
		</PageLayout>
	);
};

export default AccountPage;
