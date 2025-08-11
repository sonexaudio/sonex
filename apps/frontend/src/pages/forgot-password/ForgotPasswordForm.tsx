import { useState } from "react";
import AuthState from "../../components/auth/AuthState";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { authClient } from "../../lib/client-auth";

const ForgotPasswordForm = () => {
	const [submitSuccessful, setSubmitSuccessful] = useState(false);
	const [isPending, setIsPending] = useState(false);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const fd = new FormData(e.target as HTMLFormElement);
		const email = fd.get("email") as string;

		if (!email) return toast.error("Please enter your email address.");

		await authClient.forgetPassword({
			email,
			redirectTo: `${import.meta.env.VITE_FRONTEND_URL}/auth/reset-password`,
			fetchOptions: {
				onRequest: () => {
					setIsPending(true);
					setSubmitSuccessful(false);
				},
				onResponse: () => {
					setIsPending(false);
				},
				onError: (ctx) => {
					toast.error(
						"Failed to send reset password email. Please try again later.",
					);
					console.log(ctx);
				},
				onSuccess: () => {
					setSubmitSuccessful(true);
					toast.success("Success! An email has been sent to reset your password.");
				},
			}
		});
	}

	return (
		<form onSubmit={handleSubmit} className="max-w-sm w-full space-y-8">
			{submitSuccessful && (
				<AuthState message="Success! An email has been sent to reset your password." type="success" />
			)}

			<div className="grid gap-4">
				<Label htmlFor="email">Email</Label>
				<Input type="email" id="email" name="email" />
			</div>

			<Button type="submit" disabled={isPending}>
				Resend Verification Email
			</Button>
		</form>
	);
};
export default ForgotPasswordForm;
