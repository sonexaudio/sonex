import { Link, useSearchParams } from "react-router";
import ReturnButton from "../../../components/ReturnButton";
import SendVerificationEmailForm from "../../../components/auth/SendVerificationEmailForm";
import { Button } from "../../../components/ui/button";

const VerificationPage = () => {
    const [searchParams] = useSearchParams();
    const error = searchParams.get("error");


    if (error) {
        return (
            <div className="px-8 py-16 container mx-auto max-w-screen space-y-8">
                <div>
                    <ReturnButton href="/login" label="Login" />
                </div>

                <h1 className="text-2xl font-bold">Email Verification Error</h1>
                {error && (
                    <div className="space-y-8">
                        <p className="text-destructive">
                            {error === "invalid_token" || error === "token_expired" ? "Your verification is invalid or has expired. Please request a new one." : "An unknown error occurred."}
                        </p>
                        <SendVerificationEmailForm />
                    </div>
                )}

            </div>
        );
    }

    return (
        <div className="px-8 py-16 container mx-auto max-w-screen space-y-8">
            <h1 className="text-2xl font-bold">Email Verification</h1>

            <p className="text-muted-foreground">
                Success! Your email has been verified. You can now view your account.
            </p>

            <Button asChild>
                <Link to="/overview">Go to Dashboard</Link>
            </Button>
        </div>
    );
};
export default VerificationPage;