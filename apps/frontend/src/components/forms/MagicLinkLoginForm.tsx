import { StarIcon } from "lucide-react";
import React, { useRef, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { authClient } from "../../lib/client-auth";
import { toast } from "sonner";

const MagicLinkLoginForm = () => {
    const [isPending, setIsPending] = useState(false);
    const ref = useRef<HTMLDetailsElement>(null);
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const fd = new FormData(e.target as HTMLFormElement);
        const email = String(fd.get("email"));

        await authClient.signIn.magicLink({
            email,
            name: email.split("@")[0],
            callbackURL: `${import.meta.env.VITE_FRONTEND_URL}/overview`,
            newUserCallbackURL: `${import.meta.env.VITE_FRONTEND_URL}/welcome`,
            errorCallbackURL: `${import.meta.env.VITE_FRONTEND_URL}/auth/error`
        },
            {
                onRequest: () => setIsPending(true),
                onResponse: () => setIsPending(false),
                onError: (ctx) => {
                    toast.error(ctx.error.message);
                },
                onSuccess: () => {
                    toast.success("Magic link sent! Check your email.");
                    if (ref.current) {
                        ref.current.open = false;
                    }
                    (e.target as HTMLFormElement).reset();
                }
            });
    }
    return (
        <details
            ref={ref}
            className="w-fill max-w-sm rounded-md border border-primary overflow-hidden"
        >
            <summary className="flex gap-2 items-center px-2 py-1 bg-primary text-primary-foreground hover:bg-primary/80 transition">
                Try Magic Link <StarIcon size={16} />
            </summary>

            <form onSubmit={handleSubmit} className="px-2 py-1">
                <Label htmlFor="email">
                    Email
                </Label>
                <div className="grid gap-2 items-center">
                    <Input type="email" id="email" name="email" placeholder="user@sonex.app" />
                    <Button type="submit" disabled={isPending}>Send Magic Link</Button>
                </div>

            </form>
        </details>
    );
};
export default MagicLinkLoginForm;
