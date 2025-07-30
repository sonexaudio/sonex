/* 
    The useClientAuth hook is designed to manage and update the state of an unauthenticated client in Sonex.

    It's primary use is to determine whether a client is authorized to view a particular project and its resources. Otherwise, all pages of the Sonex are inaccessible to unauthenticated visitors.

    The backend provides a "magic link" to the client via email, which they can use to access the project without needing to log in. This is particularly useful for clients who may not have a Sonex account but need to view project details.

    I am using localStorage to store the client's details. I will be looking to implement a more secure method of storing this information in the future, such as using cookies or session storage. The main problem is How do I ensure the client doesn't need to identify themselves again if they have already done so before if I do cookie-based storage?
*/

import { useContext } from "react";
import { ClientAuthContext } from "../context/ClientAuthProvider";

export default function useClientAuth() {
    const ctx = useContext(ClientAuthContext);
    if (!ctx) {
        throw new Error("useClientAuth must be used within a ClientAuthProvider");
    }

    return ctx;
}
