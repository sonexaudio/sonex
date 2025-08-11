import { useContext } from "react";
import { UserProviderContext } from "../context/UserProvider";

export default function useUser() {
	const ctx = useContext(UserProviderContext);
	if (!ctx) {
		throw new Error("User context must be used in the UserProvider");
	}
	return ctx;
}
