import type React from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router";
import api from "../lib/axios";
import { useState } from "react";

const ResetPasswordPage = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const [newPassword, setNewPassword] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitIsSuccessful, setIsSubmitSuccessful] = useState(false);

	const token = searchParams.get("code");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			await api.patch(
				"/auth/reset-password",
				{ password: newPassword },
				{ params: { token } },
			);
			setIsSubmitSuccessful(true);
			setTimeout(
				() => navigate("/login", { replace: true, state: { fromReset: true } }),
				3000,
			);
		} catch (err) {
			console.error(err);
			setIsSubmitSuccessful(false);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!token) return <Navigate to="/" replace />;

	return (
		<div>
			{submitIsSuccessful && <p>Redirecting you back to login...</p>}
			<form onSubmit={handleSubmit}>
				<input
					type="password"
					value={newPassword}
					onChange={(e) => setNewPassword(e.target.value)}
					placeholder="Enter your new password"
					required
					disabled={submitIsSuccessful}
				/>
				<button type="submit" disabled={isSubmitting || submitIsSuccessful}>
					Reset Password
				</button>
			</form>
		</div>
	);
};
export default ResetPasswordPage;
