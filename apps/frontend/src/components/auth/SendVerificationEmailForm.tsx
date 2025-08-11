import { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { authClient } from "../../lib/client-auth";

const SendVerificationEmailForm = () => {
    const [isPending, setIsPending] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const fd = new FormData(e.target as HTMLFormElement);
        const email = fd.get("email") as string;

        if (!email) return toast.error("Please enter your email address.");

        await authClient.sendVerificationEmail({
            email,
            callbackURL: `${import.meta.env.VITE_FRONTEND_URL}/auth/verify`,
            fetchOptions: {
                onRequest: () => {
                    setIsPending(true);
                },
                onResponse: () => {
                    setIsPending(false);
                },
                onError: (ctx) => {
                    toast.error("Failed to send verification email. Please try again later.");
                    console.log(ctx);
                },
                onSuccess: () => {
                    toast.success("Success. Verification email sent!");
                }
            }
        });
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-sm w-full space-y-4">
            <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input type="email" id="email" name="email" />
            </div>
            <Button type="submit" disabled={isPending}>
                Resend Verification Email
            </Button>
        </form>
    );
};
export default SendVerificationEmailForm;