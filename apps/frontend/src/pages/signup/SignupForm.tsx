import AuthenticationForm from "../../components/auth/AuthenticationForm";
import AuthState from "../../components/auth/AuthState";
import SignInWithGoogleButton from "../../components/auth/SignInWithGoogleButton";
import DividerLine from "../../components/DividerLine";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { SignupSchema } from "@sonex/schemas/user";

type SignupErrorParams = {
	error: string;
};

const SignupForm = () => {
	const { signup } = useAuth();
	const [signupError, setSignupError] = useState<string | null>();
	const [submitSuccessful, setSubmitSuccessful] = useState(false);
	const handleSubmit = async ({
		email,
		password,
		name,
	}: { email: string; password: string; name: string }) => {
		setSignupError(null);
		setSubmitSuccessful(false);
		try {
			await signup({ email, password, name });
			setSubmitSuccessful(true);
		} catch (error) {
			const message = (error as SignupErrorParams).error;
			setSubmitSuccessful(false);
			setSignupError(message || "Something went wrong. Please try again.");
		}
	};

	useEffect(() => {
		if (signupError) {
			const clearError = setTimeout(() => setSignupError(null), 4000);
			return () => clearTimeout(clearError);
		}
	}, [signupError]);

	return (
		<div className="max-w-md mt-4 space-y-6">
			<SignInWithGoogleButton />
			<DividerLine />
			<AuthenticationForm schema={SignupSchema} onSubmit={handleSubmit}>
				{signupError && <AuthState type="error" message={signupError} />}
				{submitSuccessful && (
					<AuthState
						type="success"
						message="Awesome! We sent a confirmation email to you."
					/>
				)}
				<h3>Sign up with your email and password</h3>
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
				<AuthenticationForm.Input
					name="name"
					label="Full Name"
					placeholder="Enter your full name"
				/>

				<div className="flex justify-between">
					<AuthenticationForm.ShowPasswordToggle />
				</div>

				<AuthenticationForm.SubmitButton>
					Sign up
				</AuthenticationForm.SubmitButton>
			</AuthenticationForm>
			<p className="text-center text-sm">
				Already have an account? <Link to="/login">Sign in</Link>
			</p>
		</div>
	);
};
export default SignupForm;
