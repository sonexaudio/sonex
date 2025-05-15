import PageLayout from "../../components/PageLayout";
import LoginHeader from "./LoginHeader";
import LoginForm from "./LoginForm";
import AuthLayout from "../../components/AuthLayout";

const LoginPage = () => {
	return (
		<div>
			<AuthLayout>
				<PageLayout>
					<LoginHeader />
					<LoginForm />
				</PageLayout>
			</AuthLayout>
		</div>
	);
};
export default LoginPage;
