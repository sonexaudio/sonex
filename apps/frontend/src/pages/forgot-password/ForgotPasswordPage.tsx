import AuthLayout from "../../components/AuthLayout";
import PageLayout from "../../components/PageLayout";
import ForgotPasswordForm from "./ForgotPasswordForm";

const ForgotPasswordPage = () => {
	return (
		<AuthLayout>
			<PageLayout>
				<ForgotPasswordForm />
			</PageLayout>
		</AuthLayout>
	);
};
export default ForgotPasswordPage;
