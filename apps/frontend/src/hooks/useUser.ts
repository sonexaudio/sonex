import { useContext } from "react";
import { UserProviderContext } from "../context/UserProvider";

export default function useUser() {
	const ctx = useContext(UserProviderContext);
	return ctx;
}
