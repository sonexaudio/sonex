import { createAuthClient } from "better-auth/react";
import { magicLinkClient, emailOTPClient } from "better-auth/client/plugins"


export const authClient = createAuthClient({
    baseURL: "http://localhost:3000/",
    plugins: [magicLinkClient(), emailOTPClient()]
});