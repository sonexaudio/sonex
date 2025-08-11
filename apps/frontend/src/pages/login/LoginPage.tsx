import PageLayout from "../../components/PageLayout";
import LoginHeader from "./LoginHeader";
import LoginForm from "./LoginForm";


const LoginPage = () => {
	return (

		<div className="flex flex-col items-center space-y-8 px-8 py-16">
			<LoginHeader />
			<LoginForm />
		</div>
	);
};
export default LoginPage;
