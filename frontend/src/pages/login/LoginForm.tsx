import { z } from "zod";
import AuthenticationForm from "../../components/auth/AuthenticationForm";
import { useAuth } from "../../hooks/useAuth";
import { Link, useLocation } from "react-router";
import SignInWithGoogleButton from "../../components/auth/SignInWithGoogleButton";
import DividerLine from "../../components/DividerLine";
import { useState } from "react";
import LoginState from "./LoginState";

const LoginSchema = z.object({
	email: z
		.string()
		.min(1, { message: "Email is required" })
		.email({ message: "Not a valid email" }),
	password: z.string().min(1, { message: "Password is required" }),
});

type LoginErrorParams = {
	message: string;
};

const LoginForm = () => {
	const { loginWithEmail } = useAuth();
	const [loginError, setLoginError] = useState<string | null>(null);
	const location = useLocation();

	const handleSubmit = async ({
		email,
		password,
	}: { email: string; password: string }) => {
		setLoginError(null);
		try {
			await loginWithEmail(email, password);
		} catch (error) {
			const message = (error as LoginErrorParams).message;
			setLoginError(message || "Something went wrong. Please try again.");
		}
	};

	const returningFromReset: boolean | undefined = location.state?.fromReset;

	return (
		<div className="max-w-md mt-4 space-y-6">
			{returningFromReset && (
				<LoginState
					type="success"
					message="Password reset successful. You may now log in."
				/>
			)}

			<SignInWithGoogleButton />

			<DividerLine />

			<AuthenticationForm schema={LoginSchema} onSubmit={handleSubmit}>
				{loginError && <LoginState type="error" message={loginError} />}
				<h3>Sign in with email and password</h3>
				<AuthenticationForm.Input
					name="email"
					label="Email"
					type="email"
					placeholder="Enter your email address"
				/>
				<AuthenticationForm.Input
					name="password"
					label="Password"
					type="password"
					placeholder="Enter your password"
				/>
				<div className="flex justify-between">
					<AuthenticationForm.ShowPasswordToggle />
					<Link to="/forgot-password" className="text-sm">
						Forgot Password?
					</Link>
				</div>

				<AuthenticationForm.SubmitButton>
					Log in
				</AuthenticationForm.SubmitButton>
			</AuthenticationForm>

			<p className="mt-4 text-center text-sm">
				Don&apos;t have an account? <Link to="/signup">Sign up</Link>
			</p>
		</div>
	);
};
export default LoginForm;
