import { useState } from "react";
import SignInWithGoogleButton from "../../../components/auth/SignInWithGoogleButton";
import { useAuth } from "../../../hooks/useAuth";

const ConnectOrDisconnectGoogleAccountButton = () => {
	const { user, unlinkGoogleAccount } = useAuth();
	const [loading, setLoading] = useState(false);

	return (
		<div>
			{user?.googleId ? (
				<button
					type="button"
					onClick={async () => {
						setLoading(true);
						try {
							await unlinkGoogleAccount();
						} catch (error) {
							console.error(error);
						} finally {
							setLoading(false);
						}
					}}
				>
					{loading ? "Unlinking..." : "Unlink your Google Account"}
				</button>
			) : (
				<>
					<h3>Connect your Google Account</h3>
					<SignInWithGoogleButton method="connect" />{" "}
					<p className="text-sm italic">
						Google email must match the email you signed up with.
					</p>
				</>
			)}
		</div>
	);
};
export default ConnectOrDisconnectGoogleAccountButton;
