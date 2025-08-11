import { Navigate, useSearchParams } from "react-router";
import ResetPasswordForm from "./ResetPasswordForm";

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();

    const token = searchParams.get("token");

    if (!token) return <Navigate to="/login" replace state={{ message: "Token not provided" }} />;

    return (
        <div className="px-8 py-16 container mx-auto max-w-screen space-y-8">
            <h1 className="text-2xl font-bold">Reset Your Password</h1>

            <p className="text-muted-foreground">
                Please enter your new password. Make sure it is at least 8 characters long and contains a mix of letters, numbers, and symbols.
            </p>

            <ResetPasswordForm token={token} />
        </div>
    );
};
export default ResetPasswordPage;