import { Navigate, useSearchParams } from "react-router";
import AuthLayout from "../../components/AuthLayout";
import PageLayout from "../../components/PageLayout";
import ResetPasswordForm from "./ResetPasswordForm";

const ResetPasswordPage = () => {
	const [searchParams] = useSearchParams();
	const token = searchParams.get("code");

	if (!token) {
		return (
			<Navigate to="/" replace state={{ message: "Token not provided" }} />
		);
	}

	return (
		<AuthLayout>
			<PageLayout>
				<ResetPasswordForm token={token as string} />
			</PageLayout>
		</AuthLayout>
	);
};
export default ResetPasswordPage;
