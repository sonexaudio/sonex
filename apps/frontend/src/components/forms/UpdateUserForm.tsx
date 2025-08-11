import type React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "../../lib/client-auth";

const UpdateUserForm = ({ name, image }: { name: string, image: string; }) => {
    const [isPending, setIsPending] = useState(false);


    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const name = String(fd.get("name"));
        const image = String(fd.get("image"));

        if (!name && !image) return toast.error("Please provide at least one field to update.");

        await authClient.updateUser({
            ...(name && { name }),
            ...(image && { image }),
            fetchOptions: {
                onRequest: () => setIsPending(true),
                onResponse: () => setIsPending(false),
                onError: (ctx) => {
                    toast.error(ctx.error.message || "Failed to update user information.");
                },
                onSuccess: () => {
                    toast.success("User information updated successfully.");
                    window.location.reload();
                }
            }
        });
    }


    return (
        <form onSubmit={handleSubmit} className="max-w-sm w-full space-y-8">
            <div className="grid gap-4">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" type="text" defaultValue={name} placeholder="Enter your name" required />
            </div>

            <div className="grid gap-4">
                <Label htmlFor="image">Profile Image URL</Label>
                <Input type="url" name="image" id="image" defaultValue={image} placeholder="Enter your profile image URL" required />
            </div>

            <Button type="submit" disabled={isPending}>
                {isPending ? "Updating..." : "Update"}
            </Button>
        </form>
    );
};
export default UpdateUserForm;