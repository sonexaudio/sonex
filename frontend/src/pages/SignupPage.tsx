import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";
import { Link, Navigate } from "react-router";

const signupSchema = z.object({
	email: z
		.string()
		.min(1, { message: "Email is required" })
		.email({ message: "Not a valid email" }),
	password: z
		.string()
		.min(8, { message: "Password must be at least 8 characters" }),
	name: z.string().optional(),
});

const SignupPage = () => {
	const { signup, user, loginWithGoogle } = useAuth();
	const [showPassword, setShowPassword] = useState(false);
	const [signupError, setSignupError] = useState<string | null>(null);
	const [signupIsSuccessful, setSignupIsSuccessful] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm({
		resolver: zodResolver(signupSchema),
	});

	if (user) return <Navigate to="/" replace />;

	return (
		<div>
			<h1>Welcome To Sonex</h1>
			<p>Enter your details to access Sonex</p>

			<div className="max-w-lg">
				<div>
					{signupIsSuccessful && (
						<div className="bg-green-500 text-green-100">
							{/* TODO change to email notification */}
							<h3>
								Welcome to Sonex! You can now <Link to="/login">login</Link>
							</h3>
						</div>
					)}
					<button
						type="button"
						disabled={isSubmitting || signupIsSuccessful}
						onClick={loginWithGoogle}
					>
						Sign in with google
					</button>
					<div className="flex items-center gap-4">
						<div className="size-0.5 w-full bg-black/50" />
						<span>or</span>
						<div className="size-0.5 w-full bg-black/50" />
					</div>
				</div>
				<form
					onSubmit={handleSubmit(async (data) => {
						setSignupError(null);
						setSignupIsSuccessful(false);
						try {
							const user = await signup(data);
							setSignupIsSuccessful(true);
						} catch (error: any) {
							console.error(error);
							setSignupError(error.error);
							setSignupIsSuccessful(false);
						}
					})}
				>
					{signupError && <p className="text-red-500 mt-2">{signupError}</p>}
					<input
						type="email"
						placeholder="Email Address"
						data-testid="signupEmail"
						autoComplete="email"
						{...register("email")}
					/>
					{errors.email && <p>{errors.email.message}</p>}
					<input
						type={showPassword ? "text" : "password"}
						placeholder="Password"
						data-testid="signupPassword"
						{...register("password")}
					/>
					{errors.password && <p>{errors.password.message}</p>}
					<div className="flex gap-4">
						<label htmlFor="show-password" className="flex gap-1">
							<input
								type="checkbox"
								checked={showPassword}
								onChange={() => setShowPassword(!showPassword)}
							/>
							<span>Show password</span>
						</label>
					</div>

					<input
						type="text"
						placeholder="Full name"
						data-testid="signupName"
						{...register("name")}
					/>
					{errors.name && <p>{errors.name?.message}</p>}

					<button type="submit" disabled={isSubmitting || signupIsSuccessful}>
						Sign up
					</button>
				</form>

				<p>
					Already have an account? <Link to="/login">Sign in</Link>
				</p>
			</div>
		</div>
	);
};
export default SignupPage;
