import AuthenticationForm from "../../components/auth/AuthenticationForm";
import { useAuth } from "../../hooks/useAuth";
import { Link, useLocation, useNavigate } from "react-router";
import SignInWithGoogleButton from "../../components/auth/SignInWithGoogleButton";
import DividerLine from "../../components/DividerLine";
import { useEffect, useState } from "react";
import AuthState from "../../components/auth/AuthState";
import { LoginSchema } from "@sonex/schemas/user";
import type { ErrorResponse } from "../../context/AuthProvider";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod/dist/zod.js";
import { Card, CardContent } from "../../components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

const loginFormSchema = z.object({
	email: z.string().email({ message: "Email is required" }),
	password: z.string().min(8, { message: "Password must be at least 8 characters" }).max(25, { message: "Password too long" })
})

const LoginForm = () => {
	const { loginWithEmail } = useAuth();
	const location = useLocation();
	const navigate = useNavigate();

	const redirectPath = location.state?.from || "/";

	const form = useForm<z.infer<typeof loginFormSchema>>({
		resolver: zodResolver(loginFormSchema),
		defaultValues: {
			email: "",
			password: ""
		}
	});

	async function onSubmit(values: z.infer<typeof loginFormSchema>) {
		const { email, password } = values;
		await loginWithEmail(email, password);
	}

	const returningFromReset: boolean | undefined = location.state?.fromReset;

	return (
		<div className="max-w-md mt-4 space-y-6">
			{returningFromReset && (
				<AuthState
					type="success"
					message="Password reset successful. You may now log in."
				/>
			)}

			{location.state?.message && (
				<AuthState type="error" message={location.state?.message} />
			)}

			<Card className="z-50 w-full">
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
							<div className="grid gap-4">
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
									>
									</FormField>
								</div>
								<div className="grid gap-2">
									<FormField
										control={form.control}
										name="password"
										render={({ field }) => (
											<FormItem>
												<div className="flex justify-between items-center gap-2">
													<FormLabel>
														Password
													</FormLabel>
													<Link
														to="/forgot-password" className="text-sm italic text-muted-foreground hover:text-foreground">
														Forgot password?
													</Link>
												</div>
												<FormControl>
													<Input placeholder="Enter your password" autoComplete="current-password" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									>
									</FormField>
								</div>
							</div>

							<div><Button type="submit" className="w-full">Login</Button></div>

						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
};
export default LoginForm;
