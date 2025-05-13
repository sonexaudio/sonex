import type React from "react";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link, Navigate } from "react-router";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const LoginSchema = z.object({
	email: z
		.string()
		.min(1, { message: "Email is required" })
		.email({ message: "Not a valid email" }),
	password: z.string().min(1, { message: "Password is required" }),
});

const LoginPage = () => {
	const { loginWithEmail, user } = useAuth();
	const [showPassword, setShowPassword] = useState(false);
	const [loginError, setLoginError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(LoginSchema),
	});

	if (user) return <Navigate to="/" />;

	return (
		<div>
			<h1>Welcome Back</h1>
			<p>Enter your login details to access Sonex</p>

			<div className="max-w-lg">
				<div>
					<button type="button">Sign in with google</button>
					<div className="flex items-center gap-4">
						<div className="size-0.5 w-full bg-black/50" />
						<span>or</span>
						<div className="size-0.5 w-full bg-black/50" />
					</div>
				</div>
				<form
					onSubmit={handleSubmit(async (data) => {
						setLoginError(null);
						try {
							await loginWithEmail(data.email, data.password);
						} catch (error: any) {
							console.error(error);
							setLoginError(error.message);
						}
					})}
				>
					{loginError && <p className="text-red-500 mt-2">{loginError}</p>}
					<input
						type="email"
						placeholder="Email Address"
						data-testid="loginEmail"
						autoComplete="email"
						{...register("email")}
					/>
					{errors.email && <p>{errors.email.message}</p>}
					<input
						type={showPassword ? "text" : "password"}
						placeholder="Password"
						data-testid="loginPassword"
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
						<Link to="/forgot-password">Forgot password</Link>
					</div>

					<button type="submit">Sign In</button>
				</form>

				<p>
					Don&apos;t have an account? <Link to="/signup">Sign up</Link>
				</p>
			</div>
		</div>
	);
};
export default LoginPage;
