import { useAuth } from "../../hooks/useAuth";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import React, { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Card, CardContent } from "../../components/ui/card";

import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../../components/ui/form";
import { toast } from "sonner";
import AuthState from "../../components/auth/AuthState";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from "../../components/ui/input-otp";
import { authClient } from "../../lib/client-auth";

const signupFormSchema = z
	.object({
		firstName: z.string().min(1, { message: "First name is required" }),
		lastName: z.string().min(1, { message: "Last name is required" }),
		email: z.string().email({ message: "Email is required" }),
		password: z
			.string()
			.min(8, { message: "Password must be at least 8 characters" })
			.max(25, { message: "Password too long" }),
		confirmPassword: z
			.string()
			.min(1, { message: "Please confirm your password" }),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

const SignupForm = () => {
	const { signup, error, isSubmitting, submitSuccessful, verifyOTP } = useAuth();
	const [otp, setOtp] = useState("");
	const [searchParams, setSearchParams] = useSearchParams();

	const form = useForm<z.infer<typeof signupFormSchema>>({
		resolver: zodResolver(signupFormSchema),
		defaultValues: {
			confirmPassword: "",
			email: "",
			firstName: "",
			lastName: "",
			password: "",
		},
	});

	async function onSubmit(values: z.infer<typeof signupFormSchema>) {
		const { firstName, lastName, password, email } = values;

		const name = `${firstName} ${lastName}`;

		try {
			setSearchParams({ signupEmail: email });
			await signup({ email, name, password });
		} catch (error) {
			toast.error("Failed to create account");
		}
	}

	async function handleOTPSubmit() {
		const otpEmail = searchParams.get("signupEmail");
		console.log("OTP EMAIL:", otpEmail);
		if (!otpEmail) {
			alert("Please enter your email first.");
			return;
		}

		await verifyOTP({ email: otpEmail, otp });
	}

	if (submitSuccessful) {
		return (
			<div className="space-y-8">
				<AuthState
					message="Account created successfully! Check your email to provide your one-time password."
					type="success"
				/>

				<div>
					<InputOTP
						maxLength={6}
						pattern={REGEXP_ONLY_DIGITS}
						value={otp}
						onChange={(value) => setOtp(value)}
					>
						<InputOTPGroup>
							<InputOTPSlot index={0} />
							<InputOTPSlot index={1} />
							<InputOTPSlot index={2} />
						</InputOTPGroup>
						<InputOTPSeparator />
						<InputOTPGroup>
							<InputOTPSlot index={3} />
							<InputOTPSlot index={4} />
							<InputOTPSlot index={5} />
						</InputOTPGroup>
					</InputOTP>
				</div>

				{otp.length === 6 && (
					<div>
						<Button onClick={handleOTPSubmit}>Verify</Button>
					</div>
				)}
			</div>
		);
	}

	return (
		<Card className="z-50 w-full max-w-md">
			<CardContent>
				{error && <AuthState message={error.message} type="error" />}
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
						<div className="grid gap-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="grid gap-2">
									<FormField
										control={form.control}
										name="firstName"
										render={({ field }) => (
											<FormItem className="grid gap-2">
												<FormLabel>First Name</FormLabel>
												<FormControl>
													<Input
														placeholder="Your legal first name"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<div className="grid gap-2">
									<FormField
										control={form.control}
										name="lastName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Last Name</FormLabel>
												<FormControl>
													<Input
														placeholder="Your legal last name"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>
							<div className="grid gap-2">
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email</FormLabel>
											<FormControl>
												<Input placeholder="user@sonex.app" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<div className="grid gap-2">
								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Password</FormLabel>
											<FormControl>
												<Input
													placeholder="Enter a password (8 chars min, 25 chars max)"
													autoComplete="new-password"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<div className="grid gap-2">
								<FormField
									control={form.control}
									name="confirmPassword"
									render={({ field }) => (
										<FormItem className="grid gap-2">
											<FormLabel>Confirm Password</FormLabel>
											<FormControl>
												<Input
													placeholder="Confirm your password"
													autoComplete="new-password"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						<div>
							<Button
								type="submit"
								className="w-full"
								disabled={isSubmitting || !form.formState.isValid}
							>
								{isSubmitting ? "Creating Account..." : "Create Account"}
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
};
export default SignupForm;
