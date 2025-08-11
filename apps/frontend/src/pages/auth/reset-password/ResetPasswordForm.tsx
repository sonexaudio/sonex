import { useState } from "react";

import AuthState from "../../../components/auth/AuthState";
import { useNavigate } from "react-router";

import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { toast } from "sonner";
import { authClient } from "../../../lib/client-auth";

const ResetPasswordForm = ({ token }: { token: string; }) => {
	const [isPending, setIsPending] = useState(false);
	const [submitSuccessful, setSubmitSuccessful] = useState(false);

	const navigate = useNavigate();

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const fd = new FormData(e.target as HTMLFormElement);
		const password = fd.get("password") as string;

		if (!password) return toast.error("Please enter your password");

		const confirmPassword = fd.get("confirmPassword") as string;

		if (!confirmPassword) return toast.error("Please confirm your password");
		if (password !== confirmPassword) return toast.error("Passwords do not match");

		await authClient.resetPassword({
			newPassword: password,
			token,
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
					setTimeout(() => {
						toast.success("Success! Your password has been reset.");
						navigate("/login");
					}, 2000);
				},
			}
		});
	}

	return (
		<div className="max-w-md mt-4">
			<form onSubmit={handleSubmit} className="max-w-sm w-full space-y-8">
				{submitSuccessful && (
					<AuthState message="Password reset successfully!" type="success" />
				)}

				<div className="grid gap-4">
					<Label htmlFor="password">Enter your new Password</Label>
					<Input type="password" id="password" name="password" autoComplete="new-password" />
				</div>

				<div className="grid gap-4">
					<Label htmlFor="confirmPassword">Confirm your new Password</Label>
					<Input type="password" id="confirmPassword" name="confirmPassword" autoComplete="new-password" />
				</div>
				<Button type="submit" disabled={isPending}>
					Reset Password
				</Button>
			</form>
		</div>
	);
};
export default ResetPasswordForm;
