import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardFooter, } from "../../components/ui/card";

import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form";
import { toast } from "sonner";

const signupFormSchema = z.object({
	firstName: z.string().min(1, { message: "First name is required" }),
	lastName: z.string().min(1, { message: "Last name is required" }),
	email: z.string().email({ message: "Email is required" }),
	password: z.string().min(8, { message: "Password must be at least 8 characters" }).max(25, { message: "Password too long" })
	,
	confirmPassword: z.string().min(1, { message: "Please confirm your password" })
}).refine((data) => data.password === data.confirmPassword, {
	message: "Passwords do not match",
	path: ["confirmPassword"],
})

const SignupForm = () => {
	const { signup } = useAuth();

	const form = useForm<z.infer<typeof signupFormSchema>>({
		resolver: zodResolver(signupFormSchema),
		defaultValues: {
			confirmPassword: "",
			email: "",
			firstName: "",
			lastName: "",
			password: ""
		}
	})

	const [signupError, setSignupError] = useState<string | null>();
	const [submitSuccessful, setSubmitSuccessful] = useState(false);


	async function onSubmit(values: z.infer<typeof signupFormSchema>) {

		const { firstName, lastName, password, email } = values;

		const name = `${firstName} ${lastName}`;

		const success = await signup({ email, name, password });

		if (success) {
			toast(`Welcome to Sonex ${firstName}!`);
		}

	}

	useEffect(() => {
		if (signupError) {
			const clearError = setTimeout(() => setSignupError(null), 4000);
			return () => clearTimeout(clearError);
		}
	}, [signupError]);

	return (
		<Card className="z-50 w-full max-w-md">
			<CardContent>
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
													<Input placeholder="Your legal first name" {...field} />
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
										name="lastName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Last Name</FormLabel>
												<FormControl>
													<Input placeholder="Your legal last name" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									>
									</FormField>
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
								>
								</FormField>
							</div>
							<div className="grid gap-2">
								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Password</FormLabel>
											<FormControl>
												<Input placeholder="Enter a password (8 chars min, 25 chars max)" autoComplete="new-password" {...field} />
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
									name="confirmPassword"
									render={({ field }) => (
										<FormItem className="grid gap-2">
											<FormLabel>Confirm Password</FormLabel>
											<FormControl>
												<Input placeholder="Confirm your password" autoComplete="new-password" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								>
								</FormField>
							</div>
						</div>

						<div><Button type="submit" className="w-full">Create Account</Button></div>

					</form>
				</Form>
			</CardContent>

		</Card>
	);
};
export default SignupForm;
