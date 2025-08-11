import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/button";

const SignOutButton = () => {
    const { logout } = useAuth();
    async function handleLogoutClick() {
        await logout();
    }
    return (
        <Button variant="destructive" size="sm" onClick={handleLogoutClick}>Sign out</Button>
    );
};
export default SignOutButton;