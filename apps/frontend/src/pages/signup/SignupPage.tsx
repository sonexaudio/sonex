import AuthLayout from "../../components/AuthLayout";
import PageLayout from "../../components/PageLayout";
import SignupForm from "./SignupForm";
import SignupHeader from "./SignupHeader";

const SignupPage = () => {
	return (
		<AuthLayout>
			<PageLayout>
				<SignupHeader />
				<SignupForm />
			</PageLayout>
		</AuthLayout>
	);
};
export default SignupPage;
