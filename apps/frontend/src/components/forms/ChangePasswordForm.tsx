import type React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "../../lib/client-auth";
import { Checkbox } from "../ui/checkbox";

const ChangePasswordForm = () => {
    const [isPending, setIsPending] = useState(false);
    const [revokeOtherSessions, setRevokeOtherSessions] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsPending(true);

        try {
            const fd = new FormData(e.currentTarget);
            const currentPassword = fd.get("currentPassword") as string;
            const newPassword = fd.get("newPassword") as string;

            if (!newPassword || !currentPassword) return;

            const { error } = await authClient.changePassword({
                newPassword,
                currentPassword,
                revokeOtherSessions: revokeOtherSessions,
            });

            if (error) throw error;

            toast.success("Password changed successfully");
            setTimeout(() => {
                window.location.reload();
            }, 2000);

        } catch (error) {
            toast.error((error as Error).message || "Failed to change password");
        } finally {
            setIsPending(false);
        }

    }


    return (
        <form onSubmit={handleSubmit} className="max-w-sm w-full space-y-8">
            <div className="grid gap-4">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" name="currentPassword" type="password" placeholder="Enter your current password" />
            </div>

            <div className="grid gap-4">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" name="newPassword" type="password" placeholder="Enter your new password" />
            </div>

            <Label htmlFor="revokeOtherSessions">
                <Checkbox
                    id="revokeOtherSessions"
                    checked={revokeOtherSessions}
                    onCheckedChange={() => setRevokeOtherSessions(!revokeOtherSessions)}
                />
                Log out of my other devices
            </Label>

            <Button type="submit" disabled={isPending} variant="destructive">
                {isPending ? "Updating..." : "Update Password"}
            </Button>
        </form>
    );
};
export default ChangePasswordForm;;