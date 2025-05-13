import type React from "react";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import api from "../lib/axios";
import { Link } from "react-router";

const ForgotPasswordPage = () => {
	const { user } = useAuth();
	const [email, setEmail] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitIsSuccessful, setIsSubmitSuccessful] = useState(false);
	const [debugResetTokenLink, setDebugResetTokenLink] = useState<string | null>(
		null,
	);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsSubmitting(true);
		setIsSubmitSuccessful(false);

		try {
			const { data } = await api.post("/auth/forgot-password", { email });

			setDebugResetTokenLink(data.data.resetTokenLink);
			setIsSubmitSuccessful(true);
		} catch (error) {
			setError(error.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	// if user already authenticated, this page doesn't exist
	return (
		<div>
			<h1>
				Happens to the best of us.
				{submitIsSuccessful && (
					<span> That&apos;s why we got you covered!</span>
				)}
			</h1>
			{submitIsSuccessful ? (
				<div className="bg-green-500 text-green-100">
					{/* TODO change to email notification */}
					<h3>
						We have sent instructions to your email on how to reset your
						password. These instruction expire in 15 minutes
					</h3>
					<p>
						DEBUG MODE:{" "}
						<Link to={debugResetTokenLink as string}>
							Visit this link to reset password
						</Link>
					</p>
				</div>
			) : (
				<>
					<p>Enter your email address you signed up with</p>
				</>
			)}
			<form onSubmit={handleSubmit}>
				<input
					type="email"
					placeholder="Enter your email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					disabled={submitIsSuccessful}
					required
				/>
				<button type="submit" disabled={isSubmitting || submitIsSuccessful}>
					Recover password
				</button>
			</form>
		</div>
	);
};
export default ForgotPasswordPage;
