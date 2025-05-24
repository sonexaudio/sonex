import { z } from "zod";
import AuthenticationForm from "../../components/auth/AuthenticationForm";
import { useState } from "react";
import api from "../../lib/axios";
import AuthState from "../../components/auth/AuthState";
import { Link } from "react-router";
import type { AxiosError } from "axios";

type ForgotPasswordErrorParams = {
	error: string;
};

const forgotPasswordSchema = z.object({
	email: z.string().min(1, { message: "Email is required" }).email(),
});

const ForgotPasswordForm = () => {
	const [error, setError] = useState<string | null>(null);
	const [submitSuccessful, setSubmitSuccessful] = useState(false);
	const [debugResetTokenLink, setDebugResetTokenLink] = useState<string | null>(
		null,
	);

	const handleSubmit = async ({ email }: { email: string }) => {
		setError(null);
		setSubmitSuccessful(false);
		try {
			const { data } = await api.post("/auth/forgot-password", { email });
			setDebugResetTokenLink(data.data.resetTokenLink);
			setSubmitSuccessful(true);
		} catch (error) {
			const errData = (error as AxiosError).response?.data;
			console.error(errData);
			setError(
				((errData as ForgotPasswordErrorParams).error as string) ||
					"Something went wrong please try again",
			);
		}
	};
	return (
		<div className="max-w-md mt-4">
			<AuthenticationForm schema={forgotPasswordSchema} onSubmit={handleSubmit}>
				<div>
					<h1>
						Happens to the best of us.
						{submitSuccessful && (
							<span> That&apos;s why we got you covered!</span>
						)}
					</h1>
					<p>Enter your email address you signed up with</p>
				</div>

				{submitSuccessful && (
					<>
						<AuthState
							type="success"
							message="We have sent instructions to your email on how to reset your
    						password. These instruction expire in 15 minutes."
						/>
						<p>
							DEBUG MODE:{" "}
							<Link to={debugResetTokenLink as string}>
								Visit this link to reset password
							</Link>
						</p>
					</>
				)}

				{error && <AuthState type="error" message={error} />}

				<AuthenticationForm.Input
					name="email"
					type="email"
					placeholder="Enter your email address"
				/>
				<AuthenticationForm.SubmitButton>
					Recover Password
				</AuthenticationForm.SubmitButton>
			</AuthenticationForm>
		</div>
	);
};
export default ForgotPasswordForm;
