import { z } from "zod";
import AuthenticationForm from "../../components/auth/AuthenticationForm";
import { useState } from "react";
import api from "../../lib/axios";
import AuthState from "../../components/auth/AuthState";
import { useNavigate } from "react-router";
import type { AxiosError } from "axios";

type ResetPasswordErrorParams = {
	error: string;
};

const resetPasswordSchema = z.object({
	password: z.string().min(1, { message: "New password is required" }),
});

const ResetPasswordForm = ({ token }: { token: string }) => {
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();
	const [submitSuccessful, setSubmitSuccessful] = useState(false);

	const handleSubmit = async ({ password }: { password: string }) => {
		setError(null);
		setSubmitSuccessful(false);
		try {
			await api.patch(
				"/auth/reset-password",
				{ password },
				{ params: { token } },
			);

			setSubmitSuccessful(true);
			setTimeout(
				() => navigate("/login", { replace: true, state: { fromReset: true } }),
				3000,
			);
		} catch (error) {
			const errData = (error as AxiosError).response?.data;
			console.error(errData);
			setError(
				((errData as ResetPasswordErrorParams).error as string) ||
					"Something went wrong please try again",
			);
		}
	};

	return (
		<div className="max-w-md mt-4">
			<AuthenticationForm schema={resetPasswordSchema} onSubmit={handleSubmit}>
				<div>
					<h1>Reset Password</h1>
					<p>
						Enter your new password, then you will be redirected to log back in.
					</p>
				</div>

				{error && <AuthState type="error" message={error} />}
				{submitSuccessful && (
					<AuthState
						type="success"
						message="Password changed. Redirecting to login..."
					/>
				)}

				<AuthenticationForm.Input
					name="password"
					type="password"
					placeholder="Enter your new password"
				/>
				<AuthenticationForm.SubmitButton>
					Change Password
				</AuthenticationForm.SubmitButton>
			</AuthenticationForm>
		</div>
	);
};
export default ResetPasswordForm;
