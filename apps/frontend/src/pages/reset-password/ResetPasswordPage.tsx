import { Navigate, useSearchParams } from "react-router";
import PageLayout from "../../components/PageLayout";
import ResetPasswordForm from "../auth/reset-password/ResetPasswordForm";

const ResetPasswordPage = () => {
	const [searchParams] = useSearchParams();
	const token = searchParams.get("code");

	if (!token) {
		return (
			<Navigate to="/" replace state={{ message: "Token not provided" }} />
		);
	}

	return (

		<PageLayout>
			<ResetPasswordForm token={token as string} />
		</PageLayout>
	);
};
export default ResetPasswordPage;
