import PageLayout from "../../components/PageLayout";
import LoginHeader from "./LoginHeader";
import LoginForm from "./LoginForm";
import AuthLayout from "../../components/AuthLayout";

const LoginPage = () => {
	return (
		<AuthLayout>
			<PageLayout>
				<LoginHeader />
				<LoginForm />
			</PageLayout>
		</AuthLayout>
	);
};
export default LoginPage;
